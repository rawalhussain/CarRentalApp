#!/usr/bin/env node

const fs = require('fs');
const os = require('os');
const admin = require('firebase-admin');
const moment = require('moment');

const { keys } = require('lodash');
const { default: axios } = require('axios');
const { exit } = require('process');

require('firebase/auth');
require('firebase/storage');

const firebaseConfig = {
  bilditStaging: {
    apiKey: 'AIzaSyAkFpQ6b_dQCNNlN55htY9LDoZcH07g1tE',
    authDomain: 'compilepoc-2d379.firebaseapp.com',
    projectId: 'compilepoc-2d379',
    storageBucket: 'compilepoc-2d379.appspot.com',
    appId: '1:804238113332:web:ab68dc7b8ff7b0109fe861',
    databaseURL: 'https://compilepoc-2d379.firebaseio.com',
    serviceAccountFile: './bildit-dev-key.json',
  },
};

/**
 *
 * @param baseUrl
 * @param filePath
 */
async function transpile(baseUrl, filePath) {
  try {
    const componentRawContent = fs.readFileSync(filePath).toString();
    const codeType = filePath.split('.').pop();
    // call transpile api
    const response = await axios.post(`${baseUrl}/utility-code_transpiler`, {
      code: componentRawContent,
      codeType,
    });

    if (response.status === 200) {
      return {
        raw: componentRawContent,
        compiled: response.data.data,
      };
    } else {
      return {};
    }
  } catch (error) {
    return {};
  }
}

(async () => {
  try {
    // Create tmp directory
    if (!fs.existsSync('tmp')) {
      fs.mkdirSync('tmp');
    }

    // Copy AppConfig.ts to AppConfig.js
    fs.copyFileSync('../App/Config/AppConfig.tsx', 'tmp/AppConfig.js');

    const configText = fs.readFileSync('tmp/AppConfig.js', 'utf8');

    const configModule = configText.replace('export default', 'module.exports =');
    // Replace the config content
    fs.writeFileSync('tmp/AppConfig.js', configModule);

    const selectedDbConfig = firebaseConfig.bilditStaging;

    // Make sure the service file is available in this directory
    const serviceAccount = require(selectedDbConfig.serviceAccountFile);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: selectedDbConfig.databaseURL,
    });

    // eslint-disable-next-line import/no-unresolved
    const appConfig = require('./tmp/AppConfig');

    const { appId, components } = appConfig.remote;

    // Loop through all components
    const paths = keys(components);
    for (let index = 0; index < paths.length; index++) {
      const path = paths[index];
      // read if file exist
      const filePath = `../App/${path}`;
      if (fs.existsSync(filePath)) {
        const componentsRef = await admin.database().ref(`apps/${appId}/components/`);
        const componentObjectSnapshot = await componentsRef.orderByChild('path').equalTo(path).get();
        if (componentObjectSnapshot.val() == null) {
          // if not registered, create a new data as version 1
          const component = {
            createdAt: moment().unix(),
            updatedAt: moment().unix(),
            name: path,
            path,
            platforms: {
              android: true,
              ios: true,
            },
            type: 'Basic Component',
            versionCount: 1,
          };

          const newComponentRef = componentsRef.push(component);
          const { raw, compiled } = await transpile(appConfig.remote.baseUrl, filePath);
          await admin.database().ref(`apps/${appId}/componentRevisions/${newComponentRef.key}/v1`).set({
            raw,
            compiled,
          });
        } else {
          const updatedComponents = componentObjectSnapshot.val();
          const componentKeys = keys(updatedComponents);
          const key = componentKeys[0];

          const updatedComponentSnapshot = await admin.database().ref(`apps/${appId}/components/${key}`).once('value');
          const updatedComponent = updatedComponentSnapshot.val();
          const newVersionCount = updatedComponent.versionCount + 1;
          const multiWrite = {};
          multiWrite[`apps/${appId}/components/${key}`] = {
            ...updatedComponent,
            versionCount: newVersionCount,
          };
          const { raw, compiled } = await transpile(appConfig.remote.baseUrl, filePath);
          multiWrite[`apps/${appId}/componentRevisions/${key}/v${newVersionCount}`] = {
            raw,
            compiled,
          };
          await admin.database().ref().update(multiWrite);
        }
      }
    }

    // Cleanup tmp directory
    fs.rmSync('tmp', { recursive: true });
    exit();
  } catch (error) {
    console.error(error);
    exit();
  }
})();

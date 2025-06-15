const { parse } = require('@babel/parser')
const fs = require('fs')

const defaultTransform = getDefaultTransformer()

module.exports.transform = function ({ filename, options, plugins, src }) {
  fs.appendFileSync('./scripts/transformInterceptor.txt', filename + '\n')
  return defaultTransform({ filename, options, plugins, src })
}

function getDefaultTransformer() {
  let file = fs.readFileSync('./metro.config.js').toString()
  let fileParts = file.split('@html-transformer-override-this')
  let defaultModule = 'metro-react-native-babel-transformer'
  if (fileParts.length > 1) {
    defaultModule = fileParts[1]
      .split('\n')[1]
      .replace(/'/g, '')
      .replace(/"/g, '')
      .replace(/ /g, '')
      .replace(/ /g, '')
      .replace(')', '')
      .split('(')[1]
  } else {
    console.info('@html-transformer-override-this not found using default transformer')
  }
  return require(defaultModule).transform
}

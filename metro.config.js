/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 *  @type {import('@react-native/metro-config').MetroConfig}
 */

const {getDefaultConfig} = require('@react-native/metro-config');

module.exports = (() => {
    const config = getDefaultConfig(__dirname);

    const {transformer, resolver} = config;

    config.transformer = {
        ...transformer,
        babelTransformerPath: require.resolve('react-native-svg-transformer'),
    };
    config.resolver = {
        ...resolver,
        assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
        sourceExts: [...resolver.sourceExts, 'svg'],
        unstable_enablePackageExports: true,
        unstable_conditionNames: ['browser', 'require', 'react-native'],
    };

    return config;
})();

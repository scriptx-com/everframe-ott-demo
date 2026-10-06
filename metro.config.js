// On web, @everframe/react-native resolves to its browser build, which wraps
// the Everframe web SDK.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === '@everframe/react-native') {
    return context.resolveRequest(context, '@everframe/react-native/web', platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

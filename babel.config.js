module.exports = (api) => {
  api.cache(true);
  const isWebExport = process.env.VERCEL === '1' || process.env.EXPO_PUBLIC_PLATFORM === 'web';
  return {
    presets: ['babel-preset-expo'],
    plugins: isWebExport ? [] : ['react-native-reanimated/plugin'],
  };
};

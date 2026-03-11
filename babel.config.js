const config = {
  presets: ['babel-preset-expo'],
  plugins: ['react-native-reanimated/plugin'],
};

module.exports = (api) => {
  api.cache(true);
  return config;
};

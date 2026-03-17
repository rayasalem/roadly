const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const projectRoot = __dirname;

// Avoid resolution/transform errors on web (e.g. .mjs/.cjs deps)
config.resolver.sourceExts = [...(config.resolver.sourceExts || []), 'mjs', 'cjs'];

// Ensure react-native-reanimated is resolvable from @gorhom/bottom-sheet (native bundle)
const reanimatedPath = path.resolve(projectRoot, 'node_modules', 'react-native-reanimated');
const leafletPath = path.resolve(projectRoot, 'node_modules', 'leaflet');
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-reanimated': reanimatedPath,
  leaflet: leafletPath,
};

// Use platform-specific entry so serverBootstrap is never bundled (only run via "node expo/AppEntry.js" on Render)
const defaultResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isAppEntry =
    (moduleName === 'expo/AppEntry.js' ||
      moduleName === './expo/AppEntry.js' ||
      moduleName.replace(/\\/g, '/').endsWith('expo/AppEntry.js'));
  if (isAppEntry) {
    const entry =
      platform === 'web'
        ? path.join(projectRoot, 'expo', 'AppEntry.web.js')
        : path.join(projectRoot, 'expo', 'AppEntry.native.js');
    return { type: 'sourceFile', filePath: entry };
  }
  // Force resolve react-native-reanimated from project root (fix for @gorhom/bottom-sheet in node_modules)
  if (moduleName === 'react-native-reanimated' || moduleName.startsWith('react-native-reanimated/')) {
    try {
      const resolved = require.resolve(moduleName, { paths: [projectRoot] });
      return { type: 'sourceFile', filePath: resolved };
    } catch (_) {
      // fall through
    }
  }
  // Force resolve leaflet from project root (web bundle — no CDN, no Tracking Prevention)
  if (moduleName === 'leaflet' || moduleName.startsWith('leaflet/')) {
    const fs = require('fs');
    if (moduleName === 'leaflet') {
      const leafletMain = path.resolve(leafletPath, 'dist', 'leaflet.js');
      if (fs.existsSync(leafletMain)) {
        return { type: 'sourceFile', filePath: leafletMain };
      }
    } else {
      const subpath = moduleName.replace(/^leaflet\/?/, '');
      const fullPath = path.resolve(leafletPath, subpath);
      if (fs.existsSync(fullPath)) {
        return { type: 'sourceFile', filePath: fullPath };
      }
    }
    try {
      const resolved = require.resolve(moduleName, { paths: [projectRoot] });
      return { type: 'sourceFile', filePath: resolved };
    } catch (_) {
      // fall through
    }
  }
  return defaultResolveRequest
    ? defaultResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

'use strict';
/**
 * Web bundle entry only. Metro resolves expo/AppEntry.js to this when building for web.
 * Node (Render) runs expo/AppEntry.js (no .web) which loads serverBootstrap.
 */
(function () {
  function patch() {
    try {
      if (typeof window === 'undefined' || !console.warn) return;
      var _warn = console.warn;
      console.warn = function (msg) {
        var s = typeof msg === 'string' ? msg : (msg && msg.message) || String(msg);
        if (s.indexOf('pointerEvents') !== -1 && s.indexOf('deprecated') !== -1) return;
        return _warn.apply(console, arguments);
      };
    } catch (_) {}
  }
  if (typeof window !== 'undefined') {
    patch();
    setTimeout(patch, 0);
  }
})();
var registerRootComponent = require('expo/src/launch/registerRootComponent').default;
var App = require('../App').default;
registerRootComponent(App);

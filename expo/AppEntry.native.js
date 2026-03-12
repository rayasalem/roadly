'use strict';
/**
 * Native (iOS/Android) bundle entry only. Metro resolves expo/AppEntry.js to this when building for ios/android.
 * Node (Render) runs expo/AppEntry.js which loads serverBootstrap; serverBootstrap is never bundled.
 */
var registerRootComponent = require('expo/src/launch/registerRootComponent').default;
var App = require('../App').default;
registerRootComponent(App);

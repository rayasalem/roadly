#!/usr/bin/env node
/**
 * Single entry for "npm start". On Render (production + dist exists) serve dist; otherwise run Expo dev.
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const isProduction = process.env.NODE_ENV === 'production';
const distDir = path.resolve(__dirname, '..', 'dist');
const distExists = fs.existsSync(distDir) && fs.statSync(distDir).isDirectory();

if (isProduction && distExists) {
  require('../server.js');
} else {
  const child = spawn(
    'node',
    [path.join(__dirname, '..', 'node_modules', 'expo', 'bin', 'cli'), 'start'],
    { stdio: 'inherit', cwd: path.resolve(__dirname, '..') }
  );
  child.on('exit', (code) => process.exit(code ?? 0));
}

#!/usr/bin/env node
/**
 * CLI shim: maps `crooser test --project … --env …` to Cypress with shared env metadata.
 * Staging base URL: set CYPRESS_BASE_URL or CROOSER_STAGING_URL before running.
 */
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');

let args = process.argv.slice(2);
if (args[0] === 'test') args = args.slice(1);

const defaults = {
  project: 'MechNowApp',
  env: 'development',
  roles: 'customer,mechanic,rental,insurance,admin',
  features: 'map,requests,chat,notifications,e2e',
  report: 'full',
};

function getArg(name, fallback) {
  const flag = `--${name}`;
  const i = args.indexOf(flag);
  if (i === -1) return fallback;
  const v = args[i + 1];
  return v != null && !v.startsWith('--') ? v : fallback;
}

const project = getArg('project', defaults.project);
const envName = getArg('env', defaults.env);
const roles = getArg('roles', defaults.roles);
const features = getArg('features', defaults.features);
const report = getArg('report', defaults.report);

if (envName === 'staging' && !process.env.CYPRESS_BASE_URL && process.env.CROOSER_STAGING_URL) {
  process.env.CYPRESS_BASE_URL = process.env.CROOSER_STAGING_URL;
}

const cyEnv = [
  `project=${project}`,
  `environment=${envName}`,
  `roles=${roles.replace(/,/g, '_')}`,
  `features=${features.replace(/,/g, '_')}`,
  `report=${report}`,
].join(',');

const root = path.resolve(__dirname, '..');
const tsCypress = path.join(root, 'tsconfig.cypress.json');
if (!process.env.TS_NODE_PROJECT) process.env.TS_NODE_PROJECT = tsCypress;

const cypressArgs = ['cypress', 'run', '--e2e', '--browser', 'electron', '--env', cyEnv];
if (report === 'full') {
  cypressArgs.push('--reporter', 'spec');
}

const r = spawnSync('npx', cypressArgs, {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(r.status === 0 ? 0 : r.status ?? 1);

#!/usr/bin/env node
/**
 * Print the first non-internal IPv4 address (for EXPO_PUBLIC_DEV_API_HOST on a physical device).
 * Usage (PowerShell):  node scripts/show-dev-ip.mjs
 * Then set in .env:     EXPO_PUBLIC_DEV_API_HOST=<printed-ip>
 */
import os from 'os';

const nets = os.networkInterfaces();
for (const name of Object.keys(nets)) {
  for (const net of nets[name] ?? []) {
    const family = net.family;
    const fam = typeof family === 'string' ? family : family === 4 ? 'IPv4' : 'IPv6';
    if (fam === 'IPv4' && !net.internal && net.address) {
      process.stdout.write(net.address + '\n');
      process.exit(0);
    }
  }
}
process.stderr.write('No non-internal IPv4 found. Set EXPO_PUBLIC_DEV_API_HOST manually.\n');
process.exit(1);

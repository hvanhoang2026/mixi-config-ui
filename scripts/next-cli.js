const { rmSync } = require('fs');
const { spawnSync } = require('child_process');

const command = process.argv[2];
const args = process.argv.slice(3);

if (!command) {
  console.error('Usage: node scripts/next-cli.js <dev|build|start> [...args]');
  process.exit(1);
}

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

if (command === 'dev') {
  env.NEXT_DIST_DIR = '.next-dev';
}

if (command === 'dev' || command === 'build') {
  rmSync(env.NEXT_DIST_DIR || '.next', { recursive: true, force: true });
}

const result = spawnSync(
  process.execPath,
  [require.resolve('next/dist/bin/next'), command, ...args],
  {
    env,
    stdio: 'inherit',
    shell: false,
  },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);

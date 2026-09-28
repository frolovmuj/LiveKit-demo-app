import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { pascalizeFilenames } from './pascalize-filenames.mjs';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const shadcnCli = path.join(frontendRoot, 'node_modules', 'shadcn', 'dist', 'index.js');
const args = process.argv.slice(2);

const child = spawn(process.execPath, [shadcnCli, ...args], {
  cwd: frontendRoot,
  stdio: 'inherit',
});

child.on('exit', async (code) => {
  if (code === 0 && args[0] === 'add') {
    await pascalizeFilenames();
  }

  process.exit(code ?? 1);
});

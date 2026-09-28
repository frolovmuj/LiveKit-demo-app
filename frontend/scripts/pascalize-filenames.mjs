import { readdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ACRONYMS = {
  p2p: 'P2P',
};

const KEEP_DIR_NAMES = new Set([
  'src',
  'app',
  'pages',
  'widgets',
  'features',
  'entities',
  'shared',
  'ui',
  'lib',
  'model',
  'api',
  'config',
  'hooks',
  'routes',
  'assets',
  'types',
  'constants',
  'helpers',
  'public',
]);

const KEEP_BASE_NAMES = new Set(['root', 'index', 'routes']);

const KEEP_FILE_NAMES = new Set([
  'index.ts',
  'index.tsx',
  'index.js',
  'index.jsx',
  'root.tsx',
  'root.ts',
  'routes.ts',
  'routes.tsx',
  'app.css',
]);

const SKIP_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.react-router',
  '.yarn',
  '.vite',
]);

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

function toPascalCase(name) {
  return name
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => {
      const lower = part.toLowerCase();
      if (ACRONYMS[lower]) {
        return ACRONYMS[lower];
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}

function isAlreadyPascalCase(name) {
  return /^[A-Z](?:[A-Z0-9]*[a-z0-9]*)*$/.test(name);
}

function pascalizeFileName(fileName) {
  if (KEEP_FILE_NAMES.has(fileName)) {
    return fileName;
  }

  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);

  if (!SOURCE_EXTENSIONS.has(extension) || isAlreadyPascalCase(baseName)) {
    return fileName;
  }

  return `${toPascalCase(baseName)}${extension}`;
}

function pascalizeDirName(dirName) {
  if (KEEP_DIR_NAMES.has(dirName) || isAlreadyPascalCase(dirName)) {
    return dirName;
  }

  return toPascalCase(dirName);
}

async function walk(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];
  const dirs = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) {
        continue;
      }
      dirs.push(fullPath);
      const nested = await walk(fullPath);
      files.push(...nested.files);
      dirs.push(...nested.dirs);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return { files, dirs };
}

async function renameWithCase(fromPath, toPath) {
  if (fromPath === toPath) {
    return;
  }

  if (fromPath.toLowerCase() === toPath.toLowerCase()) {
    const tempPath = `${fromPath}.__tmp__`;
    await rename(fromPath, tempPath);
    await rename(tempPath, toPath);
    return;
  }

  await rename(fromPath, toPath);
}

const LOCAL_SPECIFIER_PATTERN =
  /^(?:@shared\/|@widgets\/|@pages\/|@features\/|@entities\/|@app\/|~\/|\.{1,2}\/)/;

function pascalizeSpecifierPart(part, isLast) {
  if (part === '.' || part === '..' || part.startsWith('@') || part === '~') {
    return part;
  }

  const extension = isLast ? path.extname(part) : '';
  const baseName = extension ? path.basename(part, extension) : part;

  if (
    KEEP_DIR_NAMES.has(part) ||
    KEEP_FILE_NAMES.has(part) ||
    KEEP_BASE_NAMES.has(baseName) ||
    isAlreadyPascalCase(baseName)
  ) {
    return part;
  }

  return `${toPascalCase(baseName)}${extension}`;
}

function rewriteSpecifier(specifier) {
  if (!LOCAL_SPECIFIER_PATTERN.test(specifier)) {
    return specifier;
  }

  return specifier
    .split('/')
    .map((part, index, parts) => pascalizeSpecifierPart(part, index === parts.length - 1))
    .join('/');
}

function rewriteFileContents(source, fileRenames) {
  let next = source.replace(
    /((?:from|import)\s+['"])([^'"]+)(['"])/g,
    (match, prefix, specifier, suffix) => {
      return `${prefix}${rewriteSpecifier(specifier)}${suffix}`;
    },
  );

  for (const [fromName, toName] of fileRenames) {
    next = next.replaceAll(`routes/${fromName}.tsx`, `routes/${toName}.tsx`);
  }

  return next;
}

export async function pascalizeFilenames({
  roots = [path.join(frontendRoot, 'src'), path.join(frontendRoot, 'app')],
} = {}) {
  const fileRenames = new Map();
  const dirRenames = new Map();
  const fileMoves = [];
  const dirMoves = [];
  const sourceFiles = [];

  for (const root of roots) {
    const { files, dirs } = await walk(root);

    for (const filePath of files) {
      const fileName = path.basename(filePath);
      const nextFileName = pascalizeFileName(fileName);

      if (SOURCE_EXTENSIONS.has(path.extname(fileName))) {
        sourceFiles.push(filePath);
      }

      if (nextFileName === fileName) {
        continue;
      }

      const baseName = path.basename(fileName, path.extname(fileName));
      const nextBaseName = path.basename(nextFileName, path.extname(nextFileName));
      fileRenames.set(baseName, nextBaseName);
      fileMoves.push({
        from: filePath,
        to: path.join(path.dirname(filePath), nextFileName),
      });
    }

    for (const dirPath of dirs) {
      const dirName = path.basename(dirPath);
      const nextDirName = pascalizeDirName(dirName);

      if (nextDirName === dirName) {
        continue;
      }

      dirRenames.set(dirName, nextDirName);
      dirMoves.push({
        from: dirPath,
        to: path.join(path.dirname(dirPath), nextDirName),
      });
    }
  }

  const extraFiles = [
    path.join(frontendRoot, 'app', 'routes.ts'),
    path.join(frontendRoot, 'app', 'root.tsx'),
  ];

  for (const extraFile of extraFiles) {
    if (!sourceFiles.includes(extraFile)) {
      sourceFiles.push(extraFile);
    }
  }

  for (const filePath of sourceFiles) {
    const original = await readFile(filePath, 'utf8');
    const next = rewriteFileContents(original, fileRenames);

    if (next !== original) {
      await writeFile(filePath, next);
    }
  }

  for (const move of fileMoves.sort((a, b) => b.from.length - a.from.length)) {
    await renameWithCase(move.from, move.to);
  }

  for (const move of dirMoves.sort((a, b) => b.from.length - a.from.length)) {
    await renameWithCase(move.from, move.to);
  }

  return { fileRenames, dirRenames };
}

const isMain =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const { fileRenames, dirRenames } = await pascalizeFilenames();

  if (fileRenames.size === 0 && dirRenames.size === 0) {
    console.log('All frontend filenames are already PascalCase.');
  } else {
    for (const [from, to] of [...dirRenames, ...fileRenames]) {
      console.log(`${from} -> ${to}`);
    }
  }
}

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const isRoot = fs.existsSync('frontend');
const frontendDir = isRoot ? path.resolve('frontend') : process.cwd();

console.log('==> Building HealthGraph frontend (target: ' + frontendDir + ')...');

execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });

const builtDist = path.join(frontendDir, 'dist');
console.log('==> Production assets built at: ' + builtDist);

if (isRoot) {
  const rootDist = path.resolve('dist');
  fs.mkdirSync(rootDist, { recursive: true });
  fs.cpSync(builtDist, rootDist, { recursive: true, force: true });
  console.log('==> Mirrored to root dist: ' + rootDist);
}

console.log('==> Universal build completed successfully!');

import { build } from 'esbuild';
import { execSync } from 'child_process';

// Bundle JavaScript with esbuild
await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/index.js',
  external: ['xml2js'],
  sourcemap: true,
  minify: false
});

console.log('✓ Bundled with esbuild');

// Generate TypeScript declarations with tsc
execSync('tsc --emitDeclarationOnly', { stdio: 'inherit' });

console.log('✓ Generated TypeScript declarations');

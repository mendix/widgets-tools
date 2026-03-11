import { build } from 'esbuild';
import { execSync } from 'child_process';

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/index.js',
  external: ['xml2js'],
  sourcemap: false,
  minify: false
});

console.log('✓ Bundled with esbuild');

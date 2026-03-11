import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { readFileSync, copyFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

// Mark dependencies as external
const external = [
  /^node:/,  // Node builtins
  ...Object.keys(pkg.dependencies || {}).filter(dep =>
    dep !== '@mendix/widget-typings-generator'
  ),
  ...Object.keys(pkg.peerDependencies || {})
];

export default [
  // Main package build
  {
    input: 'src/index.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      exports: 'named',
      sourcemap: false,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    external,
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'dist',
        outDir: 'dist',
        rootDir: 'src',
        module: 'esnext',
        importHelpers: false
      })
    ]
  },
  // Bundle widget-typings-generator
  {
    input: '../widget-typings-generator/dist/index.js',
    output: {
      file: 'dist/widget-typings-generator.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: false
    },
    external: ['big.js', 'mendix', ...Object.keys(pkg.dependencies || {}).filter(dep =>
      dep !== '@mendix/widget-typings-generator'
    )],
    plugins: [
      nodeResolve({
        preferBuiltins: true
      }),
      {
        name: 'copy-types',
        writeBundle() {
          // Copy type definitions
          copyFileSync(
            '../widget-typings-generator/dist/index.d.ts',
            'dist/widget-typings-generator.d.ts'
          );
          console.log('✓ Copied type definitions');
        }
      }
    ]
  }
];

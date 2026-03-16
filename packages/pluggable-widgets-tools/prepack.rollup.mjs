import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  {
    treeshake: false,
    input: 'node_modules/@mendix/widget-typings-generator/dist/index.js',
    output: {
      file: 'dist/widget-typings-generator.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: false
    },
    plugins: [
      commonjs(),
      nodeResolve({
        preferBuiltins: true
      }),
    ]
  }
];

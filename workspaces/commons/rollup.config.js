import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import rootPkg from '../../package.json';
import tsConfigPaths from 'rollup-plugin-ts-paths';
import path from 'path';

export default [
	{
		input: 'src/index.ts',
		plugins: [
      resolve({
        // rootDir: path.join(process.cwd(), '../..')
        rootDir: process.cwd()
      }),
      commonjs({
        include: /node_modules/
      }),
      tsConfigPaths({
        tsConfigDirectory: process.cwd()
      }),
      typescript({
        typescript: require('typescript'),
      }),
		],

		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
    ],

    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
      ...Object.keys(rootPkg.dependencies || {}),
      ...Object.keys(rootPkg.peerDependencies || {}),
    ],
	}

];

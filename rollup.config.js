import nodeResolve from '@rollup/plugin-node-resolve'
import ts from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import { babel, getBabelOutputPlugin } from '@rollup/plugin-babel';

export default [{
    input: './src/index.ts',
    output: {
        format: 'esm',
        file: './dist/frame-subscriber.esm.bundle.js'
    },
    plugins: [
        ts({
            extensions: ['.ts']
        }),
        nodeResolve()
    ]
}, {
    input: './src/index.ts',
    output: {
        format: 'esm',
        file: './dist/frame-subscriber.esm.js',
        plugins: [getBabelOutputPlugin({ presets: ['@babel/preset-env'] })]
    },
    plugins: [
        ts({
            extensions: ['.ts']
        }),
        nodeResolve(),
        terser({
            module: false,
            compress: {
                ecma: 2015,
                pure_getters: true
            }
        }),
        babel({ babelHelpers: 'bundled' })
    ]
}]
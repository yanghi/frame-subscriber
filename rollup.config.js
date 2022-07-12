import nodeResolve from '@rollup/plugin-node-resolve'
import ts from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import { babel, getBabelOutputPlugin } from '@rollup/plugin-babel';
import path from 'path'

let shouldDeclaration = true

function makeConf(options, plugins = []) {

    const tsPlugin = ts({
        extensions: ['.ts'],
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
        cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
        tsconfigOverride: {
            compilerOptions: {
                declaration: shouldDeclaration
            },
            exclude: ['tests']
        }
    })

    shouldDeclaration = false

    return {
        input: './src/index.ts',
        ...options,
        plugins: [
            tsPlugin,
            nodeResolve(),
            ...plugins
        ]
    }
}

export default [makeConf({
    output: {
        format: 'esm',
        file: './dist/frame-subscriber.esm.bundle.js'
    }
}),
makeConf({
    output: {
        format: 'esm',
        file: './dist/frame-subscriber.esm.js',
        plugins: [getBabelOutputPlugin({ presets: ['@babel/preset-env'] })]
    }
}, [
    terser({
        module: false,
        compress: {
            ecma: 2015,
            pure_getters: true
        }
    }),
    babel({ babelHelpers: 'bundled' })])
]

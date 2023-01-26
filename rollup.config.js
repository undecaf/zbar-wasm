import commonjs from '@rollup/plugin-commonjs'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import pkg from './package.json'
import ts from 'rollup-plugin-ts'
import { terser } from 'rollup-plugin-terser'

const input = 'src/main.ts'

const tsconfig = (module, zbarJsPath) => (resolvedConfig) => ({
    ...resolvedConfig,
    module,
    paths: {
        'zbarJs': [zbarJsPath],
    }
})


export default [
    {
        // Plain browser <script>
        input,
        output: {
            file: pkg.exports.script,
            format: 'iife',
            generatedCode: 'es2015',
            sourcemap: true,
            name: 'zbarWasm',
        },
        plugins: [
            ts({
                tsconfig: tsconfig('es2015', './build/zbar.js')
            }),
            commonjs(),
            nodePolyfills(), 
            terser(),
        ],
    },

    {
        // ES6 module and <script type="module">
        input,
        output: {
            // Must use output.dir since Rollup will create a polyfill file
            dir: pkg.exports.default + '/../',
            format: 'esm',
            generatedCode: 'es2015',
            sourcemap: true,
        },
        plugins: [
            ts({
                tsconfig: tsconfig('esm', './build/zbar.mjs')
            }),
            commonjs(),
            nodePolyfills(),
            terser(),
        ],
    },

    {
        // CommonJS Node module
        input,
        output: {
            file: pkg.exports.require,
            format: 'cjs',
            generatedCode: 'es2015',
            sourcemap: true,
        },
        external: ['path', 'fs'],
        plugins: [
            ts({
                tsconfig: tsconfig('commonjs', './build/zbar.js')
            }),
            commonjs(),
            terser(),
        ]
    }
]

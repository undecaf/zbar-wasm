import pkg from './package.json' assert { type: 'json' }
import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import nodePolyfills from 'rollup-plugin-polyfill-node'
import terser from '@rollup/plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import { dts } from 'rollup-plugin-dts'
import { nodeResolve } from '@rollup/plugin-node-resolve'

const
    ZBAR_INLINED = 'zbar-inlined',
    INPUT = 'src/main.ts',
    TARGET = 'es2015'

const tsPlugins = (module, zbarJsFile) => ([
    alias({
        entries: [
            { find: 'zbarJs', replacement: `../build/${zbarJsFile}` }
        ],
    }),
    typescript({
        compilerOptions: {
            module,
            target: TARGET,
        },
    }),
])

const pkgExports = pkg.exports['.']

export default [
    {
        // Plain browser <script>
        input: INPUT,
        output: {
            file: pkgExports.browser.default.default,
            format: 'iife',
            generatedCode: TARGET,
            sourcemap: true,
            name: 'zbarWasm',
        },
        plugins: [
            commonjs(),
            nodePolyfills(),
            ...tsPlugins('es2015', 'zbar.js'),
            terser(),
        ],
    },

    {
        // Plain browser <script> with zbar.wasm inlined as data URI
        input: INPUT,
        output: {
            file: pkgExports.browser.default[ZBAR_INLINED],
            format: 'iife',
            generatedCode: TARGET,
            sourcemap: true,
            name: 'zbarWasm',
        },
        plugins: [
            commonjs(),
            nodePolyfills(),
            ...tsPlugins('es2015', 'zbar-inlined.js'),
            terser(),
        ],
    },

    {
        // ES6 browser module
        input: INPUT,
        output: {
            file: pkgExports.script.default,
            format: 'esm',
            generatedCode: TARGET,
            sourcemap: true,
            inlineDynamicImports: true,
        },
        plugins: [
            nodePolyfills(),
            ...tsPlugins('es2015', 'zbar.mjs'),
            terser(),
        ],
    },

    {
        // ES6 browser module with zbar.wasm inlined as data URI
        input: INPUT,
        output: {
            file: pkgExports.script[ZBAR_INLINED],
            format: 'esm',
            generatedCode: TARGET,
            sourcemap: true,
            inlineDynamicImports: true,
        },
        plugins: [
            nodePolyfills(),
            ...tsPlugins('es2015', 'zbar-inlined.mjs'),
            terser(),
        ],
    },

    {
        // ES6 Node module
        input: INPUT,
        output: {
            file: pkgExports.node['import'].default,
            format: 'esm',
            generatedCode: 'es2015',
            sourcemap: true,
            inlineDynamicImports: true,
        },
        plugins: [
            nodeResolve(),
            ...tsPlugins('node16', 'zbar.mjs'),
             terser(),
        ],
    },

    {
        // ES6 Node module with zbar.wasm inlined as data URI
        input: INPUT,
        output: {
            file: pkgExports.node['import'][ZBAR_INLINED],
            format: 'esm',
            generatedCode: 'es2015',
            sourcemap: true,
            inlineDynamicImports: true,
        },
        plugins: [
            nodeResolve(),
            ...tsPlugins('node16', 'zbar-inlined.mjs'),
            terser(),
        ],
    },

    {
        // CommonJS Node module
        input: INPUT,
        output: {
            file: pkgExports.node['require'].default,
            format: 'cjs',
            generatedCode: 'es2015',
            sourcemap: true,
        },
        external: ['path', 'fs'],
        plugins: [
            commonjs(),
            ...tsPlugins('commonjs', 'zbar.js'),
            terser(),
        ]
    },

    {
        // CommonJS Node module with zbar.wasm inlined as data URI
        input: INPUT,
        output: {
            file: pkgExports.node['require'][ZBAR_INLINED],
            format: 'cjs',
            generatedCode: 'es2015',
            sourcemap: true,
        },
        external: ['path', 'fs'],
        plugins: [
            commonjs(),
            ...tsPlugins('commonjs', 'zbar-inlined.js'),
            terser(),
        ]
    },

    {
        // Bundled declaration files
        input: './dist/main.d.ts',
        output: {
            file: './dist/index.d.ts',
            format: 'esm',
        },
        plugins: [
            dts(),
        ],
    },
]

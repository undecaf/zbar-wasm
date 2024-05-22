import path from 'path'
import copy from 'rollup-plugin-copy'
import ts from 'rollup-plugin-ts'
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import { namedBuildConfigs } from '../build/buildConfigs.js'
import { repositoryPort } from './ports.js';

const
    {
        rollupNodeEsmBundled,
        rollupNodeEsmInlined,
        rollupNodeCjsBundled,
        rollupNodeCjsInlined,
        rollupBrowserEsmCdn,
        rollupBrowserEsmBundled,
        rollupBrowserEsmInlined,
        rollupBrowserScriptCdn,
        rollupBrowserScriptInlined,
    } = namedBuildConfigs,
    ZBAR_WASM_PKG_NAME = '@undecaf/zbar-wasm',
    // For production, set
    // ZBAR_WASM_REPOSITORY = `https://cdn.jsdelivr.net/npm/${ZBAR_WASM_PKG_NAME}@0.11.0`,
    ZBAR_WASM_REPOSITORY = `http://localhost:${repositoryPort}`,
    ZBAR_WASM = `node_modules/${ZBAR_WASM_PKG_NAME}/dist/zbar.wasm`;

const tsconfig = (module) => (resolvedConfig) => (
    { ...resolvedConfig, module }
)

export default [
    // Node ES module with zbar.wasm bundled
    {
        input: rollupNodeEsmBundled.entryFile,
        external: [
            'canvas',
        ],
        output: {
            dir:  rollupNodeEsmBundled.outputDir,
            format: 'esm',
        },
        plugins: [
            ts({
                tsconfig: tsconfig('esm')
            }),
            nodeResolve(),
            importMetaAssets(),
        ],
    },

    // Node ES module with zbar.wasm inlined
    {
        input: rollupNodeEsmInlined.entryFile,
        external: [
            'canvas',
        ],
        output: {
            dir:  rollupNodeEsmInlined.outputDir,
            format: 'esm',
        },
        plugins: [
            ts({
                tsconfig: tsconfig('esm')
            }),
            nodeResolve({
                // Resolves to the zbar-wasm module that has file zbar.wasm inlined
                exportConditions: ['zbar-inlined']
            }),
        ],
    },

    // Node CommonJS module with zbar.wasm bundled
    {
        input: rollupNodeCjsBundled.entryFile,
        external: [
            'canvas',
        ],
        output: {
            file:  rollupNodeCjsBundled.outputFile,
            format: 'cjs',
        },
        plugins: [
            ts({
                tsconfig: tsconfig('commonjs')
            }),
            nodeResolve(),

            // zbar.wasm must be copied explicitly for CommonJS targets
            copy({
                targets: [
                    { src: ZBAR_WASM, dest: rollupNodeCjsBundled.outputDir },
                ],
            }),
        ],
    },

    // Node CommonJS module with zbar.wasm inlined
    {
        input: rollupNodeCjsInlined.entryFile,
        external: [
            'canvas',
        ],
        output: {
            file:  rollupNodeCjsInlined.outputFile,
            format: 'cjs',
        },
        plugins: [
            ts({
                tsconfig: tsconfig('commonjs')
            }),
            nodeResolve({
                // Resolves to the zbar-wasm module that has file zbar.wasm inlined
                exportConditions: ['zbar-inlined']
            }),
        ],
    },

    // Browser ES module with zbar.wasm from CDN
    {
        input: rollupBrowserEsmCdn.entryFile,
        external: [
            ZBAR_WASM_PKG_NAME
        ],
        output: {
            dir:  rollupBrowserEsmCdn.outputDir,
            format: 'esm',
            paths: {
                [ZBAR_WASM_PKG_NAME]: `${ZBAR_WASM_REPOSITORY}/dist/main.mjs`,
            },
        },
        plugins: [
            ts({
                tsconfig: tsconfig('esm')
            }),
            nodeResolve(),

            // Copy test fixtures
            copy({
                targets: [
                    {
                        src: rollupBrowserEsmCdn.indexSrc,
                        dest: rollupBrowserEsmCdn.outputDir,
                        rename: rollupBrowserEsmCdn.indexHtml
                    },
                ],
            }),
        ],
    },


    // Browser ES module with zbar.wasm bundled
    {
        input: rollupBrowserEsmBundled.entryFile,
        output: {
            dir:  rollupBrowserEsmBundled.outputDir,
            format: 'esm',
        },
        plugins: [
            ts({
                tsconfig: tsconfig('esm')
            }),
            nodeResolve(),
            importMetaAssets(),

            // Copy test fixtures
            copy({
                targets: [
                    {
                        src: rollupBrowserEsmBundled.indexSrc,
                        dest: rollupBrowserEsmBundled.outputDir,
                        rename: rollupBrowserEsmBundled.indexHtml
                    },
                ],
            }),
        ],
    },

    // Browser ES module with zbar.wasm inlined
    {
        input: rollupBrowserEsmInlined.entryFile,
        output: {
            dir:  rollupBrowserEsmInlined.outputDir,
            format: 'esm',
        },
        plugins: [
            ts({
                tsconfig: tsconfig('esm')
            }),
            nodeResolve({
                // Resolves to the zbar-wasm module that has file zbar.wasm inlined
                exportConditions: ['zbar-inlined']
            }),

            // Copy test fixtures
            copy({
                targets: [
                    {
                        src: rollupBrowserEsmInlined.indexSrc,
                        dest: rollupBrowserEsmInlined.outputDir,
                        rename: rollupBrowserEsmInlined.indexHtml
                    },
                ],
            }),
        ],
    },

    // Browser script with zbar.wasm from CDN
    {
        input: rollupBrowserScriptCdn.entryFile,
        external: [
            ZBAR_WASM_PKG_NAME
        ],
        output: {
            dir:  rollupBrowserScriptCdn.outputDir,
            format: 'iife',
            globals: {
                [ZBAR_WASM_PKG_NAME]: 'zbarWasm',
            },
        },
        plugins: [
            ts({
                tsconfig: tsconfig('es2015')
            }),
            nodeResolve(),

            // Copy test fixtures
            copy({
                targets: [
                    {
                        src: rollupBrowserScriptCdn.indexSrc,
                        dest: rollupBrowserScriptCdn.outputDir,
                        rename: rollupBrowserScriptCdn.indexHtml
                    },
                ],
            }),
        ],
    },

    // Browser script with zbar.wasm inlined
    {
        input: rollupBrowserScriptInlined.entryFile,
        output: {
            dir:  rollupBrowserScriptInlined.outputDir,
            format: 'iife',
        },
        plugins: [
            ts({
                tsconfig: tsconfig('es2015')
            }),
            nodeResolve({
                // Resolves to the zbar-wasm module that has file zbar.wasm inlined
                exportConditions: ['zbar-inlined']
            }),

            // Copy test fixtures
            copy({
                targets: [
                    {
                        src: rollupBrowserScriptInlined.indexSrc,
                        dest: rollupBrowserScriptInlined.outputDir,
                        rename: rollupBrowserScriptInlined.indexHtml
                    },
                ],
            }),
        ],
    },
]

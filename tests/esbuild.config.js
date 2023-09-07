import tsconfig from './tsconfig.json' assert { type: 'json' }
import esbuild from 'esbuild'
import { copy } from 'esbuild-plugin-copy'
import { globalExternals } from '@fal-works/esbuild-plugin-global-externals'
import { namedBuildConfigs } from '../build/buildConfigs.js'
import { repositoryPort } from './ports.js';

const
    {
        esbuildNodeEsmBundled,
        esbuildNodeEsmInlined,
        esbuildNodeCjsBundled,
        esbuildNodeCjsInlined,
        esbuildBrowserEsmCdn,
        esbuildBrowserEsmBundled,
        esbuildBrowserEsmInlined,
        esbuildBrowserScriptCdn,
        esbuildBrowserScriptInlined,
    } = namedBuildConfigs,
    ZBAR_WASM_PKG_NAME = '@undecaf/zbar-wasm',
    // For production, set
    // ZBAR_WASM_REPOSITORY = `https://cdn.jsdelivr.net/npm/${ZBAR_WASM_PKG_NAME}@0.10.1`,
    ZBAR_WASM_REPOSITORY = `http://localhost:${repositoryPort}`,
    ZBAR_WASM = `node_modules/${ZBAR_WASM_PKG_NAME}/dist/zbar.wasm`;

const tsconfigRaw = (module) => ({ ...tsconfig, module });

[
    // Node ES module with zbar.wasm bundled
    {
        entryPoints: [esbuildNodeEsmBundled.entryFile],
        external: [
            'canvas',
        ],
        outfile: esbuildNodeEsmBundled.outputFile,
        tsconfigRaw: tsconfigRaw('esm'),
        bundle: true,
        format: 'esm',
        platform: 'node',
        target: 'node14',
        minify: true,
        sourcemap: false,
        plugins: [
            // zbar.wasm must be copied explicitly
            copy({
                assets: { from: ZBAR_WASM, to: '.' },
            }),
        ],
    },

    // Node ES module with zbar.wasm inlined
    {
        entryPoints: [esbuildNodeEsmInlined.entryFile],
        external: [
            'canvas',
        ],
        outfile: esbuildNodeEsmInlined.outputFile,
        tsconfigRaw: tsconfigRaw('esm'),
        bundle: true,
        format: 'esm',
        platform: 'node',
        target: 'node14',
        conditions: ['zbar-inlined'],
        minify: true,
        sourcemap: false,
    },

    // Node CommonJS module with zbar.wasm bundled
    {
        entryPoints: [esbuildNodeCjsBundled.entryFile],
        external: [
            'canvas',
        ],
        outfile: esbuildNodeCjsBundled.outputFile,
        tsconfigRaw: tsconfigRaw('commonjs'),
        bundle: true,
        format: 'cjs',
        platform: 'node',
        target: 'node14',
        minify: true,
        sourcemap: false,
        plugins: [
            // zbar.wasm must be copied explicitly
            copy({
                assets: { from: ZBAR_WASM, to: '.' },
            }),
        ],
    },

    // Node CommonJS module with zbar.wasm inlined
    {
        entryPoints: [esbuildNodeCjsInlined.entryFile],
        external: [
            'canvas',
        ],
        outfile: esbuildNodeCjsInlined.outputFile,
        tsconfigRaw: tsconfigRaw('commonjs'),
        bundle: true,
        format: 'cjs',
        platform: 'node',
        target: 'node14',
        conditions: ['zbar-inlined'],
        minify: true,
        sourcemap: false,
    },

    // Browser ES module with zbar.wasm from CDN
    {
        entryPoints: [esbuildBrowserEsmCdn.entryFile],
        external: [
            ZBAR_WASM_PKG_NAME,
        ],
        alias: {
            [ZBAR_WASM_PKG_NAME]: `${ZBAR_WASM_REPOSITORY}/dist/main.mjs`,
        },
        outfile: esbuildBrowserEsmCdn.outputFile,
        tsconfigRaw: tsconfigRaw('esm'),
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2015',
        minify: true,
        sourcemap: false,

        // Copy test fixtures
        plugins: [
            copy({
                assets: {
                    from: esbuildBrowserEsmCdn.indexSrc,
                    to: esbuildBrowserEsmCdn.indexHtml
                },
            }),
        ],
    },

    // Browser ES module with zbar.wasm bundled
    {
        entryPoints: [esbuildBrowserEsmBundled.entryFile],
        outfile: esbuildBrowserEsmBundled.outputFile,
        tsconfigRaw: tsconfigRaw('esm'),
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2020',
        minify: true,
        sourcemap: false,
        plugins: [
            // zbar.wasm must be copied explicitly
            copy({
                assets: { from: ZBAR_WASM, to: '.' },
            }),

            // Copy test fixtures
            copy({
                assets: {
                    from: esbuildBrowserEsmBundled.indexSrc,
                    to: esbuildBrowserEsmBundled.indexHtml
                },
            }),
        ],
    },

    // Browser ES module with zbar.wasm inlined
    {
        entryPoints: [esbuildBrowserEsmInlined.entryFile],
        outfile: esbuildBrowserEsmInlined.outputFile,
        tsconfigRaw: tsconfigRaw('esm'),
        bundle: true,
        format: 'esm',
        platform: 'browser',
        target: 'es2015',
        conditions: ['zbar-inlined'],
        minify: true,
        sourcemap: false,

        // Copy test fixtures
        plugins: [
            copy({
                assets: {
                    from: esbuildBrowserEsmInlined.indexSrc,
                    to: esbuildBrowserEsmInlined.indexHtml
                },
            }),
        ],
    },

    // Browser script with zbar.wasm from CDN
    {
        entryPoints: [esbuildBrowserScriptCdn.entryFile],
        external: [
            ZBAR_WASM_PKG_NAME,
        ],
        outfile: esbuildBrowserScriptCdn.outputFile,
        tsconfigRaw: tsconfigRaw('es2015'),
        bundle: true,
        format: 'iife',
        platform: 'browser',
        target: 'es2015',
        minify: true,
        sourcemap: false,
        plugins: [
            globalExternals({
                [ZBAR_WASM_PKG_NAME]: {
                    varName: 'zbarWasm',
                    type: 'cjs',
                }
            }),

            // Copy test fixtures
            copy({
                assets: {
                    from: esbuildBrowserScriptCdn.indexSrc,
                    to: esbuildBrowserScriptCdn.indexHtml
                },
            }),
        ],
    },

    // Browser script with zbar.wasm inlined
    {
        entryPoints: [esbuildBrowserScriptInlined.entryFile],
        outfile: esbuildBrowserScriptInlined.outputFile,
        tsconfigRaw: tsconfigRaw('es2015'),
        bundle: true,
        format: 'iife',
        platform: 'browser',
        target: 'es2015',
        conditions: ['zbar-inlined'],
        minify: true,
        sourcemap: false,

        // Copy test fixtures
        plugins: [
            copy({
                assets: {
                    from: esbuildBrowserScriptInlined.indexSrc,
                    to: esbuildBrowserScriptInlined.indexHtml
                },
            }),
        ],
    },

].forEach(async (opt) => {
    const result = await esbuild.build(opt)
    console.log(`Bundling ${opt.outfile}, ${result.errors.length} errors, ${result.warnings.length} warnings`)
})

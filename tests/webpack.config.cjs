module.exports = async () => {
    const
        webpack = require('webpack'),
        path = require('path'),
        CopyPlugin = require('copy-webpack-plugin'),
        { namedBuildConfigs } = await import('../build/buildConfigs.js'),
        { repositoryPort } = await import('./ports.js');

    const
        {
            webpackNodeEsmBundled,
            webpackNodeEsmInlined,
            webpackNodeCjsBundled,
            webpackNodeCjsInlined,
            webpackBrowserEsmCdn,
            webpackBrowserEsmBundled,
            webpackBrowserEsmInlined,
            webpackBrowserScriptCdn,
            webpackBrowserScriptInlined,
        } = namedBuildConfigs,
        ZBAR_WASM_PKG_NAME = '@undecaf/zbar-wasm',
        // For production, set
        // ZBAR_WASM_REPOSITORY = `https://cdn.jsdelivr.net/npm/${ZBAR_WASM_PKG_NAME}@0.10.0`,
        ZBAR_WASM_REPOSITORY = `http://localhost:${repositoryPort}`,
        ZBAR_WASM = `node_modules/${ZBAR_WASM_PKG_NAME}/dist/zbar.wasm`;

    return [
        // Node ES module with zbar.wasm bundled
        // TODO Avoid emitting @undecaf/zbar_wasm/index.js unnecessarily
        {
            experiments: {
                outputModule: true,
            },
            entry: webpackNodeEsmBundled.entryFile,
            externals: {
                canvas: 'canvas',
                module: 'module',
            },
            output: {
                filename: webpackNodeEsmBundled.outputFilename,
                path: webpackNodeEsmBundled.outputDir,
                chunkFormat: 'module',
                module: true,
            },
            target: 'node',
            mode: 'production',
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: 'ts-loader',
                        exclude: /node_modules/,
                        options: {
                            compilerOptions: {
                                module: 'es2020',
                            },
                        },
                    },
                ],
            },
            resolve: {
                extensions: ['.ts', '.js'],
            },
        },

        // Node ES module with zbar.wasm inlined
        // TODO Avoid emitting @undecaf/zbar_wasm/index.js unnecessarily
        {
            experiments: {
                outputModule: true,
            },
            entry: webpackNodeEsmInlined.entryFile,
            externals: {
                canvas: 'canvas',
                module: 'module',
            },
            output: {
                filename: webpackNodeEsmInlined.outputFilename,
                path: webpackNodeEsmInlined.outputDir,
                chunkFormat: 'module',
                module: true,
            },
            target: 'node',
            mode: 'production',
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: 'ts-loader',
                        exclude: /node_modules/,
                        options: {
                            compilerOptions: {
                                module: 'es2020',
                            },
                        },
                    },
                ],
            },
            resolve: {
                extensions: ['.ts', '.js'],
                // Resolves to the zbar-wasm module that has file zbar.wasm inlined
                conditionNames: ['import', 'zbar-inlined'],
            },
        },

        // Node CommonJS with zbar.wasm bundled
        {
            entry: webpackNodeCjsBundled.entryFile,
            externals: {
                canvas: 'commonjs canvas',
            },
            output: {
                filename: webpackNodeCjsBundled.outputFilename,
                path: webpackNodeCjsBundled.outputDir,
                chunkFormat: 'commonjs',
            },
            target: 'node',
            mode: 'production',
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: 'ts-loader',
                        exclude: /node_modules/,
                        options: {
                            compilerOptions: {
                                module: 'commonjs',
                            },
                        },
                    },
                ],
            },
            resolve: {
                extensions: ['.ts', '.js'],
            },
            plugins: [
                // zbar.wasm must be copied explicitly for CommonJS targets
                new CopyPlugin({
                    patterns: [
                        { from: ZBAR_WASM },
                    ],
                }),
            ],
        },

        // Node CommonJS with zbar.wasm inlined
        {
            entry: webpackNodeCjsInlined.entryFile,
            externals: {
                canvas: 'commonjs canvas',
            },
            output: {
                filename: webpackNodeCjsInlined.outputFilename,
                path: webpackNodeCjsInlined.outputDir,
                chunkFormat: 'commonjs',
            },
            target: 'node',
            mode: 'production',
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: 'ts-loader',
                        exclude: /node_modules/,
                        options: {
                            compilerOptions: {
                                module: 'commonjs',
                            },
                        },
                    },
                ],
            },
            resolve: {
                extensions: ['.ts', '.js'],
                // Resolves to the zbar-wasm module that has file zbar.wasm inlined
                conditionNames: ['require', 'zbar-inlined'],
            },
        },

        // Browser ES module with zbar.wasm from CDN
        {
            experiments: {
                outputModule: true,
            },
            entry: webpackBrowserEsmCdn.entryFile,
            externals: {
                module: 'module',
                [ZBAR_WASM_PKG_NAME]: `${ZBAR_WASM_REPOSITORY}/dist/main.mjs`,
            },
            output: {
                filename: webpackBrowserEsmCdn.outputFilename,
                path: webpackBrowserEsmCdn.outputDir,
                chunkFormat: 'module',
            },
            target: 'web',
            mode: 'production',
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: 'ts-loader',
                        exclude: /node_modules/,
                        options: {
                            compilerOptions: {
                                module: 'es2020',
                            },
                        },
                    },
                ],
            },
            resolve: {
                extensions: ['.ts', '.js'],
            },

            // Copy test fixtures
            plugins: [
                new CopyPlugin({
                    patterns: [
                        {
                            from: webpackBrowserEsmCdn.indexSrc,
                            to: webpackBrowserEsmCdn.indexHtml,
                            toType: 'file'
                        },
                    ],
                }),
            ],
        },

        // Browser ES module with zbar.wasm bundled
        // TODO Avoid emitting @undecaf/zbar_wasm/index.js unnecessarily
        {
            experiments: {
                outputModule: true,
            },
            entry: webpackBrowserEsmBundled.entryFile,
            externals: {
                module: 'module',
            },
            output: {
                filename: webpackBrowserEsmBundled.outputFilename,
                path: webpackBrowserEsmBundled.outputDir,
                chunkFormat: 'module',
            },
            target: 'web',
            mode: 'production',
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: 'ts-loader',
                        exclude: /node_modules/,
                        options: {
                            compilerOptions: {
                                module: 'es2020',
                            },
                        },
                    },
                ],
            },
            resolve: {
                extensions: ['.ts', '.js'],
            },

            // Copy test fixtures
            plugins: [
                new CopyPlugin({
                    patterns: [
                        {
                            from: webpackBrowserEsmBundled.indexSrc,
                            to: webpackBrowserEsmBundled.indexHtml,
                            toType: 'file'
                        },
                    ],
                }),
            ],
        },

        // Browser ES module with zbar.wasm inlined
        // TODO Avoid emitting @undecaf/zbar_wasm/index.js unnecessarily
        {
            entry: webpackBrowserEsmInlined.entryFile,
            externals: {
                module: 'module',
            },
            output: {
                filename: webpackBrowserEsmInlined.outputFilename,
                path: webpackBrowserEsmInlined.outputDir,
                chunkFormat: 'module',
            },
            target: 'web',
            mode: 'production',
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: 'ts-loader',
                        exclude: /node_modules/,
                        options: {
                            compilerOptions: {
                                module: 'es2020',
                            },
                        },
                    },
                ],
            },
            resolve: {
                extensions: ['.ts', '.js'],
                // Resolves to the zbar-wasm module that has file zbar.wasm inlined
                conditionNames: ['import', 'zbar-inlined'],
            },

            // Copy test fixtures
            plugins: [
                new CopyPlugin({
                    patterns: [
                        {
                            from: webpackBrowserEsmInlined.indexSrc,
                            to: webpackBrowserEsmInlined.indexHtml,
                            toType: 'file'
                        },
                    ],
                }),
            ],
        },

        // Browser script with zbar.wasm from CDN
        {
            entry: webpackBrowserScriptCdn.entryFile,
            externals: {
                module: 'module',
                [ZBAR_WASM_PKG_NAME]: 'global zbarWasm',
            },
            output: {
                filename: webpackBrowserScriptCdn.outputFilename,
                path: webpackBrowserScriptCdn.outputDir,
                iife: true,
            },
            target: 'web',
            mode: 'production',
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: 'ts-loader',
                        exclude: /node_modules/,
                        options: {
                            compilerOptions: {
                                module: 'none',
                            },
                        },
                    },
                ],
            },
            resolve: {
                extensions: ['.ts', '.js'],
            },

            // Copy test fixtures
            plugins: [
                new CopyPlugin({
                    patterns: [
                        {
                            from: webpackBrowserScriptCdn.indexSrc,
                            to: webpackBrowserScriptCdn.indexHtml,
                            toType: 'file'
                        },
                    ],
                }),
            ],
        },

        // Browser script with zbar.wasm inlined
        // TODO Avoid emitting @undecaf/zbar_wasm/index.js unnecessarily
        {
            entry: webpackBrowserScriptInlined.entryFile,
            externals: {
                module: 'module',
            },
            output: {
                filename: webpackBrowserScriptInlined.outputFilename,
                path: webpackBrowserScriptInlined.outputDir,
                iife: true,
            },
            target: 'web',
            mode: 'production',
            module: {
                rules: [
                    {
                        test: /\.tsx?$/,
                        loader: 'ts-loader',
                        exclude: /node_modules/,
                        options: {
                            compilerOptions: {
                                module: 'none',
                            },
                        },
                    },
                ],
            },
            resolve: {
                extensions: ['.ts', '.js'],
                // Resolves to the zbar-wasm module that has file zbar.wasm inlined
                conditionNames: ['script', 'zbar-inlined'],
            },

            // Copy test fixtures
            plugins: [
                new CopyPlugin({
                    patterns: [
                        {
                            from: webpackBrowserScriptInlined.indexSrc,
                            to: webpackBrowserScriptInlined.indexHtml,
                            toType: 'file'
                        },
                    ],
                }),
            ],
        },
    ]
}

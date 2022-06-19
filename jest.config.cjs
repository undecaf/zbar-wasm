module.exports = {
    roots: ['build'],
    moduleDirectories: [
        'node_modules', 'dist'
    ],
    transform: {
        '\\.wasm$': './test/jestFileTransformer.cjs',
    },
    testEnvironment: 'node',
    testTimeout: 15000,
}
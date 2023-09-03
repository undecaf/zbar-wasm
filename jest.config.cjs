module.exports = {
    roots: ['build'],
    moduleDirectories: [
        'node_modules', 'dist'
    ],
    transform: {
        '\\.wasm$': './tests/jestFileTransformer.cjs',
    },
    testEnvironment: 'node',
    testTimeout: 5000,
    testSequencer: './tests/testSequencer.cjs',
}

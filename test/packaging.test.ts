import { execSync } from 'child_process';


test('NPM package content', () => {
    const expectedFiles = [ 
        /^LICEN[CS]E(\..*)?$/i, 
        /^README(\..*)?$/i, 
        /^package\.json$/,
        /^dist\/main\.cjs(\.d\.ts|\.map)?$/,
        /^dist\/(main|index)\.(js(\.map)?|d\.ts)$/,
        /^dist\/zbar\.wasm$/,
    ]

    const pkg = JSON.parse(execSync('npm pack --dry-run --json').toString())[0]

    expect(pkg.name).toEqual('@undecaf/zbar-wasm')
    
    expect(pkg.files.length).toBeGreaterThanOrEqual(13)

    const extraFiles = pkg.files.map(obj => obj.path).filter(p => !expectedFiles.some(e => e.test(p)))
    expect(extraFiles).toEqual([])
})
import { execSync } from 'child_process'


test('NPM package content', () => {
    const expectedFiles = [
        /^LICEN[CS]E(\..*)?$/i,
        /^README(\..*)?$/i,
        /^package\.json$/,
        /^dist\/(inlined\/)?(index|main)\.[cm]?js(\.d\.ts|\.map)?/,
        /^dist\/(inlined\/)?(index|main)\.d\.ts/,
        /^dist\/zbar\.wasm$/,
    ]

    const pkg = JSON.parse(execSync('npm pack --dry-run --json').toString())[0]

    expect(pkg.name).toEqual('@undecaf/zbar-wasm')

    expect(pkg.files.length).toBe(21)

    const unexpectedFiles = pkg
      .files
      .map(obj => obj.path)
      .filter(p => !expectedFiles.some(e => e.test(p)))

    expect(unexpectedFiles).toEqual([])
})

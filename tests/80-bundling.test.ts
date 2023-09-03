import fs from 'fs'
import { buildConfigs, testDir } from './buildConfigs'
import { execSync } from 'child_process'
import type { Bundler } from './buildConfigs'

const
  execOptions = {
    cwd: testDir,
    stdio: [0, 1, 2],
  },
  bundlers = new Set<Bundler>(buildConfigs.map(c => c.bundler)),
  expectedBarcode = 'Lorem-ipsum-12345';


// Install the build dependencies locally
beforeAll(() => {
  execSync('npm install', execOptions)
})


// Build all target variations
test.each(Array.from(bundlers))(
  `Build test targets with $bundler`,
  (bundler) => {
    const
      bundlerName = bundler.toLowerCase()

    try {
      execSync(`npm run build:${bundlerName}`, execOptions)

    } catch (error) {
      expect(error).toBeUndefined()
    }

    buildConfigs
      .filter(c => c.bundler === bundler)
      .forEach(c => {
        expect(fs.existsSync(c.outputFile)).toBeTruthy()
    })
  }, 60000)


// Test all Node targets
test.each(buildConfigs.filter(c => c.target === 'Node'))(
  `Run the Node $format module (zbar.wasm: $asset) built by $bundler`,
  (buildConfig) => {
    const
      stdout = execSync(`node ${buildConfig.outputFile}`, { cwd: buildConfig.outputDir })

    expect(stdout.toString().trimEnd()).toEqual(expectedBarcode)
  })


// Test all browser targets in TestCafé (unable to make this work in JSDOM)
test('Run the browser modules', () => {
  try {
    execSync('testcafe', { stdio: [0, 1, 2] })

  } catch (error) {
    // @ts-ignore
    expect(error.status).toEqual(0)
  }
})

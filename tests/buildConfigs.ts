import { dirname } from 'path';
import { fileURLToPath } from 'url';

const
  cwd = process.cwd(),
  testSubdir = '/tests';

// Take into account that this module will be imported
// by Jest from the project directory and also by Webpack
// and Rollup from the tests directory
export const testDir = cwd.endsWith(testSubdir) ? cwd : cwd + testSubdir

export type Bundler = 'Webpack' | 'Rollup' | 'esbuild'
export type Target = 'Node' | 'browser'
export type Format = 'ESM' | 'CJS' | 'script'
export type Asset = 'CDN' | 'bundled' | 'inlined'

export class BuildConfig {

  constructor(
    public readonly target: Target,
    public readonly format: Format,
    public readonly bundler: Bundler,
    public readonly asset: Asset) {
  }


  get formatName() {
    return this.format.toLowerCase()
  }


  get entryFilename() {
    return `${this.target.toLowerCase()}-${this.formatName}`
  }


  get configName() {
    return `${this.entryFilename}-${this.asset.toLowerCase()}`
  }


  get outputDir() {
    return `${testDir}/build/${this.configName}/${this.bundler.toLowerCase()}`
  }


  get outputFilename() {
    return `${this.entryFilename}.${this.format === 'CJS' ? 'cjs' : 'js'}`
  }


  get outputFile() {
    return `${this.outputDir}/${this.outputFilename}`
  }


  get entryFile() {
    return `${testDir}/src/${this.entryFilename}.ts`
  }


  get indexSrc() {
    return (this.target === 'browser')
      ? `${testDir}/src/${this.configName}.html`
      : undefined
  }


  get indexHtml() {
    return (this.target === 'browser')
      ? 'index.html'
      : undefined
  }


  get indexPath() {
    return this.indexHtml
      ? `${this.outputDir}/${this.indexHtml}`
      : undefined
  }


  relativeToTestDir(path: string) {
    return path.replace(testDir, '')
  }


  relativeToProjectDir(path: string) {
    return testSubdir + this.relativeToTestDir(path)
  }

}

export const
  namedBuildConfigs: Record<string, BuildConfig> = {
    webpackNodeEsmBundled: new BuildConfig('Node', 'ESM', 'Webpack', 'bundled'),
    webpackNodeEsmInlined: new BuildConfig('Node', 'ESM', 'Webpack', 'inlined'),
    webpackNodeCjsBundled: new BuildConfig('Node', 'CJS', 'Webpack', 'bundled'),
    webpackNodeCjsInlined: new BuildConfig('Node', 'CJS', 'Webpack', 'inlined'),
    webpackBrowserEsmCdn: new BuildConfig('browser', 'ESM', 'Webpack', 'CDN'),
    webpackBrowserEsmBundled: new BuildConfig('browser', 'ESM', 'Webpack', 'bundled'),
    webpackBrowserEsmInlined: new BuildConfig('browser', 'ESM', 'Webpack', 'inlined'),
    webpackBrowserScriptCdn: new BuildConfig('browser', 'script', 'Webpack', 'CDN'),
    webpackBrowserScriptInlined: new BuildConfig('browser', 'script', 'Webpack', 'inlined'),
    rollupNodeEsmBundled: new BuildConfig('Node', 'ESM', 'Rollup', 'bundled'),
    rollupNodeEsmInlined: new BuildConfig('Node', 'ESM', 'Rollup', 'inlined'),
    rollupNodeCjsBundled: new BuildConfig('Node', 'CJS', 'Rollup', 'bundled'),
    rollupNodeCjsInlined: new BuildConfig('Node', 'CJS', 'Rollup', 'inlined'),
    rollupBrowserEsmCdn: new BuildConfig('browser', 'ESM', 'Rollup', 'CDN'),
    rollupBrowserEsmBundled: new BuildConfig('browser', 'ESM', 'Rollup', 'bundled'),
    rollupBrowserEsmInlined: new BuildConfig('browser', 'ESM', 'Rollup', 'inlined'),
    rollupBrowserScriptCdn: new BuildConfig('browser', 'script', 'Rollup', 'CDN'),
    rollupBrowserScriptInlined: new BuildConfig('browser', 'script', 'Rollup', 'inlined'),
    esbuildNodeEsmBundled: new BuildConfig('Node', 'ESM', 'esbuild', 'bundled'),
    esbuildNodeEsmInlined: new BuildConfig('Node', 'ESM', 'esbuild', 'inlined'),
    esbuildNodeCjsBundled: new BuildConfig('Node', 'CJS', 'esbuild', 'bundled'),
    esbuildNodeCjsInlined: new BuildConfig('Node', 'CJS', 'esbuild', 'inlined'),
    esbuildBrowserEsmCdn: new BuildConfig('browser', 'ESM', 'esbuild', 'CDN'),
    esbuildBrowserEsmBundled: new BuildConfig('browser', 'ESM', 'esbuild', 'bundled'),
    esbuildBrowserEsmInlined: new BuildConfig('browser', 'ESM', 'esbuild', 'inlined'),
    esbuildBrowserScriptCdn: new BuildConfig('browser', 'script', 'esbuild', 'CDN'),
    esbuildBrowserScriptInlined: new BuildConfig('browser', 'script', 'esbuild', 'inlined'),
  },
  buildConfigs = Object.values(namedBuildConfigs);


# A WebAssembly build of the ZBar Bar Code Reader

![Open issues](https://badgen.net/github/open-issues/undecaf/zbar-wasm)
![Vulnerabilities](https://snyk.io/test/npm/@undecaf/zbar-wasm/badge.svg)
![Total downloads](https://badgen.net/npm/dt/@undecaf/zbar-wasm)
![Hits/month](https://badgen.net/jsdelivr/hits/npm/@undecaf/zbar-wasm)
![License](https://badgen.net/github/license/undecaf/zbar-wasm)

This project was forked from [ZBar.wasm](https://github.com/samsam2310/zbar.wasm),
a [WebAssembly](https://webassembly.org/) build
of the [ZBar Bar Code Reader](https://github.com/mchehab/zbar) written in C/C++.

## Features

+ Provided as minified ES module, CommonJS module and plain script
+ Runs in modern browsers, in Node.js and also in workers
+ Deployment size approx. 330 kByte
+ Supports Code-39, Code-93, Code-128, Codabar, Databar/Expanded,
  EAN/GTIN-5/8/13, ISBN-10/13, ISBN-13+2, ISBN-13+5, ITF (Interleaved 2 of 5), QR Code, UPC-A/E.
+ Detects multiple barcodes per frame, also with different types
+ Barcodes may be oriented horizontally or vertically
+ Scans [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) and 
  RGB/grayscale [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) objects
+ Outperforms pure JavaScript barcode scanners

:warning: zbar-wasm versions 0.10 and above contain breaking changes with respect to version 0.9, please refer to section [Bundling/deploying zbar-wasm](#bundlingdeploying-zbar-wasm).


## Examples based on zbar-wasm

+ A simple example: [on GitHub](https://undecaf.github.io/zbar-wasm/example/) 
  ([source code](https://github.com/undecaf/zbar-wasm/tree/master/docs/example)),
  [on CodePen](https://codepen.io/undecaf/pen/ZEXmqdB)
  
+ A polyfill for the [`BarcodeDetector` Web API](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector):
  [on GitHub](https://undecaf.github.io/barcode-detector-polyfill/example-loaded/)
  ([source code](https://github.com/undecaf/barcode-detector-polyfill/tree/master/example-loaded) 
  with build scripts for Rollup and esbuild),
  [on CodePen](https://codepen.io/undecaf/pen/LYzXXzg)
  


## Getting started

### Using zbar-wasm as `<script type="module">`

An example that scans a static image file:

```html
<!DOCTYPE html>
<html>
<body>
  <img id="img" crossorigin="anonymous" src="https://raw.githubusercontent.com/undecaf/zbar-wasm/master/tests/img/qr_code.png">
  <pre id="result"></pre>

  <script type="module">
    import * as zbarWasm from 'https://cdn.jsdelivr.net/npm/@undecaf/zbar-wasm@0.11.0/dist/index.js'

    (async () => {
      const
        img = document.getElementById('img'),
        result = document.getElementById('result'),
        canvas = document.createElement('canvas'),
        context = canvas.getContext('2d');

      await img.decode()
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      context.drawImage(img, 0, 0)

      const
        imageData = context.getImageData(0, 0, canvas.width, canvas.height),
        symbols = await zbarWasm.scanImageData(imageData);
      
      symbols.forEach(s => s.rawData = s.decode())
      result.innerText = JSON.stringify(symbols, null, 2)
    })()
  </script>
</body>
</html>
```


### Using zbar-wasm as plain `<script>`

Almost identical to the snippet above, just replace the lines

```html
    ⁝
  <script type="module">
    import * as zbarWasm from 'https://cdn.jsdelivr.net/npm/@undecaf/zbar-wasm@0.11.0/dist/index.js'
    ⁝
```

with

```html
    ⁝
  <script src="https://cdn.jsdelivr.net/npm/@undecaf/zbar-wasm@0.11.0/dist/index.js"></script>
  <script>
    ⁝
```


### Using zbar-wasm as an ESM or CommonJS module in Node.js

Installing:

```shell script
$ npm install @undecaf/zbar-wasm@0.11.0
    or
$ yarn add @undecaf/zbar-wasm@0.11.0
```

Using:

`import ... from '@undecaf/zbar-wasm'` pulls the ES module from the package,
`require('@undecaf/zbar-wasm')` pulls the CommonJS module.

Please refer to the [API documentation](#api-documentation) for what can be imported/required.

A simple ES module that scans a static image file:

```javascript
import { createCanvas, loadImage }  from 'canvas';
import { scanImageData } from '@undecaf/zbar-wasm';

(async (url) => {
  const
          img = await loadImage(url),
          canvas = createCanvas(img.width, img.height),
          ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0)

  const
          imageData = ctx.getImageData(0, 0, img.width, img.height),
          symbols = await scanImageData(imageData);

  console.log(symbols[0]?.typeName, symbols[0]?.decode())
})('https://raw.githubusercontent.com/undecaf/zbar-wasm/master/tests/img/qr_code.png')
```

For a CommonJS module, just replace the first lines with

```javascript
const { createCanvas, loadImage } = require('canvas');
const { scanImageData } = require('@undecaf/zbar-wasm');
```


### Bundling/deploying zbar-wasm

Barcode scanning is always delegated to the WebAssembly code in file `zbar.wasm`.
zbar-wasm provides various functionally equivalent ESM and CommonJS modules for Node.js and for browsers
that differ in how `zbar.wasm` is to be provided at runtime:

+ `zbar.wasm` can be loaded from a CDN by browsers.
+ `zbar.wasm` can be bundled as an asset. That asset should be served to browsers as `application/wasm`
  so that it can be compiled in parallel with being received.
+ Several zbar-wasm modules contain `zbar.wasm` as inline data.

The following overview shows the modules that are available in zbar-wasm. One of them needs to be bundled in your application.

| Path in package           | Module type | Node core modules polyfilled<br>(suitable for browsers) | `zbar.wasm` inlined |
|:--------------------------|:-----------:|:-------------------------------------------------------:|:-------------------:|
| `/dist/index.mjs`         |     ESM     |                   :heavy_check_mark:                    |                     |
| `/dist/index.js`          |  CommonJS   |                   :heavy_check_mark:                    |                     |
| `/dist/main.mjs`          |     ESM     |                                                         |                     |
| `/dist/main.cjs`          |  CommonJS   |                                                         |                     |
| `/dist/inlined/index.mjs` |     ESM     |                   :heavy_check_mark:                    | :heavy_check_mark:  |
| `/dist/inlined/index.js`  |  CommonJS   |                   :heavy_check_mark:                    | :heavy_check_mark:  |
| `/dist/inlined/main.mjs`  |     ESM     |                                                         | :heavy_check_mark:  |
| `/dist/inlined/main.cjs`  |  CommonJS   |                                                         | :heavy_check_mark:  |

The [package entry points](https://nodejs.org/docs/latest-v16.x/api/packages.html#package-entry-points) of zbar-wasm have been chosen so that bundlers will emit the 
appropriate module by default in most cases. However, `zbar.wasm` as inline data requires a suitable 
[export condition](https://nodejs.org/docs/latest-v16.x/api/packages.html#conditional-exports) in the bundler configuration, typically `'zbar-inlined'`.
Please refer to the `exports` section of `package.json` for details.

[Building zbar-wasm](#building-zbar-wasm-from-source) includes testing the bundling process with [Webpack](https://webpack.js.org/), [Rollup](https://rollupjs.org/) and 
[esbuild](https://esbuild.github.io/) and also testing the resulting bundles. The bundler configuration files
[`tests/{webpack,rollup,esbuild}.config.js`](https://github.com/undecaf/zbar-wasm/tree/master/tests)
may be used as a reference of how to achieve a particular bundling result. Each of them covers
the following combinations of platforms, module types and `zbar.wasm` provisioning for the
respective bundler:

| `zbar.wasm`       | Node module types | Browser module types  |
|:------------------|:-----------------:|:---------------------:|
| loaded from CDN   |                   | ESM, plain `<script>` |
| bundled as asset  |   ESM, CommonJS   |          ESM          |
| inlined in module |   ESM, CommonJS   | ESM, plain `<script>` |


### Loading `zbar.wasm` from a custom location

As a last resort, if you cannot make your bundler place `zbar.wasm` where it can be located by the script,
you can specify an URL or path for that WASM file at runtime:

```javascript
import { scanImageData, setModuleArgs } from '@undecaf/zbar-wasm';
    ⁝
// Call this function once at the beginning
setModuleArgs({
  /**
   * This function must return the URL or path of the WASM file.
   * 
   * @param filename default WASM filename ('zbar.wasm')
   * @param directory default WASM directory (URL or directory of the current script)
   * @returns {string} URL or path of the WASM file
   */
  locateFile: (filename, directory) => {
      return 'file:///your/wasm/directory/zbar.wasm'
  }   
});
    ⁝
// Then use the scanner
const symbols = await scanImageData(...);
```


## API documentation

Owing to the predecessor of this project, [samsam2310/zbar.wasm](https://github.com/samsam2310/zbar.wasm),
a [wiki](https://github.com/samsam2310/zbar.wasm/wiki) and an extensive
[API Reference](https://github.com/samsam2310/zbar.wasm/wiki/API-Reference) are already available.
Many thanks to the author!

Please note that a few classes have been renamed compared to the documentation in order to avoid
conflicts with built-in JavaScript class names:

+ `Symbol` &rarr; `ZBarSymbol`
+ `Image` &rarr; `ZBarImage`
+ `ImageScanner` &rarr; `ZBarScanner`


## [`BarcodeDetector`](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector) Web API

The [BarcodeDetector polyfill](https://www.npmjs.com/package/@undecaf/barcode-detector-polyfill)
package (in [this repository](https://github.com/undecaf/zbar-wasm), by the same author) is based on 
`zbar-wasm` but provides a standardized, higher-level and more flexible API.


## Building zbar-wasm from source

Prerequisites:

+ A Linux platform
+ GNU `make`, `tar` and `curl`
+ [Docker](https://www.docker.com/) or [Podman](https://podman.io/)
+ [Node.js](https://nodejs.org/) v16+
+ At least one of the [browsers supported by TestCafé](https://testcafe.io/documentation/402828/guides/intermediate-guides/browsers)

To build:

- Clone this repository:
  ```bash
  $ git clone https://github.com/undecaf/zbar-wasm
  $ cd zbar-wasm
  ```
- Enter your browser(s) in `.testcaferc.json` ([supported browsers](https://testcafe.io/documentation/402828/guides/intermediate-guides/browsers)).
- Enter two available port numbers in `tests/src/ports.js`.
- If you prefer [Podman](https://podman.io/) as container engine then replace
  ```
  EM_ENGINE = $(EM_DOCKER)
  ```
  with
  ```
  EM_ENGINE = $(EM_PODMAN)
  ```
  in the provided `Makefile`.
- Run the build process:
  ```bash
  $ make
  ```
  The `make` command runs [emscripten](https://emscripten.org/) in a container, compiling the C/C++
  sources of the [ZBar Bar Code Reader](https://github.com/mchehab/zbar)
  to [WebAssembly](https://webassembly.org/). It also compiles and bundles the TypeScript glue code
  and runs the tests in Node.js and in the selected browser(s) on the host machine.


## Credits to ...

+ [samsam2310]() for providing invaluable information in his [zbar.wasm](https://github.com/samsam2310/zbar.wasm) repository
+ [mchehab](https://github.com/mchehab) for maintaining [zbar](https://github.com/mchehab/zbar)
+ the [emscripten](https://emscripten.org/) folks for their compiler toolchain 
+ the [contributors](https://github.com/undecaf/zbar-wasm/graphs/contributors) to this package


## License

Software: [LGPL-2.1](http://opensource.org/licenses/LGPL-2.1)

Documentation: [CC-BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)

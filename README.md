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

:warning: v0.10.0 contains breaking changes regarding bundling, please refer to section [Bundling/deploying zbar-wasm](#bundlingdeploying-zbar-wasm).


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
    import * as zbarWasm from 'https://cdn.jsdelivr.net/npm/@undecaf/zbar-wasm@0.10.0/dist/main.js'

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
    import * as zbarWasm from 'https://cdn.jsdelivr.net/npm/@undecaf/zbar-wasm@0.10.0/dist/main.js'
    ⁝
```

with

```html
    ⁝
  <script src="https://cdn.jsdelivr.net/npm/@undecaf/zbar-wasm@0.10.0/dist/index.js"></script>
  <script>
    ⁝
```


### Using zbar-wasm as an ESM or CommonJS module in Node.js

Installing:

```shell script
$ npm install @undecaf/zbar-wasm@0.10.0
    or
$ yarn add @undecaf/zbar-wasm@0.10.0
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
          // @ts-ignore
          symbols = await scanImageData(imageData);

  console.log(ssymbols[0]?.typeName, ymbols[0]?.decode())
})('https://raw.githubusercontent.com/undecaf/zbar-wasm/master/tests/img/qr_code.png')
```

For a CommonJS module, just replace the first lines with

```javascript
const { createCanvas, loadImage } = require('canvas');
const { scanImageData } = require('@undecaf/zbar-wasm');
```


### Bundling/deploying zbar-wasm

zbar-wasm delegates barcode scanning to the WebAssembly code in file `zbar.wasm`.
This file is part of the package and can be provided at runtime in different ways:

+ It can be loaded from a CDN by browsers.
+ It can be bundled as an asset. That asset should be served to browsers as `application/wasm`
+ so that it can be compiled in parallel with being received.
+ zbar-wasm also provides modules that contain `zbar.wasm` as inline data. 

The [package entry points](https://nodejs.org/docs/latest-v16.x/api/packages.html#package-entry-points)
of zbar-wasm have been chosen so that bundlers will select the 
appropriate module by default in most cases. `zbar.wasm` as inline data requires an
[export condition](https://nodejs.org/docs/latest-v16.x/api/packages.html#conditional-exports)
in the bundler configuration.

The build process of zbar-wasm tests bundling with
[Webpack](https://webpack.js.org/), [Rollup](https://rollupjs.org/) and 
[esbuild](https://esbuild.github.io/) and also tests the resulting bundles.
The bundler configuration files
[`tests/{webpack,rollup,esbuild}.config.js`](https://github.com/undecaf/zbar-wasm/tree/master/tests)
may be used as a reference of how to achieve a particular bundling result. They cover the following 
combinations of platform, module type and `zbar.wasm` provisioning:

<table>
<thead>
<tr>
<th style='text-align: left;'>Platform &rarr;</th>
<th colspan='2'>Node.js</th>
<th colspan='2'>Browser</th>
</tr>
<tr>
<th style='text-align: left;'><code>zbar.wasm</code>&darr;</th>
<th style='min-width: 10em;'>ESM</th>
<th style='min-width: 10em;'>CommonJS</th>
<th style='min-width: 10em;'>ESM</th>
<th style='min-width: 10em;'>Script</th>
</tr>
</thead>
<tbody>
<tr>
<th style='text-align: left;'>from CDN</th>
<td></td>
<td></td>
<td style='text-align: center;'>:white_check_mark:</td>
<td style='text-align: center;'>:white_check_mark:</td>
</tr>
<tr>
<th style='text-align: left;'>bundled</th>
<td style='text-align: center;'>:white_check_mark:</td>
<td style='text-align: center;'>:white_check_mark:</td>
<td style='text-align: center;'>:white_check_mark:</td>
<td></td>
</tr>
<tr>
<th style='text-align: left;'>inlined</th>
<td style='text-align: center;'>:white_check_mark:</td>
<td style='text-align: center;'>:white_check_mark:</td>
<td style='text-align: center;'>:white_check_mark:</td>
<td style='text-align: center;'>:white_check_mark:</td>
</tr>
</tbody>
</table>

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

To build:

```bash
$ git clone https://github.com/undecaf/zbar-wasm
$ cd zbar-wasm
$ make
```

The `make` command runs [emscripten](https://emscripten.org/) in a container, compiling the C/C++
sources of the [ZBar Bar Code Reader](https://github.com/mchehab/zbar)
to [WebAssembly](https://webassembly.org/). It also compiles and bundles the TypeScript glue code
and runs the tests in Node.js on the host machine.

If you prefer [Podman](https://podman.io/) as container engine then the provided `Makefile` needs
to be edited before running `make`: replace the line

```
EM_ENGINE = $(EM_DOCKER)
```

with

```
EM_ENGINE = $(EM_PODMAN)
```


## Credits to ...

+ [samsam2310]() for providing invaluable information in his [zbar.wasm](https://github.com/samsam2310/zbar.wasm) repository
+ [mchehab](https://github.com/mchehab) for maintaining [zbar](https://github.com/mchehab/zbar)
+ the [emscripten](https://emscripten.org/) folks for their compiler toolchain 
+ the [contributors](https://github.com/undecaf/zbar-wasm/graphs/contributors) to this package


## License

Software: [LGPL-2.1](http://opensource.org/licenses/LGPL-2.1)

Documentation: [CC-BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)

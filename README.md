# A WebAssembly build of the ZBar Bar Code Reader

![Install size](https://badgen.net/packagephobia/install/@undecaf/zbar-wasm)
![Open issues](https://badgen.net/github/open-issues/undecaf/zbar-wasm)
![Vulnerabilities](https://snyk.io/test/npm/@undecaf/zbar-wasm/badge.svg)
![Total downloads](https://badgen.net/npm/dt/@undecaf/zbar-wasm)
[![](https://data.jsdelivr.com/v1/package/npm/@undecaf/zbar-wasm/badge?style=rounded)](https://www.jsdelivr.com/package/npm/@undecaf/zbar-wasm)
![License](https://badgen.net/github/license/undecaf/zbar-wasm)

This project was forked from [ZBar.wasm](https://github.com/samsam2310/zbar.wasm),
a [WebAssembly](https://webassembly.org/) build
of the [ZBar Bar Code Reader](https://github.com/mchehab/zbar) written in C/C++.

## Features

+ Provided as minified ES module, CommonJS module and plain script
+ Runs in modern browsers, in Node.js and also in workers
+ Supports Code-39, Code-93, Code-128, Codabar, Databar/Expanded,
  EAN/GTIN-5/8/13, ISBN-10/13, ISBN-13+2, ISBN-13+5, ITF (Interleaved 2 of 5), QR Code, UPC-A/E.
+ Detects multiple barcodes per frame, also with different types
+ Barcodes may be oriented horizontally or vertically
+ Scans [`ImageData`](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) and 
  RGB/grayscale [`ArrayBuffer`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) objects
+ Outperforms pure JavaScript barcode scanners


## Examples based on zbar-wasm

+ A simple example: [on GitHub](https://undecaf.github.io/zbar-wasm/example/) 
  ([source code](https://github.com/undecaf/zbar-wasm/tree/master/docs/example)),
  [on CodePen](https://codepen.io/undecaf/pen/ZEXmqdB)
  
+ A polyfill for the [`BarcodeDetector` Web API](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector):
  [on GitHub](https://undecaf.github.io/barcode-detector-polyfill/example/)
  ([source code](https://github.com/undecaf/barcode-detector-polyfill/tree/master/example) 
  with build scripts for Rollup and esbuild),
  [on CodePen](https://codepen.io/undecaf/pen/LYzXXzg)
  


## Getting started

### Using zbar-wasm as `<script type="module">`

An example that scans a static image file:

```html
<!DOCTYPE html>
<html>
<body>
  <img id="img" crossorigin="anonymous" src="https://raw.githubusercontent.com/undecaf/zbar-wasm/master/test/img/qr_code.png">
  <pre id="result"></pre>

  <script type="module">
    import * as zbarWasm from 'https://cdn.jsdelivr.net/npm/@undecaf/zbar-wasm@0.9.12/dist/main.js'

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
    import * as zbarWasm from 'https://cdn.jsdelivr.net/npm/@undecaf/zbar-wasm@0.9.12/dist/main.js'
    ⁝
```

with

```html
    ⁝
  <script src="https://cdn.jsdelivr.net/npm/@undecaf/zbar-wasm@0.9.12/dist/index.js"></script>
  <script>
    ⁝
```


### Including zbar-wasm as ESM or as CommonJS module

Installing:

```shell script
$ npm install @undecaf/zbar-wasm@0.9.12
    or
$ yarn add @undecaf/zbar-wasm@0.9.12
```

Using:

`import ... from '@undecaf/zbar-wasm'` pulls the ES module from the package,
`require('@undecaf/zbar-wasm')` pulls the CommonJS module.

Please refer to the [API documentation](#api-documentation) for what can be imported/required.

A simple Node.js example that scans a static image file:

```javascript
const { createCanvas, loadImage } = require('canvas');
const { scanImageData } = require('@undecaf/zbar-wasm');

(async (url) => {
  const
    img = await loadImage(url),
    canvas = createCanvas(img.width, img.height),
    ctx = canvas.getContext('2d');

  ctx.drawImage(img, 0, 0);

  const
    imageData = ctx.getImageData(0, 0, img.width, img.height),
    symbols = await scanImageData(imageData);

  console.log(symbols[0].typeName, symbols[0].decode());
}) ('https://raw.githubusercontent.com/undecaf/zbar-wasm/master/test/img/qr_code.png');
```

### Bundling/deploying zbar-wasm

zbar-wasm loads the WebAssembly file `zbar.wasm` at runtime. `zbar.wasm` must be located in the same directory
as the zbar-wasm `<script>` or module, be it on a file system or at a remote endpoint.

This must be observed when bundling zbar-wasm or deploying it to a server:

+ `@undecaf/zbar-wasm/dist/zbar.wasm` must be copied as-is (e.g. using [`copy-webpack-plugin`](https://www.npmjs.com/package/copy-webpack-plugin),
  [`rollup-plugin-copy`](https://www.npmjs.com/package/rollup-plugin-copy), [`esbuild-plugin-copy`](https://www.npmjs.com/package/esbuild-plugin-copy)
  or similar).
+ `zbar.wasm` must be copied to the directory where the zbar-wasm module/the bundle containing that module is located.
+ It should be served as `application/wasm` so that it can be compiled in parallel with being received 
  by the browser.


### Licensing considerations

Please note that zbar-wasm is licensed under the LGPL because it is derived from an LGPL-licensed work.
Therefore, bundling zbar-wasm imposes the LGPL on the bundles, too.

If you need a more liberal license for your work then the [BarcodeDetector polyfill](https://www.npmjs.com/package/@undecaf/barcode-detector-polyfill)
package might be an option. It does not bundle zbar-wasm but loads it at runtime (as a library), and it is under the MIT license.
As an additional benefit it provides a simpler and more flexible API than zbar-wasm.


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


## Building zbar-wasm from source

Prerequisites:

+ A Linux platform
+ GNU `make`, `tar` and `curl`
+ [Docker](https://www.docker.com/) or [Podman](https://podman.io/)
+ [Node.js](https://nodejs.org/) v12+

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

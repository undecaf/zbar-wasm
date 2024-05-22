const { createCanvas, loadImage } = require('canvas');
const { scanImageData, setModuleArgs } = require('@undecaf/zbar-wasm');

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

    console.log(symbols[0]?.decode())
})('../../../img/code_128.png')

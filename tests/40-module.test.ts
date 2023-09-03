import { ImageFile, imageFiles } from './imageFiles'
import { ZBarScanner, scanImageData, scanGrayBuffer, ZBarSymbolType, ZBarConfigType, scanRGBABuffer } from '../dist/main.cjs'

const singleBarcodes = [ 'codabar', 'code_39', 'code_93', 'code_128', 'databar', 'ean_13', 'itf', 'qr_code' ]
const compositeBarcodes = [ 'code_39x4', 'ean_13+5' ]


singleBarcodes.forEach(basename => {
  test('Scanning ImageData', async () => {
    const imageFile: ImageFile = imageFiles[basename]
    const imageData: ImageData = await imageFile.loadImageData()

    const symbols = await scanImageData(imageData)

    imageFile.expect(symbols);
  });
});


singleBarcodes.forEach(basename => {
  test('Scanning grayscale buffer', async () => {
    const imageFile: ImageFile = imageFiles[basename];
    const imageData: ImageData = await imageFile.loadImageDataGray();

    const symbols = await scanGrayBuffer(imageData.data, imageData.width, imageData.height);

    imageFile.expect(symbols);
  });
});


singleBarcodes.forEach(basename => {
  test('Scanning RGBA buffer', async () => {
    const imageFile: ImageFile = imageFiles[basename];
    const imageData: ImageData = await imageFile.loadImageData();

    const symbols = await scanRGBABuffer(imageData.data, imageData.width, imageData.height);

    imageFile.expect(symbols);
  });
});


singleBarcodes.forEach(basename => {
  test('Scanning configured barcode type', async () => {
    const imageFile: ImageFile = imageFiles[basename];
    const imageData: ImageData = await imageFile.loadImageData();

    const scanner = await ZBarScanner.create();
    scanner.setConfig(ZBarSymbolType.ZBAR_NONE, ZBarConfigType.ZBAR_CFG_ENABLE, 0);
    imageFile.expectedSymbols
      .forEach(symbol => scanner.setConfig(symbol.type, ZBarConfigType.ZBAR_CFG_ENABLE, 1));

    const symbols = await scanImageData(imageData, scanner);

    imageFile.expect(symbols);

    scanner.destroy();
  });
});


singleBarcodes.forEach(basename => {
  test('Ignoring excluded barcode type', async () => {
    const imageFile: ImageFile = imageFiles[basename];
    const imageData: ImageData = await imageFile.loadImageData();

    const scanner = await ZBarScanner.create();
    imageFile.expectedSymbols
      .forEach(symbol => scanner.setConfig(symbol.type, ZBarConfigType.ZBAR_CFG_ENABLE, 0));

    const symbols = await scanImageData(imageData, scanner);

    expect(symbols).toBeInstanceOf(Array);
    expect(symbols).toHaveLength(0);

    scanner.destroy();
  });
});


compositeBarcodes.forEach(basename => {
  test('Scanning multiple/composite barcodes', async () => {
    const imageFile: ImageFile = imageFiles[basename];
    const imageData: ImageData = await imageFile.loadImageData();

    const scanner = await ZBarScanner.create();
    scanner.setConfig(ZBarSymbolType.ZBAR_EAN5, ZBarConfigType.ZBAR_CFG_ENABLE, 1);

    const symbols = await scanImageData(imageData, scanner);

    imageFile.expect(symbols);

    scanner.destroy();
  });
});

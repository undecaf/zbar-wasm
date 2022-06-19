import { ImageFile, imageFiles } from './imageFiles';
import { ZBarImage, ZBarScanner } from '../dist/main.cjs';

const singleBarcodes =
  [ 'codabar', 'code_39', 'code_93', 'code_128', 'databar', 'ean_13', 'itf', 'qr_code', 'qr_code-200mb' ];


test('ZBarScanner created', async () => {
  const scanner = await ZBarScanner.create();

  expect(scanner).toBeDefined();
  expect(scanner.getPointer()).toBeGreaterThan(0);
  expect(scanner.getResults()).toHaveLength(0);
  scanner.destroy();
});


singleBarcodes.forEach(basename => {
  test('ZBarScanner scanning', async () => {
    const imageFile: ImageFile = imageFiles[basename];
    const imageData: ImageData = await imageFile.loadImageData();
    const image: ZBarImage = await ZBarImage.createFromRGBABuffer(imageData.width, imageData.height, imageData.data);

    const scanner = await ZBarScanner.create();
    scanner.scan(image);
    const symbols = scanner.getResults();

    imageFile.expect(symbols);

    image.destroy();
    scanner.destroy();
  });
});


test('ZBarScanner destroyed', async () => {
  const scanner = await ZBarScanner.create();

  scanner.destroy();

  expect(() => scanner.destroy()).toThrow('Call after destroyed');
  expect(() => scanner.enableCache()).toThrow('Call after destroyed');
  expect(() => scanner.getResults()).toThrow('Call after destroyed');
  expect(() => scanner.getPointer()).toThrow('Call after destroyed');
});

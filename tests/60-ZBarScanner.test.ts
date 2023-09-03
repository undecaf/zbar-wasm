import { ImageFile, imageFiles } from './imageFiles'
import { getDefaultScanner, scanImageData } from '../dist/main.cjs'

const singleBarcodes = [
  'codabar', 'code_39', 'code_93', 'code_128', 'databar', 'ean_13', 'itf',
  'qr_code', 'qr_code-200mb', 'qr_code-utf-8-1', 'qr_code-utf-8-2',
]


test('ZBarScanner created', async () => {
  const scanner = await getDefaultScanner()

  expect(scanner).toBeDefined()
  expect(scanner.getPointer()).toBeGreaterThan(0)
  expect(scanner.getResults()).toHaveLength(0)
  scanner.destroy()
})


singleBarcodes.forEach(basename => {
  test('ZBarScanner scanning', async () => {
    const imageFile: ImageFile = imageFiles[basename]
    const imageData: ImageData = await imageFile.loadImageData()

    const symbols = await scanImageData(imageData)

    imageFile.expect(symbols)
  }, 10000);
});


test('ZBarScanner destroyed', async () => {
  const scanner = await getDefaultScanner();

  scanner.destroy();

  expect(() => scanner.destroy()).toThrow('Call after destroyed');
  expect(() => scanner.enableCache()).toThrow('Call after destroyed');
  expect(() => scanner.getResults()).toThrow('Call after destroyed');
  expect(() => scanner.getPointer()).toThrow('Call after destroyed');
});

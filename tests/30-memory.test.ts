import { getInstance, scanGrayBuffer, scanImageData, scanRGBABuffer, ZBarImage, ZBarScanner } from '../dist/main.cjs'
import { imageFiles } from './imageFiles'


test('Heap can grow beyond initial size', async () => {
  const inst = await getInstance()
  const maxHeapSize = 300000000
  const allocSize = Math.floor(inst.HEAPU8.length * 0.9)
  const allocated: Array<number> = []

  for (let i = 1, prevPtr = -allocSize; i <= maxHeapSize / allocSize; i++) {
    const ptr = inst._malloc(allocSize)
    allocated.push(ptr)

    expect(ptr).toBeGreaterThan(prevPtr + allocSize)
    expect(inst.HEAPU8.length).toBeGreaterThan(allocSize * i)

    prevPtr = ptr
  }

  allocated.forEach(ptr => inst._free(ptr));
});


test('No memory leak', async () => {
  const data = new Uint8Array([128, 128, 128, 128]);
  let image: ZBarImage = await ZBarImage.createFromRGBABuffer(1, 1, data.buffer);
  const ptr = image.getPointer();
  image.destroy();

  const scanner: ZBarScanner = await ZBarScanner.create();

  let imageData: ImageData = await imageFiles.code_39.loadImageData();
  await scanImageData(imageData, scanner);
  await scanRGBABuffer(imageData.data, imageData.width, imageData.height, scanner);

  imageData = await imageFiles.code_39.loadImageDataGray();
  await scanGrayBuffer(imageData.data, imageData.width, imageData.height, scanner);

  scanner.destroy();

  image = await ZBarImage.createFromRGBABuffer(1, 1, data.buffer);
  expect(image.getPointer()).toBe(ptr);
  image.destroy();
});

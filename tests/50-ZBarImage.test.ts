import { ZBarImage } from '../dist/main.cjs'


test('Grayscale image created', async () => {
  const data = new Uint8Array([128, 128])

  const image: ZBarImage = await ZBarImage.createFromGrayBuffer(2, 1, data.buffer)

  expect(image).toBeDefined()
  expect(image.getPointer()).toBeGreaterThan(0)
  image.destroy()
})


test('Grayscale image size checked', async () => {
  const data = new Uint8Array([128, 128, 128])

  await expect(ZBarImage.createFromGrayBuffer(2, 1, data.buffer))
    .rejects.toThrow('data length (3 bytes) does not match width and height (2 bytes)');
});


test('RGBA image created', async () => {
  const data = new Uint8Array([128, 128, 128, 128]);

  const image: ZBarImage = await ZBarImage.createFromRGBABuffer(1, 1, data.buffer);

  expect(image).toBeDefined();
  expect(image.getPointer()).toBeGreaterThan(0);
  image.destroy();
});


test('RBGA image size checked', async () => {
  const data = new Uint8Array([128, 128, 128, 128, 128]);

  await expect(ZBarImage.createFromRGBABuffer(1, 1, data.buffer))
    .rejects.toThrow('data length (5 bytes) does not match width and height (4 bytes)');
});


test('ZBarImage destroyed', async () => {
  const data = new Uint8Array([128, 128]);
  const image: ZBarImage = await ZBarImage.createFromGrayBuffer(2, 1, data.buffer);

  image.destroy();

  expect(() => image.destroy()).toThrow('Call after destroyed');
  expect(() => image.getSymbols()).toThrow('Call after destroyed');
  expect(() => image.getPointer()).toThrow('Call after destroyed');
});

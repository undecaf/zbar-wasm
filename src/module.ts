import { ZBarImage } from './ZBarImage';
import { ZBarScanner } from './ZBarScanner';
import { ZBarSymbol } from './ZBarSymbol';

const defaultScannerPromise = ZBarScanner.create();
export const getDefaultScanner = async () => {
  return await defaultScannerPromise;
};

const scanImage = async (
  image: ZBarImage,
  scanner?: ZBarScanner
): Promise<Array<ZBarSymbol>> => {
  if (scanner === undefined) {
    scanner = await defaultScannerPromise;
  }
  const res = scanner.scan(image);
  if (res < 0) {
    throw Error('Scan Failed');
  }
  if (res === 0) return [];
  return image.getSymbols();
};

export const scanGrayBuffer = async (
  buffer: ArrayBuffer,
  width: number,
  height: number,
  scanner?: ZBarScanner
): Promise<Array<ZBarSymbol>> => {
  const image = await ZBarImage.createFromGrayBuffer(width, height, buffer);
  const res = await scanImage(image, scanner);
  image.destroy();
  return res;
};

export const scanRGBABuffer = async (
  buffer: ArrayBuffer,
  width: number,
  height: number,
  scanner?: ZBarScanner
): Promise<Array<ZBarSymbol>> => {
  const image = await ZBarImage.createFromRGBABuffer(width, height, buffer);
  const res = await scanImage(image, scanner);
  image.destroy();
  return res;
};

export const scanImageData = async (
  image: ImageData,
  scanner?: ZBarScanner
): Promise<Array<ZBarSymbol>> => {
  return await scanRGBABuffer(
    image.data.buffer,
    image.width,
    image.height,
    scanner
  );
};

import { ZBarImage } from './ZBarImage'
import { ZBarScanner } from './ZBarScanner'
import { ZBarSymbol } from './ZBarSymbol'
import { ZBarConfigType, ZBarSymbolType } from './enum'

// Returns a new ZBarScanner instance that delegates QR code text decoding
// to the native TextDecoder (fixes #7: Issue with utf-8)
export const getDefaultScanner = async () => {
  const scanner = await ZBarScanner.create()
  scanner.setConfig(ZBarSymbolType.ZBAR_NONE, ZBarConfigType.ZBAR_CFG_BINARY, 1)
  return scanner
}

let defaultScanner: ZBarScanner

const scanImage = async (
  image: ZBarImage,
  scanner?: ZBarScanner
): Promise<Array<ZBarSymbol>> => {
  if (scanner === undefined) {
    // Create the default scanner lazily
    scanner = defaultScanner || await getDefaultScanner()
    defaultScanner = scanner
  }
  const res = scanner.scan(image)
  if (res < 0) {
    throw Error('Scan Failed')
  }
  if (res === 0) return []
  return image.getSymbols()
}
export const scanGrayBuffer = async (
  buffer: ArrayBuffer,
  width: number,
  height: number,
  scanner?: ZBarScanner
): Promise<Array<ZBarSymbol>> => {
  const
    image = await ZBarImage.createFromGrayBuffer(width, height, buffer),
    res = await scanImage(image, scanner);
  image.destroy()
  return res
}
export const scanRGBABuffer = async (
  buffer: ArrayBuffer,
  width: number,
  height: number,
  scanner?: ZBarScanner
): Promise<Array<ZBarSymbol>> => {
  const
    image = await ZBarImage.createFromRGBABuffer(width, height, buffer),
    res = await scanImage(image, scanner);
  image.destroy()
  return res
}
export const scanImageData = async (
  image: ImageData,
  scanner?: ZBarScanner
): Promise<Array<ZBarSymbol>> => {
  return await scanRGBABuffer(
    image.data.buffer,
    image.width,
    image.height,
    scanner
  )
}

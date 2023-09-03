import { createCanvas, loadImage } from 'canvas'
import { ZBarSymbolType, ZBarOrientation, ZBarSymbol } from '../dist/main.cjs'
import * as process from 'process';


class ExpectedSymbol {

    readonly type: typeof ZBarSymbolType
    readonly decoded: string
    readonly orientation: typeof ZBarOrientation
    readonly points?: Array<{ x: number, y: number }>

    constructor(
      type: typeof ZBarSymbolType,
      decoded: string,
      orientation: typeof ZBarOrientation,
      points?: Array<{ x: number, y: number }>
    ) {
      this.type = type
      this.decoded = decoded
      this.orientation = orientation
      this.points = points
    }

  }


export class ImageFile {

  readonly path: string;
  readonly expectedSymbols: Array<ExpectedSymbol>;

  constructor(basename: string, expectedSymbols: Array<ExpectedSymbol>) {
    this.path = `${process.cwd()}/tests/img/${basename}.png`;
    this.expectedSymbols = expectedSymbols;
  }

  async loadImageData(): Promise<ImageData> {
      const image = await loadImage(this.path);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, image.width, image.height);
  }

  async loadImageDataGray(): Promise<ImageData> {
      const imageData = await this.loadImageData();
      const len = imageData.width * imageData.height;
      const data = imageData.data;
      const buffer = new Uint8ClampedArray(len);

      for (let i = 0; i < len; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        buffer[i] = (r * 19595 + g * 38469 + b * 7472) >> 16;
      }

      return {
          data: buffer,
          width: imageData.width,
          height: imageData.height,
          colorSpace: "srgb"
      };
  }

  expect(symbols: Array<ZBarSymbol>) {
      this.expectedSymbols.forEach(e => {
          const symbol: ZBarSymbol | undefined = symbols.find(s => s.decode() === e.decoded);
          expect(symbol).toBeDefined();
          expect(symbol!.type).toBe(e.type);
          expect(symbol!.decode()).toBe(e.decoded);
          expect(symbol!.orientation).toBe(e.orientation);
          if (e.points) {
            expect(symbol!.points).toEqual(e.points);
          }
      })

      expect(symbols).toHaveLength(this.expectedSymbols.length);
  }
}


export const imageFiles: Record<string, ImageFile> = {
  'codabar':
    new ImageFile(
      'codabar',
      [new ExpectedSymbol(ZBarSymbolType.ZBAR_CODABAR, 'A967072A', ZBarOrientation.ZBAR_ORIENT_UP)]
    ),

  'code_39':
    new ImageFile(
      'code_39',
      [new ExpectedSymbol(ZBarSymbolType.ZBAR_CODE39, 'LOREM-1234', ZBarOrientation.ZBAR_ORIENT_UP)]
    ),

  'code_93':
    new ImageFile(
      'code_93',
      [new ExpectedSymbol(ZBarSymbolType.ZBAR_CODE93, 'LOREM+/-12345', ZBarOrientation.ZBAR_ORIENT_UP)]
    ),

  'code_128':
    new ImageFile(
      'code_128',
      [new ExpectedSymbol(ZBarSymbolType.ZBAR_CODE128, 'Lorem-ipsum-12345', ZBarOrientation.ZBAR_ORIENT_UP)]
    ),

  'code_39x4':
    new ImageFile(
      'code_39x4',
      [
        new ExpectedSymbol(ZBarSymbolType.ZBAR_CODE39, 'UPRIGHT', ZBarOrientation.ZBAR_ORIENT_UP),
        new ExpectedSymbol(ZBarSymbolType.ZBAR_CODE39, 'UPSIDE-DOWN', ZBarOrientation.ZBAR_ORIENT_DOWN),
        new ExpectedSymbol(ZBarSymbolType.ZBAR_CODE39, 'ROT-LEFT', ZBarOrientation.ZBAR_ORIENT_LEFT),
        new ExpectedSymbol(ZBarSymbolType.ZBAR_CODE39, 'ROT-RIGHT', ZBarOrientation.ZBAR_ORIENT_RIGHT)
      ]
    ),

  'databar':
    new ImageFile(
      'databar',
      [new ExpectedSymbol(ZBarSymbolType.ZBAR_DATABAR, '0101234567890128', ZBarOrientation.ZBAR_ORIENT_UP)]
    ),

  'ean_13':
    new ImageFile(
      'ean_13',
      [new ExpectedSymbol(ZBarSymbolType.ZBAR_EAN13, '9081726354425', ZBarOrientation.ZBAR_ORIENT_UP)]
    ),

  'ean_13+5':
    new ImageFile(
      'ean_13+5',
      [
        new ExpectedSymbol(ZBarSymbolType.ZBAR_EAN13, '9781234567897', ZBarOrientation.ZBAR_ORIENT_UP),
        new ExpectedSymbol(ZBarSymbolType.ZBAR_EAN5, '12345', ZBarOrientation.ZBAR_ORIENT_UP)
      ]
    ),

  'itf':
    new ImageFile(
      'itf',
      [new ExpectedSymbol(ZBarSymbolType.ZBAR_I25, '123456789098765432', ZBarOrientation.ZBAR_ORIENT_UP)]
    ),

  'qr_code':
    new ImageFile(
      'qr_code',
      [
        new ExpectedSymbol(
          ZBarSymbolType.ZBAR_QRCODE,
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          ZBarOrientation.ZBAR_ORIENT_UP,
          [
            { x: 52, y: 50 },
            { x: 52, y: 310 },
            { x: 312, y: 310 },
            { x: 312, y: 50 }
          ]
        )
      ]
    ),

  'qr_code-200mb':
    new ImageFile(
      'qr_code-200mb',
      [
        new ExpectedSymbol(
          ZBarSymbolType.ZBAR_QRCODE,
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          ZBarOrientation.ZBAR_ORIENT_UP,
          [
            { x: 1870, y: 1870 },
            { x: 1870, y: 2130 },
            { x: 2130, y: 2130 },
            { x: 2130, y: 1870 }
          ]
        )
      ]
    ),

  'qr_code-utf-8-1':
    new ImageFile(
      'qr_code-utf-8-1',
      [
        new ExpectedSymbol(
          ZBarSymbolType.ZBAR_QRCODE,
          'ÄÖÜ äöü ß ÁÉÍÓÚ áéíóú ÀÈÌÒÙ àéíóú',
          ZBarOrientation.ZBAR_ORIENT_UP,
          [
            { x: 10, y: 10 },
            { x: 10, y: 156 },
            { x: 156, y: 156 },
            { x: 156, y: 10 }
          ]
        )
      ]
    ),

  'qr_code-utf-8-2':
    new ImageFile(
      'qr_code-utf-8-2',
      [
        new ExpectedSymbol(
          ZBarSymbolType.ZBAR_QRCODE,
          'Thôn Hoan Trung, Chiến Thắng, Bắc Sơn, Lạng Sơn',
          ZBarOrientation.ZBAR_ORIENT_UP,
          [
            { x: 26, y: 26 },
            { x: 26, y: 283 },
            { x: 282, y: 284 },
            { x: 281, y: 26 }
          ]
        )
      ]
    ),
};

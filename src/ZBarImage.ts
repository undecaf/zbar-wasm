import { CppObject } from './CppObject'
import { ZBarSymbol } from './ZBarSymbol'
import { getInstance } from './instance'

export class ZBarImage extends CppObject {
  static async createFromGrayBuffer(
    width: number,
    height: number,
    dataBuf: ArrayBuffer,
    sequence_num: number = 0
  ): Promise<ZBarImage> {
    const
      inst = await getInstance(),
      data = new Uint8Array(dataBuf),
      len = width * height;
    if (len !== data.byteLength) {
      throw Error(`data length (${data.byteLength} bytes) does not match width and height (${len} bytes)`)
    }
    const
      buf = inst._malloc(len),
      heap = inst.HEAPU8;
    heap.set(data, buf)
    const ptr = inst._Image_create(
      width,
      height,
      0x30303859 /* Y800 */,
      buf,
      len,
      sequence_num
    )
    return new this(ptr, inst)
  }

  static async createFromRGBABuffer(
    width: number,
    height: number,
    dataBuf: ArrayBuffer,
    sequence_num: number = 0
  ): Promise<ZBarImage> {
    const
      inst = await getInstance(),
      data = new Uint8Array(dataBuf),
      len = width * height;
    if (len * 4 !== data.byteLength) {
      throw Error(`data length (${data.byteLength} bytes) does not match width and height (${len * 4} bytes)`)
    }
    const
      buf = inst._malloc(len),
      bufEnd = buf + len,
      heap = inst.HEAPU8;
    for (let i = buf, j = 0; i < bufEnd; i++, j += 4) {
      heap[i] = (
        data[j] * 19595 +
        data[j + 1] * 38469 +
        data[j + 2] * 7472
      ) >> 16
    }
    const ptr = inst._Image_create(
      width,
      height,
      0x30303859 /* Y800 */,
      buf,
      len,
      sequence_num
    )
    return new this(ptr, inst)
  }

  destroy(): void {
    this.checkAlive()
    this.inst._Image_destory(this.ptr)
    this.ptr = 0
  }

  getSymbols(): Array<ZBarSymbol> {
    this.checkAlive()
    const res = this.inst._Image_get_symbols(this.ptr)
    return ZBarSymbol.createSymbolsFromPtr(res, this.inst.HEAPU8.buffer)
  }
}

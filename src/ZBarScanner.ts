import { CppObject } from './CppObject'
import { ZBarImage } from './ZBarImage'
import { getInstance } from './instance'
import { ZBarSymbol } from './ZBarSymbol'
import { ZBarSymbolType, ZBarConfigType } from './enum'

export class ZBarScanner extends CppObject {
  static async create(): Promise<ZBarScanner> {
    const
      inst = await getInstance(),
      ptr = inst._ImageScanner_create();
    return new this(ptr, inst)
  }

  destroy(): void {
    this.checkAlive()
    this.inst._ImageScanner_destory(this.ptr)
    this.ptr = 0
  }

  setConfig(sym: ZBarSymbolType, conf: ZBarConfigType, value: number): number {
    this.checkAlive()
    return this.inst._ImageScanner_set_config(this.ptr, sym, conf, value)
  }

  enableCache(enable: boolean = true): void {
    this.checkAlive()
    this.inst._ImageScanner_enable_cache(this.ptr, enable)
  }

  recycleImage(image: ZBarImage): void {
    this.checkAlive()
    this.inst._ImageScanner_recycle_image(this.ptr, image.getPointer())
  }

  getResults(): Array<ZBarSymbol> {
    this.checkAlive()
    const res = this.inst._ImageScanner_get_results(this.ptr)
    return ZBarSymbol.createSymbolsFromPtr(res, this.inst.HEAPU8.buffer)
  }

  scan(image: ZBarImage): number {
    this.checkAlive()
    return this.inst._ImageScanner_scan(this.ptr, image.getPointer())
  }
}

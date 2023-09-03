import { getInstance } from '../dist/main.cjs'

export function testZBarInstance(inst) {
  expect(inst).toBeDefined()
  expect(typeof inst._ImageScanner_create).toEqual('function')
  expect(typeof inst._ImageScanner_scan).toEqual('function')

  // Cannot use toBeInstanceOf() here since classes with
  // the same name are not identical in jsdom and Node
  const heapTypes = {
    HEAP8: 'Int8Array',
    HEAPU8: 'Uint8Array',
    HEAP16: 'Int16Array',
    HEAPU16: 'Uint16Array',
    HEAP32: 'Int32Array',
    HEAPU32: 'Uint32Array',
  }

  for (const name in heapTypes) {
    expect(inst[name]).toBeDefined()
    expect(inst[name].constructor.name).toBe(heapTypes[name])
  }

  const heapSize = inst.HEAP8.byteLength
  expect(heapSize).toBeGreaterThan(0)

  for (const name in heapTypes) {
      expect(inst[name].byteLength).toBe(heapSize)
  }
}


test('ZBarInstance created', async () => {
  const inst = await getInstance()
  testZBarInstance(inst)
})

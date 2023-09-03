import zbarJs from 'zbarJs'
import type ZBarInstance from './ZBarInstance'

let zbarInstance: ZBarInstance

const zbarInstancePromise = (async () => {
  zbarInstance = await zbarJs()
  if (!zbarInstance) {
    throw Error('WASM was not loaded')
  }
  return zbarInstance
})()

export const getInstance = async (): Promise<ZBarInstance> => {
  return await zbarInstancePromise
}

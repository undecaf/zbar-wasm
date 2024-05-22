import zbarJs from 'zbarJs'
import type ZBarInstance from './ZBarInstance'


let zbarInstancePromise: Promise<ZBarInstance>


/**
 * Arguments used for building a `ZBarInstance`
 */
export type ZBarModuleArgs = {
  locateFile?: (filename: string, directory: string) => string,
}


/**
 * Causes a new `ZBarInstance` built with the specified arguments
 * to be returned by subsequent `getInstance()` calls.
 */
export function setModuleArgs(args: ZBarModuleArgs = {}): void {
  zbarInstancePromise = (async function(): Promise<ZBarInstance> {
    const zbarInstance = await zbarJs(args)

    if (zbarInstance) {
      return zbarInstance

    } else {
      throw Error('WASM was not loaded')
    }
  })()
}


/**
 * Returns a `ZBarInstance` built with the arguments set by `setModuleArgs()`,
 * or built without any arguments.
 * Successive calls return the same instance until `setModuleArgs()` is called.
 */
export async function getInstance(): Promise<ZBarInstance> {
  // Instantiate the module without arguments if no args have been set explicitly
  if (!zbarInstancePromise) {
    setModuleArgs()
  }

  return await zbarInstancePromise
}

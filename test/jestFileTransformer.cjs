const path = require('path')

// Keeps Jest from importing the WASM binary (which would fail)
module.exports = {
  process(src, filename, config, options) {
    return `module.exports = ${JSON.stringify(path.basename(filename))};`
  }
}
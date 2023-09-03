const Sequencer = require('@jest/test-sequencer').default
const { Test } = require('@jest/test-result')


class FilePathSequencer extends Sequencer {

  // Sort tests by test file path
  sort(tests) {
    const sortedTests = Array.from(tests)
    sortedTests.sort((testA, testB) => (testA.path > testB.path ? 1 : -1))
    return sortedTests
  }

}

module.exports = FilePathSequencer

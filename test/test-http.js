const HttpPlugin = require('../src')

describe('HttpPlugin', () => {

  describe('#contructor()', () => {
    it('return true', () => {
      assert.deepEqual({}, {})
    })
  })

  describe('#version', () => {
    it('return version', () => {
      const p = new HttpPlugin()
      assert.match(p.version, /^\d+\.\d+\.\d+$/)
    })
  })
})

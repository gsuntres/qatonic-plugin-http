const request = require('superagent')
const setCookie = require('set-cookie-parser')
const debug = require('debug')('qatonic:plugin-http')

class Http {

  constructor() {
    this._headers = {}
  }

  get(url) {
    return this._call('GET', url)
  }

  post(url, payload) {
    return this._call('POST', url, payload)
  }

  put(url, payload) {
    return this._call('PUT', url, payload)
  }

  path(url, payload) {
    return this._call('PATCH', url, payload)
  }

  headers(headers = {}) {
    this._headers = headers
  }

  _call(method = 'GET', url, payload = null, headers = {}) {
    return new Promise((resolve) => {
      debug(`[${method}] ${url}`)

      const p = request(method, url).send(payload)

      const reqHeaders = Object.assign(this._headers, headers)
      for(let key in reqHeaders) {
        p.set(key, reqHeaders[key])
      }

      p.end((err, res) => {
        if(err) {
          debug('There was a problem: ' + err.message)
        }

        let cookies
        try {
          cookies = this._parseCookies(res)
        } catch(err) {
          debug(`Problem parsing cookies ${err.message}`)
        }

        const out = {
          status: res.status,
          body: res.body,
          headers: res.headers,
          cookies
        }

        resolve(out)
      })
    })
  }

  _parseCookies(res) {
    const cookies = {}
    const cookiesRaw = setCookie.parse(res.headers['set-cookie'])
    cookiesRaw.forEach(c => cookies[c.name] = c.value)
    return cookies
  }
}


module.exports = new Http()

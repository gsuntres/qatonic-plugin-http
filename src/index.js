const request = require('superagent')
const setCookie = require('set-cookie-parser')
const debug = require('debug')('qatonic:plugin-http')

class Http {

  constructor() {
    this._headers = {}
    this._rootUrl = 'http://localhost'

    request.parse['text/html'] =  (res, cb) => res.on('data', (chunk) => cb(null, chunk))
  }


  rootUrl(rootUrl) {
    this._rootUrl = rootUrl
  }

  get(path) {
    return this._call('GET', `${this._rootUrl}${path}`)
  }

  opts(path) {
    return this._call('OPTIONS', `${this._rootUrl}${path}`)
  }

  post(path, payload) {
    return this._call('POST', `${this._rootUrl}${path}`, payload)
  }

  put(path, payload) {
    return this._call('PUT', `${this._rootUrl}${path}`, payload)
  }

  delete(path) {
    return this._call('DELETE', `${this._rootUrl}${path}`)
  }

  patch(path, payload) {
    return this._call('PATCH', `${this._rootUrl}${path}`, payload)
  }

  headers(headers = {}) {
    this._headers = Object.assign({}, headers)
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

        debug('Req.Headers: ' + JSON.stringify(reqHeaders, null, 2))
        debug('Req.Payload: ' + JSON.stringify(payload, null, 2))
        debug('Res.Status: ' + res.status)
        debug('Res.Headers: ' + JSON.stringify(res.headers, null, 2))
        debug('Res.Body: ' + JSON.stringify(res.body, null, 2))

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

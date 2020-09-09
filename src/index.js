const request = require('superagent')
const setCookie = require('set-cookie-parser')
const debug = require('debug')('qatonic:plugin-http')

class Http {

  constructor() {
    this._headers = {}
    this._rootUrl = 'http://localhost'

    request.parse['text/html'] =  (res, cb) => {
      res.text = ''
      res.setEncoding('utf-8')
      res.on('data', chunk => {
        res.text += chunk.toString()
      });
      res.on('end', () => {
        try {
          fn(null, res.text)
        } catch (err) {
          fn(err)
        }
      })
    }

    request.parse['text/plain'] =  (res, fn) => {
      res.text = ''
      res.setEncoding('utf-8')
      res.on('data', chunk => {
        res.text += chunk
      });
      res.on('end', () => {
        try {
          fn(null, res.text)
        } catch (err) {
          fn(err)
        }
      })
    }
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

  post(path, payload, type = 'json') {
    return this._call('POST', `${this._rootUrl}${path}`, payload, type)
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

  mergeHeaders(headers = {}) {
    this._headers = Object.assign({}, this._headers, headers)
  }

  _call(method = 'GET', url, payload = null, type = 'json', headers = {}) {
    return new Promise((resolve) => {
      debug(`[${method}]:[${type}] ${url}`)

      const reqHeaders = Object.assign({}, this._headers, headers)
      debug('Req.Headers: %O', reqHeaders)
      debug('Req.Payload: %O', payload)

      request(method, url)
        .type(type)
        .set(reqHeaders)
        .send(payload)
        .then((res, err) => {
          debug('---------------------------')
          debug('Res.Status: %d', res.status)
          debug('Res.Headers: %O', res.headers)
          debug('Res.Body: %O', res.body)

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
        .catch((err) => {
          debug('there was a problem: ' + err.message)
          debug('response %O', err.response)

          resolve(err.response)
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

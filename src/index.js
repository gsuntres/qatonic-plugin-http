const request = require('superagent')
const setCookie = require('set-cookie-parser')
const { PluginBase } = require('@qatonic/core')
const pkg = require('../package.json')

const SCHEMA_IN = {
    url: {
        desc: 'url to call (without scheme)',
        type: PluginBase.DATA_TYPES.STRING,
        default: 'localhost'
    },
    payload: {
        desc: 'request\'s payload',
        type: PluginBase.DATA_TYPES.OBJECT,
        default: null
    },
    path: {
        desc: 'path to call',
        type: PluginBase.DATA_TYPES.STRING,
        default: '/'
    },
    method: {
        desc: 'GET, POST, etc',
        type: PluginBase.DATA_TYPES.STRING,
        default: 'GET'
    },
    headers: {
        desc: 'Headers to use in the requests',
        type: PluginBase.DATA_TYPES.OBJECT,
        default: {}
    },
    secure: {
        desc: 'should try a secure connection',
        type: PluginBase.DATA_TYPES.BOOL,
        default: false
    },
    timeout: {
        desc: 'if supported the command should use it (in ms)',
        type: PluginBase.DATA_TYPES.NUMBER,
        default: 1000
    },
    ssl_verify: {
        desc: 'should verify certificates',
        type: PluginBase.DATA_TYPES.BOOL,
        default: true
    }
}

const SCHEMA_OUT = {
    status: {
      desc: 'the status code returned',
      type: PluginBase.DATA_TYPES.NUMBER
    },
    body: {
      desc: 'the body returned from the http call',
      type: PluginBase.DATA_TYPES.OBJECT
    },
    headers: {
      desc: 'response headers',
      type: PluginBase.DATA_TYPES.OBJECT
    },
    cookies: {
      desc: 'response cookies',
      type: PluginBase.DATA_TYPES.OBJECT
    }
}

class HttpPlugin extends PluginBase {

  constructor(props) {
    super(SCHEMA_IN, SCHEMA_OUT, props)
  }

  run() {
    return new Promise((resolve, reject) => {
      const {
        payload,
        method,
        headers
      } = this.props

      const prom = request(method, this.fullPath).send(payload)
      for(let h in headers) {
        prom.set(h, headers[h])
      }

      prom.end((err, res) => {
          let cookies
          try {
            cookies = this.parseCookies(res)
          } catch(err) {
            return reject(new Error(err))
          }

          resolve({
            status: res.status,
            output: res.body,
            headers: res.headers,
            cookies
          })
        })
    })
  }

  parseCookies(res) {
    const cookies = {}
    const cookiesRaw = setCookie.parse(res.headers['set-cookie'])
    cookiesRaw.forEach(c => cookies[c.name] = c.value)
    return cookies
  }

  get name() {
    return `[http] ${this.props.method} ${this.fullPath}`
  }

  get fullPath() {
    const {
      secure,
      url,
      path
    } = this.props

    return `${secure ? 'https://' : 'http://'}${url}${path}`
  }

  get version() {
    return pkg.version
  }
}

module.exports = HttpPlugin

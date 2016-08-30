var local = require('./transports/local')
var http = require('./transports/http')
var stager = require('./transports/stager')

function lucius(opts) {
  opts = opts || {}
  opts.local = 'local' in opts ? opts.local : true
  opts.stager = 'stager' in opts ? opts.stager : true
  var transports = [stager(opts), local(opts), http(opts)].filter(Boolean)
  var adders = transports.filter(function (t) { return t.add })

  return {
    add: add,
    act: act,
    use: use,
    backStage: backStage,
    backStageBulk: backStageBulk
  }

  function add(pattern, fn) {
    adders.forEach(function (t) { 
      t.add(pattern, fn)
    })
    return this
  }
  
  function backStage(pattern, compPattern) {
  	transports[0].backStage(pattern, compPattern)
  }
  
  function backStageBulk(patterns) {
  	patterns.forEach(function(ele){
  		backStage(ele[0], ele[1])
  	})
  }  
  
  function act(args, cb) {
    var t = 0
    var errs = []
    function enact() {
      if (!transports[t]) {
        var e = Error('no matching pattern')
        e.code = 404
        e.msg = 'no matching pattern'
        e.errors = errs
        cb && cb(e)
        return
      }
      transports[t](args, function (err, res) {
        if ((err && err.code >= 400) || (res && res.code === 204)) {
          err && errs.push(err)
          t += 1
          enact()
          return
        }
        cb && cb(err, res)
      })
    }
    enact()
    return this
  }

  function use (t) {
    if (!(t instanceof Function)) {
      throw Error('transport must be a function')
    }
    transports.push(function (args, cb) {
      t(args, cb || function (err) {
        if (err) {
          console.error('Lucius error:', err)
        }
      })
    })
    return this
  }
}
module.exports = lucius
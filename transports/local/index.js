var bloomrun = require('bloomrun')
var bloom = bloomrun()

module.exports = function (opts) {
  if (!opts.local) { return }

  act.add = add
  return act

  function add(pattern, fn) {
    bloom.add(pattern, fn)
  }
 
  function act(args, cb) {
  	console.log('local act({'+args.role+':'+args.cmd+'})')
    var matches = bloom.list(args)
    var err
    if (matches.length === 0) {
      err = Error('no matching pattern')
      err.code = 404
      cb && cb(err)
      return
    }

    matches.forEach(function (match) {
			if (!(match instanceof Function)) {      
				err = Error('no matching pattern')
				err.code = 400
				cb && cb(err)
				return 
			}
    
			match(args, cb || function (err) {
				if (err) { 
					console.error('Lucius error: ', err) 
				}
			})
		})
  } 
}
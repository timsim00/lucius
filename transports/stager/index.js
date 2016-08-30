var bloomrun = require('bloomrun')
var bloom = bloomrun()
    	
module.exports = function (opts) {
  if (!opts.stager) { return }
		
  act.backStage = backStage
  act.remove = remove
  return act

  
  function stageComponent(pattern, compPattern, args, cb) {
		act.remove(pattern, compPattern)
		var url = '/api/'+compPattern.role+'/'+compPattern.cmd
		Polymer.Base.importHref(url, () => {				
				cb && cb(null,{code:204}) //stager was successful; carry on with next transport.
				return					
			}, () => {				
				var err = Error('error getting component')
				cb(err)
				act.backStage(pattern, compPattern)
				return
			}, true
		);			
  
  }

  function backStage(pattern, compPattern) {
  	//tell this pattern to wait back stage until its component is needed.	
    bloom.add(pattern, JSON.stringify({pattern:pattern, compPattern:compPattern}))
  }
  
  function remove(pattern, compPattern) {	
    bloom.remove(pattern, JSON.stringify({pattern:pattern, compPattern:compPattern}))
  }  

  function act(args, cb) {
    var matches = bloom.list(args)
    var err
    if (matches.length === 0) {
      err = Error('no matching pattern')
      err.code = 404
      cb && cb(err)
      return
    }

		matches.forEach(function (match, index, array) {
			p = JSON.parse(match)
			stageComponent(p.pattern, p.compPattern, args, cb || function (err) {
				if (err) { 
					console.error('Lucius error: ', err) 
				}
			})		
		})
		
			
  }
}
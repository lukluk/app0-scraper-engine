String.prototype.replaceAll = function(find, replace) {
var str = this;
return str.replace(new RegExp(find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1"), 'g'), replace)
}
exports.scraper = {		
		secure: true,
		params: {},
		onInit: function(req,res, next) {
			var now = (new Date())
			if(req.body.user && req.body.password){
				
			}else{
				res.send({error:true,message:'user and password required'})
				return false
			}						
			var html = false						
			var horseman = new this.Horseman({
				timeout:15000
			})
			horseman
				.userAgent("Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0")
				.open('https://ibank.klikbca.com/')
				.then(function(body) {
					console.log(body.length)
				})
				.type('user_id', req.body.user)
				.type('#pswd', req.body.password)
				.keyboardEvent('keypress', 16777221)
				.waitForNextPage()
				.post('https://ibank.klikbca.com/accountstmt.do?value(actions)=acct_stmt')
				.post('https://ibank.klikbca.com/balanceinquiry.do')
				.html('html')
				.then(function(body) {
					html = body
				})
				.open('https://ibank.klikbca.com/authentication.do?value(actions)=logout')
				.then(function(response) {
					horseman.close()
					next(html)
				})
		},		
		rows: function($) {
			return $('div[align=right]').eq(0)
		},
		fields: {
			balance: function($) {
				return $.find('font[face=Verdana]').text().replaceAll('\n', '')
			}		
		}
	}
	//
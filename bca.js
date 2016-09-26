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
			var currentMonth = parseInt(now.getMonth()) + 1
			if(req.body.month){
				var month = parseInt(req.body.month)	
				if(currentMonth>month){
					if(currentMonth-month>2){
						res.send({error:true,message:'BCA cannot get trx over two months ago'})
						return false
					}else{
						req.body.month_passed = currentMonth-month
					}
				}else
				if(currentMonth != month){				
					res.send({error:true,message:'BCA cannot get trx of next month(s)'})
					return false
				}
			}
			
			var html = false			
			var start = {
				date: req.body.startDate ? req.body.startDate : 1,
				month: currentMonth,
				year: now.getFullYear()
			}
			var end = {
				date: req.body.endDate<=now.getDate() ? req.body.endDate : now.getDate(),
				month: currentMonth,
				year: now.getFullYear()
			}
			req.body.startDate = req.body.startDate ? req.body.startDate : 1
			req.body.endDate = req.body.endDate ? req.body.endDate : 31
			req.body.month = req.body.month ? req.body.month : currentMonth
			this.params = req.body

			if (req.body.month_passed) {
				req.body.month_passed = (req.body.month_passed > 2) ? 2 : req.body.month_passed
				var queryMutasi = 'value%28D1%29=0&value%28r1%29=2&value%28x%29=' + req.body.month_passed + '&value%28fDt%29=0101&value%28tDt%29=3101&value%28submit1%29=View+Account+Statement'
			} else {
				var queryMutasi = 'value%28D1%29=0&value%28r1%29=1&value%28startDt%29=' + start.date + '&value%28startMt%29=' + start.month + '&value%28startYr%29=' + start.year + '&value%28endDt%29=' + end.date + '&value%28endMt%29=' + end.month + '&value%28endYr%29=' + end.year + '&value%28fDt%29=&value%28tDt%29=&value%28submit1%29=View+Account+Statement'
			}
			console.log(queryMutasi)
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
				.post('https://ibank.klikbca.com/accountstmt.do?value(actions)=acctstmtview', queryMutasi)
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
		onResponse: function(result, next) {
			var digit = function(num){
				if((num+'').length<2){
					return '0'+num
				}else
					return num
			}
			var self = this
			var json = result.filter(function(t) {
				return parseInt(t.amount) >= 0
			})
			json = json.filter(function(t) {
				return (t.date >= digit(self.params.startDate)+"/"+digit(self.params.month)) && (t.date <= digit(self.params.endDate)+"/"+digit(self.params.month))
			})
			next(json)
		},
		rows: function($) {
			return $('table[border=1] tr')
		},
		fields: {
			date: function($) {
				return $.find('td').eq(0).text().replaceAll('\n', '')
			},
			description: function($) {
				return $.find('td').eq(1).text().replaceAll('\n', '')
			},
			amount: function($) {
				return $.find('td').eq(3).text().replaceAll('\n', '')
			}
		}
	}
	//
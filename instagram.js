//https://www.instagram.com/p/BF0y0ytr-hQ/
var request = require('request')
request('https://www.instagram.com/p/' + req.query.mediaid, function(err, response, body) {
  if (err) {
    res.json({
      error: true,
      message: 'failed open url ' + 'https://www.instagram.com/p/' + req.query.mediaid
    })
    return false
  }
  var obj = body.substring(body.lastIndexOf("window._sharedData = ") + 1, body.lastIndexOf(";</script>"))
  console.log(obj)
//  eval(obj)
})
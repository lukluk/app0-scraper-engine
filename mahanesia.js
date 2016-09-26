exports.scraper = {
  url: function() {
    console.log('url','https://mahanesia.com/store/'+this.req.query.category)
    return 'https://mahanesia.com/store/'+this.req.query.category
  },
  onInit: function(req, next) {
    var self = this
    this.requestDOM('https://mahanesia.com', function(err, $) {
      var token = $('input[name=_token]').attr('value')
      console.log('token', token)
      self.request.post({
        url: 'https://mahanesia.com/auth/login',
        form: {
          _token: token,
          email: 'luklukaha@gmail.com',
          password: 'p123123p'
        }
      }, function(err, httpResponse, body) {
        next()
      })
    })
  },
  list: function($) {
    var urls = [];
    $('a.product').each(function() {
      urls.push($(this).attr('href'))
    })
    console.log('list',urls)
    return urls
  },
  fields: {
    title: function($){
      return $('h2.product-info').text()
    },
    photo: function($){
      var photo = []
      $('.product-detail .images img').each(function(){
        photo.push($(this).attr('data-srcfull'))
      })
      return photo
    },
    harga_pasar: function($){
      return $('.product-detail .price-market').text()
    },
    harga_reseller: function($){
      return $('.product-detail .price-reseller').text()
    },
    profit: function($){
      return $('.product-detail .label.pink').text()
    },
    deskripsi: function($){
      return $('div[data-tab=description]').text()
    },
    stock: function($,$$){
      var stock = []
      $('div[data-tab=stock] tr').each(function(){
        var index=0
        var data = {}
        $(this).find('td').each(function(){
          if(index==1){
            data.ukuran = $(this).text()
          }
          if(index==2){
            data.jumlah_stock = $(this).text()
          }
          index++
        })
        stock.push(data)
      })
      return stock
    },
    marketing_kit: function($){
      return $('div[data-tab=attachment] a').attr('href')
    }
  }
}

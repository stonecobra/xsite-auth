/*eslint-disable semi, unknown-require*/
'use strict';

var cookieSession = require('cookie-session')
var express = require('express')
var morgan = require('morgan')

var app = express()
app.set('views', './views')
app.set('view engine', 'pug')
app.set('trust proxy', true)

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))

app.use(cookieSession({
  name: 'ws',
  keys: ['ffff'],
  httpOnly: true,
  secure: true,
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//Force use of HTTP, Google App Engine doesn't currently support this for nodejs
app.use(function(req, res, next){
  if (req.hostname !== 'localhost' && req.get('X-Forwarded-Proto') === 'http') {
    res.redirect(`https://${req.hostname}${req.url}`)
    return
  }
  next()
})

app.get('/', function (req, res){
    req.session.views = (req.session.views || 0) + 1
    
    // Write response
    res.render('index', {message: req.session.views + ' views'})
//    res.send('<html><head><title>testpk.net Auth Test</title><script src="/js/cors.js"></script><body>' + req.session.views + ' views</body></html>')
})
  
app.use(express.static('public'))

if (module === require.main) {
  // [START server]
  // Start the server
  const server = app.listen(process.env.PORT || 8081, () => {
    const port = server.address().port
    console.log(`App listening on port ${port}`)
  })
  // [END server]
}

module.exports = app

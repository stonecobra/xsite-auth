/*eslint-disable semi, unknown-require*/
'use strict'

var cookieSession = require('cookie-session')
var express = require('express')
var cors = require('cors')
var morgan = require('morgan')

var app = express()
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req[cookie]'))


// we are going to store client-authoritative auth state on the testauth.net
// domain, and ask the other sites to request it via CORS AJAX request
app.use(cookieSession({
    name: 'auth',
    keys: ['ffff'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
)
  
var whitelist = ['https://testauth.net', 'https://testpb.net', 'https://testws.net', 'https://testmg.net']
var corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

//Force use of HTTP, Google App Engine doesn't currently support this for nodejs
app.use(function(req, res, next){
  if (req.host !== 'localhost' && req.get('X-Forwarded-Proto') === 'http') {
    res.redirect(`https://${req.host}${req.url}`)
    return
  }
  next()
})

app.get('/products/:id', cors(corsOptions), function (req, res) {
    req.session.corsViews = (req.session.corsViews || 0) + 1
    console.log('browser has viewed ' + req.session.corsViews + ' times')
    res.json({msg: 'This is CORS-enabled for a whitelisted domain.'})
})

app.get('/*', function (req, res){
    req.session.views = (req.session.views || 0) + 1
    res.send('Hello')
})

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

/*eslint-disable semi, unknown-require*/
'use strict'

var cookieSession = require('cookie-session')
var express = require('express')
var bodyParser = require('body-parser')
var cors = require('cors')
var morgan = require('morgan')

var users = {
	scott : {
		password: 'scott123',
		profile: {
			name: 'Scott Sanders',
			username: 'scott'
		}
	},
	daniel : {
		password: 'daniel123',
		profile: {
			name: 'Daniel Stephens',
			username: 'daniel'
		}
	},
	tim : {
		password: 'tim123',
		profile: {
			username: 'tim',
			name: 'Tim Jacobson'
		}
	}
}

var app = express()
app.set('trust proxy', true)

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req[cookie]'))


// we are going to store client-authoritative auth state on the testauth.net
// domain, and ask the other sites to request it via CORS AJAX request
app.use(cookieSession({
    name: 'auth',
    keys: ['ffff'],
    httpOnly: true,
    secure: true,
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
  if (req.hostname !== 'localhost' && req.get('X-Forwarded-Proto') === 'http') {
    res.redirect(`https://${req.hostname}${req.url}`)
    return
  }
  next()
})

app.post('/auth/login', cors(corsOptions), function (req, res) {
	if (!req.body) return res.sendStatus(400)
  	req.session = {}
    req.session.corsViews = 1
  	var username = req.body.username
  	var profile = users[username].profile
  	if (profile) {
  		req.session.username = username //save the username to the session
  		return res.json(profile)
  	}
  	return res.sendStatus(403)
})

app.post('/auth/logout', cors(corsOptions), function (req, res) {
  	req.session = null
  	res.clearCookie('auth', {httpOnly: true, secure: true})
  	res.clearCookie('auth.sig', {httpOnly: true, secure: true})
  	return res.sendStatus(200)
})

app.get('/auth/status', cors(corsOptions), function (req, res) {
    req.session.corsViews = (req.session.corsViews || 0) + 1
	if (req.session) {
		if (req.session.username) {
			return res.json(users[req.session.username].profile)
		}
		return res.sendStatus(403)
	}
	return res.sendStatus(403)
})

app.get('/*', function (req, res){
    req.session.views = (req.session.views || 0) + 1
    res.send('Hello to a non-CORS page')
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

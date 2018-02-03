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
			tag: 'initial',
			username: 'scott'
		}
	},
	daniel : {
		password: 'daniel123',
		profile: {
			name: 'Daniel Stephens',
			tag: 'initial',
			username: 'daniel'
		}
	},
	tim : {
		password: 'tim123',
		profile: {
			username: 'tim',
			tag: 'initial',
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
  	if (users[username] && users[username].profile) {
  		users[username].profile.tag = new Date().toString()  		
  	}
  	var profile = users[username].profile
  	if (profile) {
  		req.session.username = username //save the username to the session
  		req.session.tag = profile.tag
  		return res.json(profile)
  	}
	return res.json({anonymous: true})
})

app.post('/auth/logout', cors(corsOptions), function (req, res) {
  	req.session = null
  	res.clearCookie('auth', {httpOnly: true, secure: true})
  	res.clearCookie('auth.sig', {httpOnly: true, secure: true})
  	return res.json({anonymous: true})
})

app.get('/auth/status', cors(corsOptions), function (req, res) {
    // req.session.corsViews = (req.session.corsViews || 0) + 1
    res.vary('Cookie')
    res.set('Cache-Control', 'max-age=31')
	if (req.session) {
		if (req.session.username) {
			var user = users[req.session.username]
			res.set('ETag', user.tag)
			return res.json(user.profile)
		}
		res.set('ETag', 'anonymous')
		return res.json({anonymous: true})
	}
	res.set('ETag', 'anonymous')
	return res.json({anonymous: true})
})

app.get('/*', function (req, res){
    req.session.views = (req.session.views || 0) + 1
    res.sendStatus(404)
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

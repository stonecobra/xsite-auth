console.log('starting CORS script');


function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {

        // Check if the XMLHttpRequest object has a "withCredentials" property.
        // "withCredentials" only exists on XMLHTTPRequest2 objects.
        xhr.open(method, url, true);

    } else if (typeof XDomainRequest !== "undefined") {

        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
        xhr = new XDomainRequest();
        xhr.open(method, url);

    } else {

        // Otherwise, CORS is not supported by the browser.
        xhr = null;

    }
    return xhr;
}

function xsiteStatusCheck() {
	console.log('xsiteStatusCheck - creating CORS request');
	var req = createCORSRequest('GET', 'https://testauth.net/auth/status');
	if (!req) {
	  throw new Error('xsiteStatusCheck - CORS not supported');
	}
	
	req.withCredentials = true;
	req.onload = function() {
	  var responseText = req.responseText;
	  console.log('xsiteStatusCheck - CORS Response: ' + req.status + ': ' + responseText);
	  // process the response.
	};
	 
	req.onerror = function() {
	 console.log('xsiteStatusCheck - CORS Response ERROR');
	};
	
	console.log('xsiteStatusCheck - sending CORS request');
	req.send();	
}

window.setInterval(xsiteStatusCheck, 30000);

function xsiteLogin (username, password) {
	console.log('xsiteLogin - creating CORS request for user: ' + username);
	var req = createCORSRequest('POST', 'https://testauth.net/auth/login');
	var params = [];
	params.push('username=' + encodeURIComponent(username));
	params.push('password=' + encodeURIComponent(password));
	var urlEncodedData = params.join('&').replace(/%20/g, '+');
	
	if (!req) {
	  throw new Error('xsiteLogin - CORS not supported');
	}
	
	req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
	req.withCredentials = true;
	req.onload = function() {
	  var responseText = req.responseText;
	  console.log('xsiteLogin - CORS Response: ' + req.status + ': ' + responseText + ': ' + req.responseType);
	  setProfile(req.response);
	};
	 
	req.onerror = function() {
	 console.log('xsiteLogin - CORS Response ERROR');
	};
	
	console.log('xsiteLogin - sending CORS request');
	req.send(urlEncodedData);	
}

function xsiteLogout () {
	console.log('xsiteLogout - creating CORS request');
	var req = createCORSRequest('POST', 'https://testauth.net/auth/logout');
	if (!req) {
	  throw new Error('xsiteLogin - CORS not supported');
	}
	
	req.withCredentials = true;
	req.onload = function() {
	  var responseText = req.responseText;
	  console.log('xsiteLogout - CORS Response: ' + req.status + ': ' + responseText);
	  // process the response.
	};
	 
	req.onerror = function() {
	 console.log('xsiteLogout - CORS Response ERROR');
	};
	
	console.log('xsiteLogout - sending CORS request');
	req.send();	
}

function setProfile (newProfile) {
	window.xsite = window.xsite || {};
	window.xsite.profile = newProfile;
	if (newProfile && newProfile.name) {
		document.body.className = 'authenticated';
		document.getElementById('profileName').innerHTML = 'Welcome, ' + newProfile.name;
		document.getElementById('private-details').innerHTML = '<div class="card-header">' +
            '<h4 class="my-0 font-weight-normal">Profile Info</h4>' +
          '</div>' +
          '<div class="card-body">' +
            '<ul class="list-unstyled mt-3 mb-4">' +
              '<li>Username: ' + newProfile.username + '</li>' +
              '<li>Name: ' + newProfile.name + '</li>' +
            '</ul>' +
          '</div>';
	} else {
		document.body.className = 'anonymous';
		document.getElementById('profileName').innerHTML = '';
		document.getElementById('private-details').innerHTML = '';
	}
}


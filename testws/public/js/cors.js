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

console.log('creating CORS request');
var req = createCORSRequest('GET', 'https://testauth.net/products/7');
if (!req) {
  throw new Error('CORS not supported');
}

req.withCredentials = true;
req.onload = function() {
  var responseText = req.responseText;
  console.log('CORS Response: ' + responseText);
  // process the response.
};
 
req.onerror = function() {
 console.log('CORS Response ERROR');
};

console.log('sending CORS request');
req.send();






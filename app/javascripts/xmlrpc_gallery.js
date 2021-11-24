/*
 * Copyright (c) 2008 David Crawshaw <david@zentus.com>
 *
 * Permission to use, copy, modify, and distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */
/*
 * An XML-RPC library for JavaScript.
 *
 * The xmlrpc() function is the public entry point.
 */
/*
 * Execute an XML-RPC method and return the response to 'callbacks.done'.
 * Parameters are passed as JS Objects, and the callback function is
 * given a single JS Object representing the server's response.
 */

var xmlrpc_gallery = function(method, params, callbacks){

	var server = 'http://communities-anywhere.newn.es/webapp/proxy/proxy.php';

	/*
	 Callbacks:
	 done
	 error
	 close
	 */
	if (callbacks.error == null) {
		callbacks.error = alert;
	}

	var request = new XMLHttpRequest();
	request.open("POST", server, true);
	request.setRequestHeader("Connection", "Keep-Alive");
	request.setRequestHeader("Origin", "webOS Forums");
	request.setRequestHeader("Accept-Charset", "UTF-8,ISO-8859-1,US-ASCII");
    //request.setRequestHeader("Accept-Encoding", "gzip, deflate");
    request.setRequestHeader("Content-type", "text/plain; charset=utf-8");
    //request.setRequestHeader("Content-type", "text/plain; charset=iso-8859-1");
	request.overrideMimeType("text/plain; charset=utf-8");
	request.setRequestHeader("Mobiquo_id", "5");

   request.onreadystatechange = function(){

        if (callbacks.request) {
            var continueRequest = callbacks.request(request);
            Mojo.Log.info("xmlrpc continueRequest", continueRequest);
            if (!continueRequest) {
                return;
            }
        }

        if (request.readyState != 4) {
            //Mojo.Log.info("xmlrpc readyState", request.readyState);
            return;
        }

		var parseUnencrypted = function(unencryptedText){
			try {
				/**
				 * START PARSING
				 **/
				//var xmlDoc = request.responseXML;

				// replace odd control chars
				try {
					text = unencryptedText.replace(/[\u001c\u001d\u001e\u001f]/, '');
				}
				catch (err) {
					Mojo.Log.error("Can't replace chars in received text, continue anyway and hope for the best ...");
				}

				// convert to xml
           	 	var xmlDoc = null;
            	try {
					xmlDoc = new DOMParser().parseFromString(text, "text/xml");
				}
				catch (err) {
					err.message = "bad xml: '" + text + "'";
					callbacks.error(err);
					throw err;
				}

				// parse response
				var ret = null;
				try {
					if (xmlDoc != null) {

						ret = xmlrpc.parseResponse(xmlDoc);
						xmlrpc_gallery.finishCall(callbacks, ret);


					}
					else {
						ret = {
							result: true
						};
						xmlrpc_gallery.finishCall(callbacks, ret);

					}
				}
				catch (err) {
					err.message = "xmlrpc: " + err.message;
					callbacks.error(err);
					throw err.faultString;
				}
			} catch (e) {
				Mojo.Log.error("parseUnencrypted: ", e);
			}
		}

 		var finishStuff = function(){

			try {
				if (request.status != 200) {
					var msg = {
						error: request.status
					};
					callbacks.error(msg);
					return;
				}

				//Mojo.Log.info(Object.toJSON(request));
				var text = request.responseText;

				//text = text.replace(/[\u001c\u001d\u001e\u001f]/, '');

				//Mojo.Log.info(text);
				if (text)
				Mojo.Log.info("xml_rpc_gallery() text length: " + text.length);

				//Mojo.Log.info(text.length);
				xmlrpc_gallery.decrypt(text, parseUnencrypted);
			}
			finally {
				if (callbacks.close) {
					callbacks.close();
				}
			}
		}

		finishStuff.defer();
    };

	var sending = xmlrpc.writeCall(method, params);
	request.send(sending);
};

xmlrpc_gallery.finishCall = function(callbacks,ret) {

				var cookie = "";
				if (!ret) ret = {};

				// callback
				try {
					callbacks.done(ret);
				}
				catch (err) {
					//err.message = "callbacks.done: " + err.message;
					callbacks.error(err);
					throw err;
				}
};

xmlrpc_gallery.decrypt = function(encryptedText, callback){

 callback(encryptedText);

};

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
function Base64Holder(base64){
    this.base64 = base64;
}

Base64Holder.prototype.getBase64 = function(){
    return this.base64;
}
Base64Holder.prototype.toString = function(){
    return this.base64;
}



var xmlrpc = function(server, method, params, callbacks, isArray){


	if (!isArray) {
		isArray = false;
	} else {
		//Mojo.Log.info(">>>>>>>>>>><<< EXPECTED ARRAY");
	}
    /*
     Callbacks:
     done
     error
     close
     */
    if (callbacks.error == null) {
        callbacks.error = alert;
    }

	var hostString = appSettings.currentForum.url;
	hostString = hostString.replace(/\057$/, ""); // remove ending '/', if any
    hostString = hostString.replace(/http:\057\057/gi, ""); // remove starting 'http://', if any
    hostString = hostString.replace(/www./gi, ""); // remove starting 'www.', if any
	hostString = hostString + ':80';
	if (appSettings.debug.detailedLogging && appSettings.debug.logXMLRPC) {
	Mojo.Log.info("xmlrpc, server: ", server);
	}
	
	//Mojo.Log.info("HOST: ", hostString);
    var request = new XMLHttpRequest();
    request.open("POST", server, true);
    //request.open("POST", "http://www.newnessdevelopments.com/smf/mobiquo/mobiquo.php", true);
    request.setRequestHeader("Connection", "Keep-Alive");
    request.setRequestHeader("Origin", "webOS Forums");
	//request.setRequestHeader('Host', hostString);
	//request.setRequestHeader('User-Agent','XML-RPC for PHP 2.2.1');
    //request.setRequestHeader("Accept", "text/xml");
	request.setRequestHeader("Accept-Charset", "UTF-8,ISO-8859-1,US-ASCII");
    //request.setRequestHeader("Accept-Encoding", "gzip, deflate");
    //request.setRequestHeader("Content-type", "text/xml; charset=utf-8");
    request.setRequestHeader("Content-type", "text/xml");
	request.overrideMimeType("text/xml; charset=ISO-8859-1");


   if (appSettings.Tapatalk.headers && method != "login") {
		//webOS version handling
		//Mojo.Log.info(Mojo.Environment.DeviceInfo.platformVersion);
		if(Mojo.Environment.DeviceInfo.platformVersion.startsWith("1.")) {
			request.setRequestHeader("Cookie", appSettings.Tapatalk.headers);
		} else {
			request.setRequestHeader("Set-Cookie", appSettings.Tapatalk.headers);
		}
	}

   if (appSettings.debug.detailedLogging && appSettings.debug.logXMLRPC) {
	   Mojo.Log.info("xmlrpc, headers: " + appSettings.Tapatalk.headers);
   }
	var requestResponseLength = 0;
 	request.onCreate = function(request) {
		this.controller = Mojo.Controller.stageController.activeScene();
      request['timeoutId'] = this.controller.window.setTimeout(function() {
         // If we have hit the timeout and the AJAX request is active, abort it and let the user know
         if (request.transport.readyState != 0 && request.transport.readyState != 4) {
		 	var cancelRequest = false;
			//Mojo.Log.info(request.ResponseLength);
		 	if (request.transport.readyState == 3 && request.responseText.length > requestResponseLength) {
				requestResponseLength = request.responseText.length;
			}
			else {
				cancelRequest = true;
			}
			if (cancelRequest) {
				this.controller.window.clearTimeout(request['timeoutId']);
				request.transport.abort();
			}
         }
       }, 5000); // five seconds
   };

    request.onreadystatechange = function(){

        if (callbacks.request) {
            var continueRequest = callbacks.request(request);
        	if (appSettings.debug.detailedLogging && appSettings.debug.logXMLRPC) {
        		Mojo.Log.info("xmlrpc continueRequest", continueRequest);
        	}
            if (!continueRequest) {
                return;
            }
        }

        if (request.readyState != 4) {
        	if (appSettings.debug.detailedLogging && appSettings.debug.logXMLRPC) {
            Mojo.Log.info("xmlrpc readyState", request.readyState);
        	}
        	return;
        }

 		var finishStuff = function(){
			Mojo.Log.info("FINISHING CALLS");
        	if (appSettings.debug.detailedLogging && appSettings.debug.logXMLRPC) {
        		logBreak("xmlrpc, response status, text: " + request.status + ", " + request.responseText);
        	}
			try {
				if (request.status != 200) {
					var msg = {
						error: request.status
					};
					callbacks.error(msg);
					return;
				}

				var text = trim(request.responseText);
				//Mojo.Log.info(text);
				var xmlDoc = request.responseXML;

				// replace odd control chars
				try {
					text = text.replace(/[\u001c\u001d\u001e\u001f]/, '');
				}
				catch (err) {
					Mojo.Log.error("Can't replace chars in received text, continue anyway and hope for the best ...");
				}

				// parse response
				var ret = null;
				try {
					if (xmlDoc != null) {


				// Loging headers
						if (true || method == "login") {
							var arrHeader = request.getAllResponseHeaders().split("\n");
							strCookies = "";

							intCookies = 0;

							// Iterate through the collection of returned headers
							for (i = 0; i < arrHeader.length; i++) {
								// If the entry is a cookies, extract the name/value
								if (appSettings.debug.detailedLogging && appSettings.debug.logXMLRPC) { 
									Mojo.Log.info("response header " + i + ": " + arrHeader[i]);
								}
								var handled = false;
								if (arrHeader[i].indexOf("Set-Cookie") != -1) {
									if (arrHeader[i].substr(12).startsWith("SMFCookie")) {
										strCookies += arrHeader[i].substr(12) + "; ";
										handled = true;
									}
									intCookies++;
								}
								else if (arrHeader[i].indexOf("Mobiquo_is_login") == 0) {
									//This is a bit of hack, but need to figure out how to return the headers...
									appSettings.Tapatalk.Mobiquo_is_login = (arrHeader[i].indexOf("true") != -1);  
								}
							}

							//Mojo.Log.info("NUMBER OF COOKIES RETURNED: ", intCookies);
						}



						if (isArray) {
							//Workaround to prevent timeout with large forums structures
							//Mojo.Log.info("PARSING AS ARRAY");
							setTimeout(function() {xmlrpc.parseResponseAsArray(xmlDoc, xmlrpc.finishCall.curry(callbacks, request.getResponseHeader('Set-Cookie')).bind(this));}.bind(this),500);

						}
						else {

							ret = xmlrpc.parseResponse(xmlDoc);
							xmlrpc.finishCall(callbacks, request.getResponseHeader('Set-Cookie'), ret);

						}
					}
					else {
						ret = {
							result: true
						};
						xmlrpc.finishCall(callbacks, request.getResponseHeader('Set-Cookie'), ret);

					}
				}
				catch (err) {
					Mojo.Log.error(Object.toJSON(err));
					err.message = "xmlrpc: " + err.message;
					callbacks.error(err);
					throw err.faultString;
				}

			}


			finally {
				if (callbacks.close) {
					callbacks.close();
				}
			}
		}
		finishStuff.defer();
    };

    request.onerror = function(){
    	Mojo.Log.error("xmlrpc.onerror called.")
    	try {
    		logJSON("Response: " + JSON.stringify(request));
    	} catch (ex) {}
		var msg = {
				error: request.status
			};
			//callbacks.error(msg);
			//return;
    }
    
    var sending = xmlrpc.writeCall(method, params);
	request.setRequestHeader("Content-Length", sending.length);

	if (appSettings.debug.detailedLogging && appSettings.debug.logXMLRPC) {
		Mojo.Log.info("xmlrpc sending: " + sending);
	}

    request.send(sending);
};

xmlrpc.finishCall = function(callbacks, setCookieValue,ret) {

				var cookie = "";
				if (!ret) ret = {};

				if (setCookieValue) {
					if (appSettings.debug.detailedLogging && appSettings.debug.logXMLRPC) {
						Mojo.Log.info("xmlrpc.finishCall, Response cookie:" + setCookieValue);
					}
					if (setCookieValue.indexOf("SMFCookie") != -1) {
						var lastPHPSESSID = setCookieValue.substr(setCookieValue.lastIndexOf("PHPSESSID"));
						lastPHPSESSID = lastPHPSESSID.substr(0, lastPHPSESSID.indexOf(";"));
						setCookieValue = setCookieValue.substr(setCookieValue.indexOf("SMFCookie"));
						//Mojo.Log.info("RESULTADO COOKIE: ", setCookieValue);
						setCookieValue = setCookieValue.substr(0,setCookieValue.indexOf(";"));
						//Mojo.Log.info("RESULTADO COOKIE: ", setCookieValue);
						setCookieValue = trim(lastPHPSESSID).concat("; ".concat(trim(setCookieValue)));
						//Mojo.Log.info("RESULTADO COOKIE FINAL: ", setCookieValue);
					}
					cookie = setCookieValue;
					ret.cookie = cookie;
				}

				// callback
				try {
					if (appSettings.debug.detailedLogging && appSettings.debug.logXMLRPC) {
						Mojo.Log.info("Calling callbacks.done, " + ret);
					}
					callbacks.done(ret);
				}
				catch (err) {
					//err.message = "callbacks.done: " + err.message;
					if (appSettings.debug.logXMLRPC) {
						Mojo.Log.error("Error calling callback: ", ex);
					}
					callbacks.error(err);
					throw err;
				}
};

xmlrpc.writeCall = function(method, params){
    out = "<?xml version=\"1.0\"?>\n";
    out += "<methodCall>\n";
    out += "<methodName>" + method + "</methodName>\n";

    if (params && params.length > 0) {
        out += "<params>\n";
        for (var i = 0; i < params.length; i++) {
            out += "<param><value>";
            out += xmlrpc.writeParam(params[i]);
            out += "</value></param>";
        }
        out += "</params>\n";
    }

    out += "</methodCall>\n";
    return out;
};

xmlrpc.writeParam = function(param){

    if (param == null)
        return "<nil />";


    switch (typeof(param)) {
        case "boolean":
            return "<boolean>" + param + "</boolean>";
        case "string":
            if (param.length == 0) {
                return "<string/>";
            }
            else {
                return "<string><![CDATA[" + param + "]]></string>";
            }
        case "undefined":
            return "<nil/>";
        case "number":
            return /\./.test(param) ? "<double" > +param + "</double>" : "<int>" + param + "</int>";
    }

    if (typeof(param) == "object") {

        if (param.constructor == Base64Holder) {
            return "<base64>" + param.getBase64() + "</base64>";
        }

        if (param.constructor == Array) {
            out = "<array><data>\n";
            for (var i = 0; i < param.length; i++) {
                out += "<value>" + xmlrpc.writeParam(param[i]) + "</value>\n";
            }
            out += "</data></array>";
            return out;
        }

        if (param.constructor == Date) {
            out = "<dateTime.iso8601>";
            out += param.getUTCFullYear();
            if (param.getUTCMonth() < 10)
                out += "0";
            out += param.getUTCMonth();
            if (param.getUTCDate() < 10)
                out += "0";
            out += param.getUTCDate() + "T";
            if (param.getUTCHours() < 10)
                out += "0";
            out += param.getUTCHours() + ":";
            if (param.getUTCMinutes() < 10)
                out += "0";
            out += param.getUTCMinutes() + ":";
            if (param.getUTCSeconds() < 10)
                out += "0";
            out += param.getUTCSeconds();
            out += "</dateTime.iso8601>";
            return out;
        }

        /* struct */
        out = "<struct>\n";
        for (var i in param) {
            out += "<member>";
            out += "<name>" + i + "</name>";
            out += "<value>" + xmlrpc.writeParam(param[i]) + "</value>";
            out += "</member>\n";
        }
        out += "</struct>\n";
        return out;
    }

}
;

xmlrpc.getChildElement = function(parent, pos){
    var len = parent.childNodes.length;
    var currentElement = null;
    for (i = 0; i < len; i++) {
        currentElement = parent.childNodes[i];
        if (currentElement.nodeName != "#text") {
            if (pos <= 0) {
                return currentElement;
            }
            else {
                pos--;
            }
        }
    }

    return null;
}

xmlrpc.firstChildElement = function(parent){
    return xmlrpc.getChildElement(parent, 0);
}

xmlrpc.secondChildElement = function(parent){
    return xmlrpc.getChildElement(parent, 1);
}

xmlrpc.parseResponse = function(dom){
    var methResp = dom.childNodes[dom.childNodes.length - 1];
    if (methResp.nodeName != "methodResponse") {
		Mojo.Log.error(Object.toJSON(methResp));
        throw "malformed <methodResponse>, got " + methResp.nodeName;
    }


    var params = xmlrpc.firstChildElement(methResp);
    if (params != null && params.nodeName == "fault") {
        var fault = xmlrpc.parse(xmlrpc.firstChildElement(params));
        throw fault;

    }
    if (params == null || params.nodeName != "params")
        throw "malformed <params>, got <" + params.nodeName + ">";


    var param = xmlrpc.firstChildElement(params);
    if (param == null || param.nodeName != "param")
        throw "malformed <param>, got <" + param.nodeName + ">";


    var value = xmlrpc.firstChildElement(param);
    if (value.nodeName != "value")
        throw "malformed <value>, got <" + value.nodeName + ">";

		return xmlrpc.parse(value);

};

xmlrpc.parse = function(value){


    if (value.nodeName != "value")
        throw "parser: expected <value>, got " + (value.nodeName == "#text" ? '"' + value.data + '"' : "<" + value.nodeName + ">");

    var type = xmlrpc.firstChildElement(value);
    if (type == null)
        throw "parser: expected <value> to have a child";
    switch (type.nodeName) {
        case "boolean":
            return type.childNodes[0].data == "1" ? true : false;
        case "i4":
        case "int":
            return parseInt(type.childNodes[0].data);
        case "double":
            return parseFloat(type.childNodes[0].data);
        case "#text": // Apache XML-RPC 2 doesn't wrap strings with <string>
            return type.data;
        case "string":
            return type.childNodes.length == 0 ? "" : type.childNodes[0].data;
        case "array":
          	var data = xmlrpc.firstChildElement(type);
            var res = new Array(0);
            var len = data.childNodes.length;
            var currentElement = null;

            for (var i = 0; i < len; i++) {
                currentElement = data.childNodes[i];
                if (currentElement.nodeName != "#text") {
					res.push(xmlrpc.parse(data.childNodes[i]));
                }
            }
            return res;


        case "struct":
            var members = type.childNodes;
            var res = {};
            var len = members.length;
            var currentElement = null;
            for (var i = 0; i < len; i++) {
                currentElement = members[i];
                if (currentElement.nodeName != "#text") {
                    var name = xmlrpc.firstChildElement(currentElement).childNodes[0].data;
                    var value = xmlrpc.parse(xmlrpc.secondChildElement(currentElement));
                    res[name] = value;
                }
            }
            return res;
        case "dateTime.iso8601":
            var s = type.childNodes[0].data;

            var d = new Date();
            d.setUTCFullYear(s.substr(0, 4));
            d.setUTCMonth(s.substr(4, 2) - 1); // rely on auto conversion to decimal, no parseInt
            d.setUTCDate(s.substr(6, 2));
            d.setUTCHours(s.substr(9, 2));
            d.setUTCMinutes(s.substr(12, 2));
            d.setUTCSeconds(s.substr(15, 2));

            return d;
        case "base64":
            return type.childNodes.length == 0 ? "" : Base64.decode(type.childNodes[0].data);

            //Mojo.Log.error("TODO base64"); // XXX
        default:
            throw "parser: expected type, got <" + type.nodeName + ">";
    }
};

xmlrpc.parseResponseAsArray = function(dom, callback){
	if (appSettings.debug.detailedLogging ) {
		Mojo.Log.info("entered parseResponseAsArray");
	}
    var methResp = dom.childNodes[dom.childNodes.length - 1];
    if (methResp.nodeName != "methodResponse") {
		Mojo.Log.error(Object.toJSON(methResp));
        throw "malformed <methodResponse>, got " + methResp.nodeName;
    }


    var params = xmlrpc.firstChildElement(methResp);
    if (params != null && params.nodeName == "fault") {
        var fault = xmlrpc.parse(xmlrpc.firstChildElement(params));
        throw fault;

    }
    if (params == null || params.nodeName != "params")
        throw "malformed <params>, got <" + params.nodeName + ">";


    var param = xmlrpc.firstChildElement(params);
    if (param == null || param.nodeName != "param")
        throw "malformed <param>, got <" + param.nodeName + ">";


    var value = xmlrpc.firstChildElement(param);
    if (value.nodeName != "value")
        throw "malformed <value>, got <" + value.nodeName + ">";

	//Mojo.Log.info("ready to parse");
	xmlrpc.parseAsArray(value, callback);

};

xmlrpc.parseAsArray = function(value, callback){
	if (appSettings.debug.detailedLogging ) {
		Mojo.Log.info("xmlrpc.parseAsArray, parsing...");
	}
    if (value.nodeName != "value")
        throw "parser: expected <value>, got " + (value.nodeName == "#text" ? '"' + value.data + '"' : "<" + value.nodeName + ">");

    var type = xmlrpc.firstChildElement(value);
    if (type == null)
        throw "parser: expected <value> to have a child";
    //Mojo.Log.info(type.nodeName);
    switch (type.nodeName) {
        case "array":
        	if (appSettings.debug.detailedLogging ) {
        		Mojo.Log.info("Parsing array..");
        	}
          	var data = xmlrpc.firstChildElement(type);
            var res = new Array(0);
            var len = data.childNodes.length;
            var currentElement = null;
			var i  = 0;
			var interval = setInterval(function(){
				// do your loop
				currentElement = data.childNodes[i];
				if (appSettings.debug.detailedLogging ) {
					Mojo.Log.info("parsing Item ", i+1, " of ", len)
				}
				var parsedItem = {};
				if (currentElement != null) {
					if (currentElement.nodeName != "#text") {
						parsedItem = xmlrpc.parse(data.childNodes[i]);
						res.push(parsedItem);
						if (appSettings.debug.detailedLogging ) {
							Mojo.Log.info("parsed Item ", i+1, " of ", len);
						}
					}
					else {
						if (appSettings.debug.detailedLogging ) {
							try {
							Mojo.Log.info("skipped item ", i+1, " of ", len);
							} catch (ex) {}
						}
					}
				} else {
					if (appSettings.debug.detailedLogging ) {
						Mojo.Log.info("skipped item ", i+1, " of ", len, " (it was null)");
					}
					//res.push({});
				}
				parsedItem.list_original_order = i;
				i++;
				//MW originally the following line said (len - 1), and it was not parsing the last item in an array.  That could have far-reaching implications, so watch out for side-effects!
				if (i == (len - 0)) {
					clearInterval(interval);
					if (appSettings.debug.detailedLogging ) { //&& appSettings.debug.logXMLRPC
						Mojo.Log.info("Clearing interval. Length of res: ", res.length);
					}
					callback(res);
				}
			}, 0);
			break;
        default:
            throw "parser: expected type, got <" + type.nodeName + ">";
    }
};

xmlrpc.parseArrayItem = function (currentElement, callback) {
	try {
			var item = xmlrpc.parse(currentElement);
			callback(item);

	} catch (e) {
		Mojo.Log.error(e);
	}
};

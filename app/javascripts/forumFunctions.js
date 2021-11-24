//Parse forum URLs to open in-app if possible
//TODO: Handle user profile links.
function handleUrl(urlItem){
	try {
		var isValidLink = false;
		this.controller = Mojo.Controller.stageController.activeScene();
		Mojo.Log.info("URL: ", urlItem);
		var link = parseUri(urlItem);
		Mojo.Log.info("Link: " + Object.toJSON(link));
		Mojo.Log.info("currentForum.url: " + Object.toJSON(appSettings.currentForum.url));
		var address = "http://" + link.host + link.directory;
		Mojo.Log.info("Checking address against current forum URL.");
		if (appSettings.currentForum &&
			 appSettings.currentForum.url) {
				Mojo.Log.info("appSettings.currentForum.url: " + appSettings.currentForum.url);
			 }
		if (appSettings.currentForum.url.replace(/\057$/i, "") === address.replace(/\057$/i, "")) {
			Mojo.Log.info("Checking forum and link type..");
			var forumSystem = appSettings.Tapatalk.config.version.substr(0, 2);
			switch (forumSystem.toLowerCase()) {
				case "pb":
					if (link.file == "viewforum.php") {
						isValidLink = true;
						linkType = "forum";
					}
					else 
						if (link.file == "viewtopic.php") {
							isValidLink = true;
							linkType = "topic";
							
						}
					break;
				case "vb":
					if (link.file == "forumdisplay.php") {
						isValidLink = true;
						linkType = "forum";
					}
					else 
						if (link.file == "showthread.php") {
							isValidLink = true;
							linkType = "topic";
						}
					break;
			};
			
			Mojo.Log.info("isValidLink: " + isValidLink);
			if (isValidLink) {
				switch (linkType) {
					case "forum":
						//Mojo.Log.info(Object.toJSON(appSettings.Tapatalk.forum.forums[10]));
						Mojo.Log.info(link.queryKey.f);
						var forumIdToSearch = link.queryKey.f.toString();
						var parsedPath = getForumPath(appSettings.Tapatalk.forum.forums, forumIdToSearch, []);
						Mojo.Log.info("PATH: ", parsedPath);
						this.controller.stageController.pushScene("childForum", parsedPath);
						break;
					case "topic":
						Mojo.Log.info("isValidLink: " + isValidLink);
						if (forumSystem.toLowerCase() == "vb" || forumSystem.toLowerCase() == "pb") {
							var topicIdToSearch =  link.queryKey.t ? link.queryKey.t.toString() : "";
							var postIdToSearch = link.queryKey.p ? link.queryKey.p.toString() : "";
							this.controller.stageController.pushScene("topic", {
								topic_id: topicIdToSearch,
								post_id: postIdToSearch
							});
						}
						else {
							this.controller.serviceRequest('palm://com.palm.applicationManager', {
								method: 'open',
								parameters: {
									target: urlItem
								}
							});
						}
				}
			}
			else {
				this.controller.serviceRequest('palm://com.palm.applicationManager', {
					method: 'open',
					parameters: {
						target: urlItem
					}
				});
			}
		}
		else if (link.host == "forums.webosnation.com" ||
					link.host == "forums.precentral.net" ||
					 ("http://" + link.host == appSettings.currentForum.url)) {
			Mojo.Log.info("Link base matches, attempting to parse vbseo link..");
			try {
			/*
			 * TODO: attempt to parse pose from anchor if present.  
			 * webosnation format: #post1111111
			 * 
currentForum.url: "http://forums.webosnation.com/"

URL:  http://forums.webosnation.com/webos-patches/326829-patch-fixes-enhancements-forums-app.html

Link: { "anchor": "post3412941", 
			"query": "", 
			"file": "326829-patch-fixes-enhancements-forums-app.html", 
			"directory": "/webos-patches/", 
			"path": "/webos-patches/326829-patch-fixes-enhancements-forums-app.html", 
			"relative": "/webos-patches/326829-patch-fixes-enhancements-forums-app.html", 
			"port": "", 
			"host": "forums.webosnation.com", 
			"password": "", "user": "", "userInfo": "", 
			"authority": "forums.webosnation.com", 
			"protocol": "http", 
			"source": "http://forums.webosnation.com/webos-patches/326829-patch-fixes-enhancements-forums-app.html", 
			"queryKey": {}}
			*/
				if (link.file.indexOf("-") > 0) {
					var topicIdToSearch = link.file.substring(0,link.file.indexOf("-"));
					var postIdToSearch = "";
					if (link.anchor && link.anchor.indexOf("post") == 0 && link.anchor.length > 4) {
						postIdToSearch = link.anchor.substring(4);
					}
					Mojo.Log.info("Pushing topic scene for topic: " + topicIdToSearch + (postIdToSearch.length > 0 ? (", post: " + postIdToSearch) : ""));
					this.controller.stageController.pushScene("topic", {
						topic_id: topicIdToSearch,
						post_id: postIdToSearch
					});
				}
											
			} catch (ex) {
				Mojo.Log.info("Unable to parse vbseo link, opening in browser..", ex);
				Mojo.Log.info(JSON.stringify(ex));
				this.controller.serviceRequest('palm://com.palm.applicationManager', {
					method: 'open',
					parameters: {
						target: urlItem
					}
				});
			}
		}
		else {
			if (link.file.toLowerCase().endsWith("ipk")) {
				Mojo.Log.info("IPK link detected, opening in Preware..");
				this.controller.serviceRequest('palm://com.palm.applicationManager', {
				  method: 'launch',
				  parameters: {
					id: 'org.webosinternals.preware',
					params: { target: urlItem }
				  }
				});
			} else {
				Mojo.Log.info("Forum link not detected, opening in browser..");
				this.controller.serviceRequest('palm://com.palm.applicationManager', {
					method: 'open',
					parameters: {
						target: urlItem
					}
				});
			}
		}
		/* IPK link, want to cross-launch Preware for these..
		Link: {"anchor": "", "query": "", "file": "com.grabber.basiccertgrabber_0.5.3_all.ipk", "directory": "/GrabberSoftware/SSLcerts/googlecerts/", "path": "/GrabberSoftware/SSLcerts/googlecerts/com.grabber.basiccertgrabber_0.5.3_all.ipk", "relative": "/GrabberSoftware/SSLcerts/googlecerts/com.grabber.basiccertgrabber_0.5.3_all.ipk", "port": "", "host": "www.fordmaverick.com", "password": "", "user": "", "userInfo": "", "authority": "www.fordmaverick.com", "protocol": "http", "source": "http://www.fordmaverick.com/GrabberSoftware/SSLcerts/googlecerts/com.grabber.basiccertgrabber_0.5.3_all.ipk", "queryKey": {}}
		*/
	} 
	catch (e) {
		Mojo.Log.error("handleURL error: ", e);
	}
};

function generateURI (forumId, topicId, postId, currentForum) {
	if(!currentForum) currentForum = false;
	
	Mojo.Log.info("generateURI, parms: " + forumId, topicId, postId);
	Mojo.Log.info("generateURI, forumSystem: " + appSettings.Tapatalk.config.version.substring(0, 2));
	
	var forumSystem = appSettings.Tapatalk.config.version.substring(0, 2);
	var forumRoot = "";
	var fileName = "";
	var parameters = "";
	var stringURI = "";
	switch (forumSystem) {
		case 'vb':
			if (postId || topicId) {
				fileName = "showthread.php?";
				if (topicId) {
					if(forumId) {
						parameters = "f="+ forumId + "&";
					}
					parameters = parameters + "t=" + topicId;
					if (postId) {
						parameters = parameters + "&p=" + postId + "#post" + postId;
					}
				} else {
					parameters = "p=" + postId + "#post" + postId;
				}
			} else if(forumId){
				fileName = "forumdisplay.php?f=" + forumId;
			}
			stringURI = forumRoot + fileName + parameters;
			break;
			break;
		case 'pb':
			if (postId || topicId) {
				fileName = "viewtopic.php?";
				if (topicId) {
					if(forumId) {
						parameters = "f="+ forumId + "&";
					}
					parameters = parameters + "t=" + topicId;
					if (postId) {
						parameters = parameters + "#p" + postId;
					}
				} else {
					parameters = "p=" + postId + "#p" + postId;
				}
			} else if(forumId){
				fileName = "viewforum.php?f=" + forumId;
			}
			stringURI = forumRoot + fileName + parameters;
			break;
		case 'sm':
			if (postId || topicId) {
				fileName = "index.php?";
				if (topicId) {
					if(forumId) {
						parameters = "board="+ forumId + "&";
					}
					parameters = parameters + "topic=" + topicId;
					if (postId) {
						parameters = parameters + ".msg" + postId + "#msg" + postId;
					}
				} else {
					parameters = "p=" + postId + "#p" + postId;
				}
			} else if(forumId){
				fileName = "index.php?board=" + forumId;
			}
			stringURI = forumRoot + fileName + parameters;
			break;
			break;
	}
	if (!currentForum) {
		Mojo.Log.info(stringURI);
		return stringURI;
	} else {
		var siteRoot = appSettings.currentForum.url.replace(/\057$/i, "");
		var fullURL = siteRoot + "/" + stringURI;
		Mojo.Log.info(fullURL);
		return fullURL;
	}
};

function getForumPath(forum_structure, forum_id, current_path) {
	var len = forum_structure.length;
	var result = [];
	if(!current_path) current_path = [];
	if (!forum_structure) forum_structure = appSettings.Tapatalk.forum.forums;
	
	for(var i=0; i< len;i++) {
		//Mojo.Log.info(forum_structure[i].forum_id, forum_id);
		if (forum_structure[i].forum_id == forum_id) {
			current_path.push(i);
			result = current_path;
			break;
		} else {
			if (forum_structure[i].child) {
				var currentElement = forum_structure[i].child;
				var partial_path = current_path.clone();
				partial_path.push(i);
				result = getForumPath(currentElement, forum_id, partial_path);
				//Mojo.Log.info("RESULTADO: ", partial_path, result);
				if(result != false && result.length != 0) {
					break;
				}
			} else {
				result = false;
			}
		}
	};
	return result;
};

function getForumObject(forumTree, pathArray) {
	try {
		var forumIndex = pathArray[0];
		if (!forumTree) {
			var subForum = appSettings.Tapatalk.forum.forums[forumIndex];
		}
		else {
			var subForum = forumTree[forumIndex];
		}
		Mojo.Log.info(pathArray[0]);
		Mojo.Log.info(subForum.forum_name);
		pathArray.splice(0, 1);
		if (pathArray.length) {
			return getForumObject(subForum.child, pathArray);
		}
		else {
			return subForum;
		}
	} catch(e) {
		Mojo.Log.error("getForumObject ERROR: ", e);
	}
};

function htmlentities (string, quote_style) {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: nobbler
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Ratheous
    // -    depends on: get_html_translation_table
    // *     example 1: htmlentities('Kevin & van Zonneveld');
    // *     returns 1: 'Kevin &amp; van Zonneveld'
    // *     example 2: htmlentities("foo'bar","ENT_QUOTES");
    // *     returns 2: 'foo&#039;bar'

    var hash_map = {}, symbol = '', tmp_str = '', entity = '';
    tmp_str = string.toString();
    
    if (false === (hash_map = this.get_html_translation_table('HTML_ENTITIES', quote_style))) {
        return false;
    }
    hash_map["'"] = '&#039;';
    for (symbol in hash_map) {
        entity = hash_map[symbol];
        tmp_str = tmp_str.split(symbol).join(entity);
    }
    
    return tmp_str;
};

function get_html_translation_table (table, quote_style) {
    // http://kevin.vanzonneveld.net
    // +   original by: Philip Peterson
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: noname
    // +   bugfixed by: Alex
    // +   bugfixed by: Marco
    // +   bugfixed by: madipta
    // +   improved by: KELAN
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Frank Forte
    // +   bugfixed by: T.Wild
    // +      input by: Ratheous
    // %          note: It has been decided that we're not going to add global
    // %          note: dependencies to php.js, meaning the constants are not
    // %          note: real constants, but strings instead. Integers are also supported if someone
    // %          note: chooses to create the constants themselves.
    // *     example 1: get_html_translation_table('HTML_SPECIALCHARS');
    // *     returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
    
    var entities = {}, hash_map = {}, decimal = 0, symbol = '';
    var constMappingTable = {}, constMappingQuoteStyle = {};
    var useTable = {}, useQuoteStyle = {};
    
    // Translate arguments
    constMappingTable[0]      = 'HTML_SPECIALCHARS';
    constMappingTable[1]      = 'HTML_ENTITIES';
    constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
    constMappingQuoteStyle[2] = 'ENT_COMPAT';
    constMappingQuoteStyle[3] = 'ENT_QUOTES';

    useTable       = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
    useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT';

    if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
        throw new Error("Table: "+useTable+' not supported');
        // return false;
    }

    entities['38'] = '&amp;';
    if (useTable === 'HTML_ENTITIES') {
        entities['160'] = '&nbsp;';
        entities['161'] = '&iexcl;';
        entities['162'] = '&cent;';
        entities['163'] = '&pound;';
        entities['164'] = '&curren;';
        entities['165'] = '&yen;';
        entities['166'] = '&brvbar;';
        entities['167'] = '&sect;';
        entities['168'] = '&uml;';
        entities['169'] = '&copy;';
        entities['170'] = '&ordf;';
        entities['171'] = '&laquo;';
        entities['172'] = '&not;';
        entities['173'] = '&shy;';
        entities['174'] = '&reg;';
        entities['175'] = '&macr;';
        entities['176'] = '&deg;';
        entities['177'] = '&plusmn;';
        entities['178'] = '&sup2;';
        entities['179'] = '&sup3;';
        entities['180'] = '&acute;';
        entities['181'] = '&micro;';
        entities['182'] = '&para;';
        entities['183'] = '&middot;';
        entities['184'] = '&cedil;';
        entities['185'] = '&sup1;';
        entities['186'] = '&ordm;';
        entities['187'] = '&raquo;';
        entities['188'] = '&frac14;';
        entities['189'] = '&frac12;';
        entities['190'] = '&frac34;';
        entities['191'] = '&iquest;';
        entities['192'] = '&Agrave;';
        entities['193'] = '&Aacute;';
        entities['194'] = '&Acirc;';
        entities['195'] = '&Atilde;';
        entities['196'] = '&Auml;';
        entities['197'] = '&Aring;';
        entities['198'] = '&AElig;';
        entities['199'] = '&Ccedil;';
        entities['200'] = '&Egrave;';
        entities['201'] = '&Eacute;';
        entities['202'] = '&Ecirc;';
        entities['203'] = '&Euml;';
        entities['204'] = '&Igrave;';
        entities['205'] = '&Iacute;';
        entities['206'] = '&Icirc;';
        entities['207'] = '&Iuml;';
        entities['208'] = '&ETH;';
        entities['209'] = '&Ntilde;';
        entities['210'] = '&Ograve;';
        entities['211'] = '&Oacute;';
        entities['212'] = '&Ocirc;';
        entities['213'] = '&Otilde;';
        entities['214'] = '&Ouml;';
        entities['215'] = '&times;';
        entities['216'] = '&Oslash;';
        entities['217'] = '&Ugrave;';
        entities['218'] = '&Uacute;';
        entities['219'] = '&Ucirc;';
        entities['220'] = '&Uuml;';
        entities['221'] = '&Yacute;';
        entities['222'] = '&THORN;';
        entities['223'] = '&szlig;';
        entities['224'] = '&agrave;';
        entities['225'] = '&aacute;';
        entities['226'] = '&acirc;';
        entities['227'] = '&atilde;';
        entities['228'] = '&auml;';
        entities['229'] = '&aring;';
        entities['230'] = '&aelig;';
        entities['231'] = '&ccedil;';
        entities['232'] = '&egrave;';
        entities['233'] = '&eacute;';
        entities['234'] = '&ecirc;';
        entities['235'] = '&euml;';
        entities['236'] = '&igrave;';
        entities['237'] = '&iacute;';
        entities['238'] = '&icirc;';
        entities['239'] = '&iuml;';
        entities['240'] = '&eth;';
        entities['241'] = '&ntilde;';
        entities['242'] = '&ograve;';
        entities['243'] = '&oacute;';
        entities['244'] = '&ocirc;';
        entities['245'] = '&otilde;';
        entities['246'] = '&ouml;';
        entities['247'] = '&divide;';
        entities['248'] = '&oslash;';
        entities['249'] = '&ugrave;';
        entities['250'] = '&uacute;';
        entities['251'] = '&ucirc;';
        entities['252'] = '&uuml;';
        entities['253'] = '&yacute;';
        entities['254'] = '&thorn;';
        entities['255'] = '&yuml;';
    }

    if (useQuoteStyle !== 'ENT_NOQUOTES') {
        entities['34'] = '&quot;';
    }
    if (useQuoteStyle === 'ENT_QUOTES') {
        entities['39'] = '&#39;';
    }
    entities['60'] = '&lt;';
    entities['62'] = '&gt;';


    // ascii decimals to real symbols
    for (decimal in entities) {
        symbol = String.fromCharCode(decimal);
        hash_map[symbol] = entities[decimal];
    }
    
    return hash_map;
}

function subDomain(url) {
 
// IF THERE, REMOVE WHITE SPACE FROM BOTH ENDS
url = url.replace(new RegExp(/^\s+/),""); // START
url = url.replace(new RegExp(/\s+$/),""); // END
 
// IF FOUND, CONVERT BACK SLASHES TO FORWARD SLASHES
url = url.replace(new RegExp(/\\/g),"/");
 
// IF THERE, REMOVES 'http://', 'https://' or 'ftp://' FROM THE START
url = url.replace(new RegExp(/^http\:\/\/|^https\:\/\/|^ftp\:\/\//i),"");
 
// IF THERE, REMOVES 'www.' FROM THE START OF THE STRING
url = url.replace(new RegExp(/^www\./i),"");
 
// REMOVE COMPLETE STRING FROM FIRST FORWARD SLASH ON
url = url.replace(new RegExp(/\/(.*)/),"");
 
// REMOVES '.??.??' OR '.???.??' FROM END - e.g. '.CO.UK', '.COM.AU'
if (url.match(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i))) {
      url = url.replace(new RegExp(/\.[a-z]{2,3}\.[a-z]{2}$/i),"");
 
// REMOVES '.??' or '.???' or '.????' FROM END - e.g. '.US', '.COM', '.INFO'
} else if (url.match(new RegExp(/\.[a-z]{2,4}$/i))) {
      url = url.replace(new RegExp(/\.[a-z]{2,4}$/i),"");
}
 
// CHECK TO SEE IF THERE IS A DOT '.' LEFT IN THE STRING
var subDomain = (url.match(new RegExp(/\./g))) ? true : false;
 
return(subDomain);
 
}

function html_entity_decode (string, quote_style) {
    // http://kevin.vanzonneveld.net
    // +   original by: john (http://www.jd-tech.net)
    // +      input by: ger
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Onno Marsman
    // +   improved by: marc andreu
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +      input by: Ratheous
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Nick Kolosov (http://sammy.ru)
    // +   bugfixed by: Fox
    // -    depends on: get_html_translation_table
    // *     example 1: html_entity_decode('Kevin &amp; van Zonneveld');
    // *     returns 1: 'Kevin & van Zonneveld'
    // *     example 2: html_entity_decode('&amp;lt;');
    // *     returns 2: '&lt;'

    var hash_map = {}, symbol = '', tmp_str = '', entity = '';
    tmp_str = string.toString();
    
    if (false === (hash_map = this.get_html_translation_table('HTML_ENTITIES', quote_style))) {
        return false;
    }

    // fix &amp; problem
    // http://phpjs.org/functions/get_html_translation_table:416#comment_97660
    delete(hash_map['&']);
    hash_map['&'] = '&amp;';

    for (symbol in hash_map) {
        entity = hash_map[symbol];
        tmp_str = tmp_str.split(entity).join(symbol);
    }
    tmp_str = tmp_str.split('&#039;').join("'");
    
    return tmp_str;
}

function htmlspecialchars (string, quote_style, charset, double_encode) {
    // http://kevin.vanzonneveld.net
    // +   original by: Mirek Slugen
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Nathan
    // +   bugfixed by: Arno
    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
    // +      input by: Ratheous
    // +      input by: Mailfaker (http://www.weedem.fr/)
    // +      reimplemented by: Brett Zamir (http://brett-zamir.me)
    // +      input by: felix
    // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
    // %        note 1: charset argument not supported
    // *     example 1: htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES');
    // *     returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'
    // *     example 2: htmlspecialchars("ab\"c'd", ['ENT_NOQUOTES', 'ENT_QUOTES']);
    // *     returns 2: 'ab"c&#039;d'
    // *     example 3: htmlspecialchars("my "&entity;" is still here", null, null, false);
    // *     returns 3: 'my &quot;&entity;&quot; is still here'

    var optTemp = 0, i = 0, noquotes= false;
    if (typeof quote_style === 'undefined' || quote_style === null) {
        quote_style = 2;
    }
    string = string.toString();
    if (double_encode !== false) { // Put this first to avoid double-encoding
        string = string.replace(/&/g, '&amp;');
    }
    string = string.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    var OPTS = {
        'ENT_NOQUOTES': 0,
        'ENT_HTML_QUOTE_SINGLE' : 1,
        'ENT_HTML_QUOTE_DOUBLE' : 2,
        'ENT_COMPAT': 2,
        'ENT_QUOTES': 3,
        'ENT_IGNORE' : 4
    };
    if (quote_style === 0) {
        noquotes = true;
    }
    if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
        quote_style = [].concat(quote_style);
        for (i=0; i < quote_style.length; i++) {
            // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
            if (OPTS[quote_style[i]] === 0) {
                noquotes = true;
            }
            else if (OPTS[quote_style[i]]) {
                optTemp = optTemp | OPTS[quote_style[i]];
            }
        }
        quote_style = optTemp;
    }
    if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
        string = string.replace(/'/g, '&#039;');
    }
    if (!noquotes) {
        string = string.replace(/"/g, '&quot;');
    }

    return string;
}

//Copied from Communities.. needs adjusted or additional functions replaced
function getNormalizedUrl(url) {
		var remoteServer = url.replace(/mobiquo\056php$/i, "") // remove ending "mobiquo.php"
		remoteServer = remoteServer.replace(/mobiquo\057$/i, "") // remove ending "mobiquo/", if any
		remoteServer = remoteServer.replace(/mobiquo$/i, "") // remove ending "mobiquo", if any
		remoteServer = remoteServer.replace(/\057$/i, "") // remove ending "/", if any

		var parsedUri = parseUri(remoteServer);
		remoteServer = parsedUri.protocol + "://" + parsedUri.host + ":80" + parsedUri.path + "/" + this.community.mobiquo_dir + "/mobiquo." + this.community.extension;
		//remoteServer = remoteServer + ":80/" + this.community.mobiquo_dir + "/mobiquo." + this.community.extension;
		
		//this.community.normalizedUrl = remoteServer;
		return remoteServer;
	
}

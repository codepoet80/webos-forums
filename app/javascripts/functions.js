function formatMainAppMenus(inShowLogout) {
	//Mojo.Log.info("formatMainAppMenus() called.");
	var showLogout = true;
	if (typeof inShowLogout != "undefined")
		showLogout = inShowLogout;
	//Mojo.Log.info("showLogout: " + showLogout);

	/*
	try { throw new Exception(); }
	catch (ex) {
		Mojo.Log.info("call stack:" + ex.stack);
	}
	*/

	var appMenuModel = {
		visible: true,
		items: [
			{
				label: $L("Forum"),
				disabled: true,
				items: []
			}
			]
	};

	appMenuModel.items.push(MenuData.ApplicationMenu.GoBack);	//Added by Jonathan Wise 11/14/2020

	if (!appSettings.Tapatalk.loggedIn) {
		appMenuModel.items.push(MenuData.ApplicationMenu.Login);
	}
	else if (showLogout) {
		//appSettings.currentScene
		//if (activeController.sceneName != "childForum")
		{
		appMenuModel.items.push(MenuData.ApplicationMenu.Logout);
		}
	}
	appMenuModel.items.push(MenuData.ApplicationMenu.NewCard);
	appMenuModel.items.push(MenuData.ApplicationMenu.Preferences);
	appMenuModel.items.push(MenuData.ApplicationMenu.Support);
	appMenuModel.items.push(MenuData.ApplicationMenu.Help);

	appMenuModel.items[0].items.push(MenuData.ApplicationMenu.Lastest);
	if (appSettings.Tapatalk.config.disable_lastest == "1" || appSettings.currentScene == "recentPosts") {
		appMenuModel.items[0].items[0].disabled = true;
	}
	else {
		appMenuModel.items[0].items[0].disabled = false;
	}
	appMenuModel.items[0].items.push(MenuData.ApplicationMenu.Subscribed);
	if(appSettings.currentScene == "subscribedPosts") {
		appMenuModel.items[0].items[1].disabled = true;
	} else {
		appMenuModel.items[0].items[1].disabled = false;
	}
	appMenuModel.items[0].items.push(MenuData.ApplicationMenu.ForumTree);
	if(appSettings.currentScene == "forums") {
		appMenuModel.items[0].items[2].disabled = true;
	} else {
		appMenuModel.items[0].items[2].disabled = false;
	}
	appMenuModel.items[0].items.push(MenuData.ApplicationMenu.PrivateMessages);
	if (appSettings.Tapatalk.config.disable_pm == "1" || appSettings.currentScene == "messages") {
		appMenuModel.items[0].items[3].disabled == true;
	} else {
		appMenuModel.items[0].items[3].disabled == false;
	}
	appMenuModel.items[0].items.push(MenuData.ApplicationMenu.Search);
	if (appSettings.Tapatalk.config.disable_search == "1" || appSettings.currentScene == "search") {
		appMenuModel.items[0].items[4].disabled == true;
	} else {
		appMenuModel.items[0].items[4].disabled == false;
	}

	return appMenuModel;

	if (!onlyItems) {
		return appMenuModel;
	}
	else {
		Mojo.Log.info("MENU ITEMS: ", Mojo.Log.info(Object.toJSON(appMenuModel.items)));
		return appMenuModel.items;
	}
};

function formatMainCommandMenus(){

	var commandMenuModel = {};
	var scene;

	switch(appSettings.currentScene) {
		case "recentPosts":
			scene = "go-recent";
			break;
		case "subscribedPosts":
			scene = "go-subscribed";
			break;
		case "forums":
			scene = "go-tree";
			break;
		case "messages":
			scene = "go-mail";
			break;
		case "search":
			scene = "go-search";
			break;
	}

		if (appSettings.Tapatalk.loggedIn || !appSettings.Tapatalk.config.api_level) {

			commandMenuModel = {
				visible: true,
				items: [{}, {
					items: [],
					toggleCmd: scene
				}, {}]
			};
			commandMenuModel.items[1].items.push(MenuData.CommandMenu.Recent);
			if (appSettings.Tapatalk.config.disable_lastest == "1") {
				commandMenuModel.items[1].items[0].disabled = true;
			}
			else {
				commandMenuModel.items[1].items[0].disabled = false;
			}
			commandMenuModel.items[1].items.push(MenuData.CommandMenu.Subscribed);
			commandMenuModel.items[1].items.push(MenuData.CommandMenu.Tree);
			commandMenuModel.items[1].items.push(MenuData.CommandMenu.Messages);
			
			if (appSettings.Tapatalk.config.disable_pm == "1") {
				commandMenuModel.items[1].items[3].disabled = true;
			}
			else {
				commandMenuModel.items[1].items[3].disabled = false;
			}
			commandMenuModel.items[1].items.push(MenuData.CommandMenu.Search);
			if (appSettings.Tapatalk.config.disable_search == "1") {
				commandMenuModel.items[1].items[4].disabled = true;
			}
			else {
				commandMenuModel.items[1].items[4].disabled = false;
			}
			//Mojo.Log.info(Object.toJSON(appSettings.Tapatalk.config));

		}
		else {

			commandMenuModel = {
				visible: true,
				items: [MenuData.CommandMenu.Login, {}, {}, {
					items: [],
					toggleCmd: scene
				}]
			};
			var menuPos = 3;
			commandMenuModel.items[menuPos].items.push(MenuData.CommandMenu.Recent);
			if (appSettings.Tapatalk.config.disable_lastest == "1") {
				commandMenuModel.items[menuPos].items[0].disabled = true;
			}
			else {
				commandMenuModel.items[menuPos].items[0].disabled = false;
			}
			commandMenuModel.items[menuPos].items.push(MenuData.CommandMenu.Tree);
			commandMenuModel.items[menuPos].items.push(MenuData.CommandMenu.Search);
			if (appSettings.Tapatalk.config.disable_search == "1") {
				commandMenuModel.items[menuPos].items[2].disabled = true;
			}
			else {
				commandMenuModel.items[menuPos].items[2].disabled = false;
			}
			//		Mojo.Log.info(Object.toJSON(appSettings.Tapatalk.config));

			//		this.commandMenuModel.items[1].items[3].disabled = appSettings.Tapatalk.config.allow_pm;

		}

		return commandMenuModel;
};

function getDefaultView(loggedIn) {
	var res = appSettings.config.defaultView;
	if (!loggedIn && (res == "subscribedPosts" || res == "messages")) {
		res = "forums";
	}
	Mojo.Log.info("getDefaultView, loggedIn: " + loggedIn + ", default view: " + appSettings.config.defaultView + ", returning: " + res);
	return res;
}

   var escapable = /[\\\"\x00-\x1f\x7f-\uffff]/g,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };

    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }

function stringToHex (s) {
  var r = "0x";
  var hexes = new Array ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");
  for (var i=0; i<s.length; i++) {r += hexes [s.charCodeAt(i) >> 4] + hexes [s.charCodeAt(i) & 0xf];}
  return r;
}

function hexToString (h) {
  var r = "";
  for (var i= (h.substr(0, 2)=="0x")?2:0; i<h.length; i+=2) {r += String.fromCharCode (parseInt (h.substr (i, 2), 16));}
  return r;
}

function isEmptyJSON(object) {
for(var i in object) { return true; }
return false;
}


function string2Bin(str) {
  var result = [];
  for (var i = 0; i < str.length; i++) {
    result.push(str.charCodeAt(i));
  }
  return result.join();
}


String.prototype.toCharCode = function(){
    var str = this.split(''), len = str.length, work = new Array(len);
    for (var i = 0; i < len; ++i){
        work[i] = String.charCodeAt(str[i]);
    }
    return work.join(',');
};

String.prototype.toByteArray = function(){
	var b = new Array();
	var last = this.length;

	for (var i = 0; i < last; i++) {
		var d = this.charCodeAt(i);
		if (d < 128)
			b[i] = dec2Bin(d);
		else {
			var c = this.charAt(i);
			Mojo.Log.info(c + ' is NOT an ASCII character');
			b[i] = -1;
		}
	}
	return b;
};

function dec2Bin(d) {
 var b = '';

 for (var i = 0; i < 8; i++) {
 b = (d%2) + b;
 d = Math.floor(d/2);
 }

 return b;
}


String.prototype.makeBinary64 = function(){

	var stringLength = this.length;

	var base64String = new StringArchive();
	var currentByteIndex = 0;
	var count = 1024 * 20;
	var lengthBytes = stringLength;


		// encode base64 the string
		currentByteIndex = encodeChunk64(base64String, currentByteIndex, count, this);

		if (currentByteIndex >= lengthBytes) {
			// callback with base64 string
			var base64StringDone = base64String.toString();

			return base64String;
		}

};

//////// String Buffer

function StringArchive(){
    this.buffer = [];
    this.bufferCurrent = ""
}

StringArchive.prototype.append = function append(string){
    this.bufferCurrent += string;
    if (this.bufferCurrent.length >= 1024) {
        this.buffer.push(this.bufferCurrent);
        this.bufferCurrent = "";
    }
    return this;
}

StringArchive.prototype.toString = function toString(){
    if (this.bufferCurrent.length > 0) {
        this.buffer.push(this.bufferCurrent);
        this.bufferCurrent = "";
    }
    return this.buffer.join("");
}

/**********
 * PRUEBAS RARAS
 *
 */

function urlDecode(str){
    str=str.replace(new RegExp('\\+','g'),' ');
    return unescape(str);
}
function urlEncode(str){
    str=escape(str);
    str=str.replace(new RegExp('\\+','g'),'%2B');
    return str.replace(new RegExp('%20','g'),'+');
}

var END_OF_INPUT = -1;

var base64Chars = new Array(
    'A','B','C','D','E','F','G','H',
    'I','J','K','L','M','N','O','P',
    'Q','R','S','T','U','V','W','X',
    'Y','Z','a','b','c','d','e','f',
    'g','h','i','j','k','l','m','n',
    'o','p','q','r','s','t','u','v',
    'w','x','y','z','0','1','2','3',
    '4','5','6','7','8','9','+','/'
);

var reverseBase64Chars = new Array();
for (var i=0; i < base64Chars.length; i++){
    reverseBase64Chars[base64Chars[i]] = i;
}

var base64Str;
var base64Count;
function setBase64Str(str){
    base64Str = str;
    base64Count = 0;
}
function readBase64(){
    if (!base64Str) return END_OF_INPUT;
    if (base64Count >= base64Str.length) return END_OF_INPUT;
    var c = base64Str.charCodeAt(base64Count) & 0xff;
    base64Count++;
    return c;
}
function encodeBase64(str){
    setBase64Str(str);
    var result = '';
    var inBuffer = new Array(3);
    var lineCount = 0;
    var done = false;
    while (!done && (inBuffer[0] = readBase64()) != END_OF_INPUT){
        inBuffer[1] = readBase64();
        inBuffer[2] = readBase64();
        result += (base64Chars[ inBuffer[0] >> 2 ]);
        if (inBuffer[1] != END_OF_INPUT){
            result += (base64Chars [(( inBuffer[0] << 4 ) & 0x30) | (inBuffer[1] >> 4) ]);
            if (inBuffer[2] != END_OF_INPUT){
                result += (base64Chars [((inBuffer[1] << 2) & 0x3c) | (inBuffer[2] >> 6) ]);
                result += (base64Chars [inBuffer[2] & 0x3F]);
            } else {
                result += (base64Chars [((inBuffer[1] << 2) & 0x3c)]);
                result += ('=');
                done = true;
            }
        } else {
            result += (base64Chars [(( inBuffer[0] << 4 ) & 0x30)]);
            result += ('=');
            result += ('=');
            done = true;
        }
        lineCount += 4;
        if (lineCount >= 76){
            result += ('\n');
            lineCount = 0;
        }
    }
    return result;
}
function readReverseBase64(){
    if (!base64Str) return END_OF_INPUT;
    while (true){
        if (base64Count >= base64Str.length) return END_OF_INPUT;
        var nextCharacter = base64Str.charAt(base64Count);
        base64Count++;
        if (reverseBase64Chars[nextCharacter]){
            return reverseBase64Chars[nextCharacter];
        }
        if (nextCharacter == 'A') return 0;
    }
    return END_OF_INPUT;
}

function ntos(n){
    n=n.toString(16);
    if (n.length == 1) n="0"+n;
    n="%"+n;
    return unescape(n);
}

function decodeBase64(str){
    setBase64Str(str);
    var result = "";
    var inBuffer = new Array(4);
    var done = false;
    while (!done && (inBuffer[0] = readReverseBase64()) != END_OF_INPUT
        && (inBuffer[1] = readReverseBase64()) != END_OF_INPUT){
        inBuffer[2] = readReverseBase64();
        inBuffer[3] = readReverseBase64();
        result += ntos((((inBuffer[0] << 2) & 0xff)| inBuffer[1] >> 4));
        if (inBuffer[2] != END_OF_INPUT){
            result +=  ntos((((inBuffer[1] << 4) & 0xff)| inBuffer[2] >> 2));
            if (inBuffer[3] != END_OF_INPUT){
                result +=  ntos((((inBuffer[2] << 6)  & 0xff) | inBuffer[3]));
            } else {
                done = true;
            }
        } else {
            done = true;
        }
    }
    return result;
}

var digitArray = new Array('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f');
function toHex(n){
    var result = ''
    var start = true;
    for (var i=32; i>0;){
        i-=4;
        var digit = (n>>i) & 0xf;
        if (!start || digit != 0){
            start = false;
            result += digitArray[digit];
        }
    }
    return (result==''?'0':result);
}

function pad(str, len, pad){
    var result = str;
    for (var i=str.length; i<len; i++){
        result = pad + result;
    }
    return result;
}

function encodeHex(str){
    var result = "";
    for (var i=0; i<str.length; i++){
        result += pad(toHex(str.charCodeAt(i)&0xff),2,'0');
    }
    return result;
}

var hexv = {
  "00":0,"01":1,"02":2,"03":3,"04":4,"05":5,"06":6,"07":7,"08":8,"09":9,"0A":10,"0B":11,"0C":12,"0D":13,"0E":14,"0F":15,
  "10":16,"11":17,"12":18,"13":19,"14":20,"15":21,"16":22,"17":23,"18":24,"19":25,"1A":26,"1B":27,"1C":28,"1D":29,"1E":30,"1F":31,
  "20":32,"21":33,"22":34,"23":35,"24":36,"25":37,"26":38,"27":39,"28":40,"29":41,"2A":42,"2B":43,"2C":44,"2D":45,"2E":46,"2F":47,
  "30":48,"31":49,"32":50,"33":51,"34":52,"35":53,"36":54,"37":55,"38":56,"39":57,"3A":58,"3B":59,"3C":60,"3D":61,"3E":62,"3F":63,
  "40":64,"41":65,"42":66,"43":67,"44":68,"45":69,"46":70,"47":71,"48":72,"49":73,"4A":74,"4B":75,"4C":76,"4D":77,"4E":78,"4F":79,
  "50":80,"51":81,"52":82,"53":83,"54":84,"55":85,"56":86,"57":87,"58":88,"59":89,"5A":90,"5B":91,"5C":92,"5D":93,"5E":94,"5F":95,
  "60":96,"61":97,"62":98,"63":99,"64":100,"65":101,"66":102,"67":103,"68":104,"69":105,"6A":106,"6B":107,"6C":108,"6D":109,"6E":110,"6F":111,
  "70":112,"71":113,"72":114,"73":115,"74":116,"75":117,"76":118,"77":119,"78":120,"79":121,"7A":122,"7B":123,"7C":124,"7D":125,"7E":126,"7F":127,
  "80":128,"81":129,"82":130,"83":131,"84":132,"85":133,"86":134,"87":135,"88":136,"89":137,"8A":138,"8B":139,"8C":140,"8D":141,"8E":142,"8F":143,
  "90":144,"91":145,"92":146,"93":147,"94":148,"95":149,"96":150,"97":151,"98":152,"99":153,"9A":154,"9B":155,"9C":156,"9D":157,"9E":158,"9F":159,
  "A0":160,"A1":161,"A2":162,"A3":163,"A4":164,"A5":165,"A6":166,"A7":167,"A8":168,"A9":169,"AA":170,"AB":171,"AC":172,"AD":173,"AE":174,"AF":175,
  "B0":176,"B1":177,"B2":178,"B3":179,"B4":180,"B5":181,"B6":182,"B7":183,"B8":184,"B9":185,"BA":186,"BB":187,"BC":188,"BD":189,"BE":190,"BF":191,
  "C0":192,"C1":193,"C2":194,"C3":195,"C4":196,"C5":197,"C6":198,"C7":199,"C8":200,"C9":201,"CA":202,"CB":203,"CC":204,"CD":205,"CE":206,"CF":207,
  "D0":208,"D1":209,"D2":210,"D3":211,"D4":212,"D5":213,"D6":214,"D7":215,"D8":216,"D9":217,"DA":218,"DB":219,"DC":220,"DD":221,"DE":222,"DF":223,
  "E0":224,"E1":225,"E2":226,"E3":227,"E4":228,"E5":229,"E6":230,"E7":231,"E8":232,"E9":233,"EA":234,"EB":235,"EC":236,"ED":237,"EE":238,"EF":239,
  "F0":240,"F1":241,"F2":242,"F3":243,"F4":244,"F5":245,"F6":246,"F7":247,"F8":248,"F9":249,"FA":250,"FB":251,"FC":252,"FD":253,"FE":254,"FF":255
};

function decodeHex(str){
    str = str.toUpperCase().replace(new RegExp("s/[^0-9A-Z]//g"));
    var result = "";
    var nextchar = "";
    for (var i=0; i<str.length; i++){
        nextchar += str.charAt(i);
        if (nextchar.length == 2){
            result += ntos(hexv[nextchar]);
            nextchar = "";
        }
    }
    return result;

}

function JsonKeyExists(p, a) {
 for (i in a) {
  var key = a[i];
  if (p[key] == null)
    return false;
 }
 return true;
}

function logJSON(jsonstr) {
	//if (!appSettings.debug.detailedLogging)
	//	return;

	var nl=jsonstr.indexOf("\n");
	var idx=0;
	while (nl>0) {
	  Mojo.Log.info("'"+jsonstr.substring(idx,nl));
	  idx=nl+1;
	  nl=jsonstr.indexOf("\n", idx);
	}
	if (nl<0 && idx < jsonstr.length) {
		Mojo.Log.info("'"+jsonstr.substring(idx));
	}
}

function logBreak(formatted)
{
	try
	{
		var ii = 0;
		var jl = formatted.length;
		while (ii < jl)
		{
			console.log(formatted.substring(ii,ii+800));
			ii+=800;
		}
	}
	catch (ex)
	{
		console.log("Exception in logJSON:" + Object.toJSON(ex));
	}
}
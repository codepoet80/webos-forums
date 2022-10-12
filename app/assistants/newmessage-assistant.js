/*
 * FMForums newmessage assistant, with image uploading code.
 */
function NewmessageAssistant( parameters, moreparams ) 
{
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.filepath = null;
	this.board = null;
	this.topicid = 0;
	//Mojo.Log.info("FMForums.myid = " + FMForums.myid);
	//FMForums.myid = FMForums.myid != "" ? FMForums.myid : 'Grabber5.0';

	Mojo.Log.info("Scene parameters: " + Object.toJSON(parameters));
	if (parameters != null && parameters != "")
	{
		if (parameters.currentTopic && parameters.currentTopic.forum_id) {
			this.forumId = parameters.currentTopic.forum_id;
			this.topicid = parameters.currentTopic.topic_id;
			this.groupid = parameters.currentTopic.group_id;
		}
		else {
			this.board = parameters;
			this.topicid = parameters.currentTopic;
			this.forumId = parameters.forum_id;
		}
	}
	else
	{
		this.board = "off-topic";
	}
	Mojo.Log.info("Newmessage constructor, this.board: " + this.board);

	if (moreparams)
	{
		Mojo.Log.info("moreparams: " + Object.toJSON(moreparams));
		this.board = moreparams.board;
		this.topicid = moreparams.topicid;
		this.replysubject = moreparams.replysubject;
	}
}

NewmessageAssistant.prototype.doSubmitWithFile = function(event)
{
// increment the total and update the display
   this.controller.get('status').update("Submitting message with attachment, please be patient.");
	if (event)
	{
		Mojo.Log.info("Event received by doSubmit: " + event);
	}

	if (this.filepath == null)
	{
		//this.filepath = "";
		//Let's just see what happens when this is null.....
  		this.controller.get('status').update("You must pick a file first.");
		return;
	}
	if (!this.forumId) {
		Mojo.Log.error("Forum_id is not populated!");
		this.controller.get('status').update("Forum_id is not populated!" );
		return false;
	}

  //Start upload..
	var targeturl='http://www.fordmaverick.com/phpBB3/mobiquo/upload.php';
	try {
	targeturl = appSettings.currentForum.url + (appSettings.currentForum.url.substring(appSettings.currentForum.url.length-1) == '/' ? "" : "/") +
				appSettings.currentForum.mobiquo_dir + "/upload." + appSettings.currentForum.extension;
	} catch (ex) {
		Mojo.Log.info("Error setting forum url: " + ex);
	}
	var postparams = [];
   postparams.push({ 'key' :'method_name', 'data': 'upload_attach' });
   postparams.push({ 'key' :'forum_id', 'data': this.forumId });
   //TODO: send group_id if adding multiple attachments.
   if (this.groupid) {
	   postparams.push({ 'key' :'group_id', 'data': this.groupid });
   }

//	var customHttpHeaders = [ 'appid: com.grabber.fmforums',
//	                      	'EXPECT: ',
//	                      	'cookie: timezone=CST; pagesize=25',
//	                      	'Authorization:' + loginauth //(64 bit encoded login id and pwd) 
//	                      	];
   
	// Return the document's cookies as an object of name/value pairs.
	// Assume that cookie values are encoded with encodeURIComponent().
	function getCookies(incookies) {
	    var cookies = [];           // The object we will return
	    var all = incookies;  // Get all cookies in one big string
	    if (all === "")             // If the property is the empty string
	        return cookies;         // return an empty object
	    var list = all.split(","); // Split into individual name=value pairs
	    var skipNextCookie = false;
	    for(var i = 0; i < list.length; i++) {  // For each cookie
	        var cookie = list[i];
	        if (cookie.indexOf(";") > 0 && cookie.indexOf(";") < cookie.indexOf("=")) {
	        	continue;
	        }
	        var p = cookie.indexOf("=");        // Find the first = sign
	        var name = cookie.substring(0,p);   // Get cookie name
	        var value = cookie.substring(p+1);  // Get cookie value
	        var p2 = value.indexOf(";");
	        if (p2 > 0) {
	        	value = value.substring(0,p2);
	
	        }
	        value = decodeURIComponent(value);  // Decode the value
	        if (!skipNextCookie) {
	        //cookies[name] = value;              // Store name and value in object
	        cookies.push(name+"="+value+";");
	        }
	    }
	    var v=""; 
	    cookies.forEach(function(cookie) { 
	    	v+=cookie+" "; 
	    	} );
	    //console.log(v);
	    //return cookies;
	    return v;
	}
	 
	 try {
		 Mojo.Log.warn("Assembled cookie string: " + getCookies(appSettings.Tapatalk.headers));
		 //var cookies = get_cookies(appSettings.Tapatalk.headers);
		 //Mojo.Log.info("parsed Cookies: " + JSON.stringify(cookies));
	 } catch (ex) {
		 Mojo.Log.error("Unable to parse cookies from header: " + ex);
	 }
   //Send taptalk cookie headers..
//   var customHttpHeaders = [ 
//                             'cookie: ' + "mobiquo_c=0; phpbb3_24vdp_u=2; phpbb3_24vdp_k=54a385ec3dab4b4a; phpbb3_24vdp_sid=f53caeb3170d04a131d2e4565076d4d6" //appSettings.Tapatalk.headers 
//                             ];
	var loginauth = 'MattSaidSo';
	var customHttpHeaders = [ 
//		'appid: com.newnessdevelopments.forums',
//		'Authorization:' + loginauth //(64 bit encoded login id and pwd), 
//		'User-Agent: Mozilla/5.0 (webOS/2.1.0; U; en-US) AppleWebKit/532.2 (KHTML, like Gecko) Version/1.0 Safari/532.2 Pre/1.2',
//		'Connection: Keep-Alive',
//		'Set-Cookie: ' + appSettings.Tapatalk.headers, //This was just a test to try to fix vbulletin upload problem.
		'Cookie: ' + getCookies(appSettings.Tapatalk.headers)
	];
	//customHttpHeaders = 'cookie: ' + appSettings.Tapatalk.headers;
   
   //targeturl = "http://www.fordmaverick.com/addMessageWithFile.jsp";
   Mojo.Log.info("doSubmit, targetURL: " + targeturl);
   Mojo.Log.info("Sending headers:" + customHttpHeaders);
   Mojo.Log.info("Post data:" + JSON.stringify(postparams));
   
   //(this.filepath.indexOf('.jpg') == this.filepath.length - 4)

   //	'fileLabel': 'attachment[]', //TODO: for phpBB is 'fileupload', for VB (and probably many others..) it is 'attachment[]'
   //	'fileLabel': 'fileupload', //TODO: for phpBB is 'fileupload', for VB it is 'attachment[]'
   var filelabel = "attachment[]";
	var forumSystem = appSettings.Tapatalk.config.version.substr(0, 2);
	switch (forumSystem.toLowerCase()) {
		case "pb":
			filelabel = "fileupload";
			break;
		case "vb":
			filelabel = "attachment[]";
			break;
	};
   
	this.controller.serviceRequest('palm://com.palm.downloadmanager/', {
	method: 'upload', 
	parameters: 
	{
		'fileName': this.filepath,
		'fileLabel': filelabel,
		'contentType': this.filetype, //'image/jpg',
		'customHttpHeaders': customHttpHeaders,
		//'Cookie': customHttpHeaders,
		'postParameters': postparams,
		'url': targeturl,
		subscribe: true 
	},
	onSuccess : function (resp) {
		if (resp.completed)
		{
			this.filepath = null;
			this.controller.get('status').update("Submit complete. ");// + Object.toJSON(resp));
			Mojo.Log.info("addMsgWithFile, respString:" + (resp.responseString));
			//Mojo.Log.info("addMsgWithFile, respJSON:" + (resp.responseJSON));
			try {
				  uploadResp = this.parseResponse(resp.responseString);
				  var resp={};
				  try {
					  resp = xmlrpc.parseResponse(uploadResp);
				  Mojo.Log.info("Response: " + JSON.stringify(resp));
			  }
			  catch (exp) { Mojo.Log.error("ex: " + exp); }

			  if (resp && resp.result)
			  {
				  this.controller.stageController.popScene( resp );
			  }
			  else {
				  Mojo.Log.error("Error uploading attachment: " + JSON.stringify(resp.result_text));
			  }
			}
			catch (jsonex)
			{
			  Mojo.Log.info("Unable to parse JSON response." + jsonex);
			  this.controller.get('status').update("Error parsing JSON response. " );
			}
		}
		else if (resp.returnValue)
		{
			this.controller.get('status').update("Submit started...");
		}
		else
		{
			this.controller.get('status').update("Progress: " + Object.toJSON(resp));
		}
		Mojo.Log.info('Success : ' + Object.toJSON(resp));
	}.bind(this),
	onFailure : function (resp) {
		this.controller.get('status').update("Submit failed.  See log for details.");
		Mojo.Log.error('Failure: ' + Object.toJSON(resp));
	}.bind(this)
});	 
		
}

NewmessageAssistant.prototype.parseResponse = function(xmlstring) {
	var responseDoc = (new DOMParser()).parseFromString(xmlstring, "text/xml");
	if (false) {
		  //var responseDoc = req.responseXML;
		  try { Mojo.Log.info("response doc: " + JSON.stringify(responseDoc)); } catch (ex) {}
		  
		  Mojo.Log.info("Processing responseXML");
		  
		  try {
	//	  othis.controller.get('status').update(this + ": Processing responseXML..");
		  var respBody = responseDoc.getElementsByTagName("methodResponse")[0];
		  //respBody = null;
		  //return;
		  if (respBody != null)
		  {
		    var locsNode = respBody.getElementsByTagName("params")[0];
		    Mojo.Log.info("Processing methodResponse.");
		    var locationNode = locsNode.getElementsByTagName("member");
		    var locNum = 0;
		    Mojo.Log.info("Num members: " + locationNode.length);
		    var geocoderesult ="";
		    var precision="";
		    if (locationNode != null && locationNode.length > 0) 
		    {
		      for (locNum=0;locNum<locationNode.length;locNum++) {
		    	  geocoderesult += ", member " + (locNum) + ": " + locationNode[locNum].getElementsByTagName("name")[0].firstChild.nodeValue;
		    	  var membervalue = locationNode[locNum].getElementsByTagName("value")[0].firstChild.firstChild.nodeValue;
		    	  if (membervalue) {
		    		  Mojo.Log.info("value: " + Base64.decode(membervalue));
		    	  }
		    	  geocoderesult += ", value: " + membervalue;
		      }
		    }
		    Mojo.Log.info("result:" + geocoderesult);
		    //Mojo.Log.info("Precision:" + precision);
		    //Mojo.Controller.getAppController().showBanner({messageText: geocoderesult}, "launchArguments", "myCategory");
		    	    
		  }
		  respBody = null;
		  //responseDoc = null;
		  } catch (ex) {
			  Mojo.Log.error("Error parsing xml response.");
		  }
	}
	return responseDoc;
}

NewmessageAssistant.prototype.setup = function() {

/*
   var get_cookies = function (incookie)
   {
	   var allcookies = incookie;
	   Mojo.Log.info("All Cookies : " + allcookies );

	   // Get all the cookies pairs in an array
	   cookiearray  = allcookies.split(';');

	   // Now take key value pair out of this array
	   for(var i=0; i<cookiearray.length; i++){
	      name = cookiearray[i].split('=')[0];
	      if (name.indexOf("HttpOnly") >= 0)
	    	  name = name.split(',')[1];
	      value = cookiearray[i].split('=')[1];
	      
	      Mojo.Log.info("Key is : " + name + " and Value is : " + value);
	   }
	};
	 
	 try {
		 get_cookies(appSettings.Tapatalk.headers);
		 //var cookies = get_cookies(appSettings.Tapatalk.headers);
		 //Mojo.Log.info("parsed Cookies: " + JSON.stringify(cookies));
	 } catch (ex) {
		 Mojo.Log.error("Unable to parse cookies from header: " + ex);
	 }
*/

	//Added by Jon W 6/7/2021
	this.appMenuModel = {
		visible: true,
		items: [
			MenuData.ApplicationMenu.GoBack,
			]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, {
		omitDefaultItems: false
	}, this.appMenuModel);
	
	this.cmdMenuModel = {
	    visible: true,
	    items: [
	        {items:[{label: $L('Load Image'), command:'pickimg'}]},
	        {items:[
	          {label: $L('Cancel'), command:'docancel'},
	          {label: $L('Submit'), command:'dosubmit'}
	         ]}
	    ]
	};
	 
	this.controller.setupWidget(Mojo.Menu.commandMenu, undefined, this.cmdMenuModel);
	//this.controller.setupWidget(Mojo.Menu.viewMenu, undefined, this.cmdMenuModel);

		var subjattributes = {
				hintText: 'Enter a subject for your message',
				textFieldName:	'subject', 
				modelProperty:		'subject', 
				multiline:		false,
				disabledProperty: 'disabled',
				focus: 			!this.replysubject,  //true
				//modifierState: 	Mojo.Widget.capsLock,
				limitResize: 	false, 
				holdToEnable:  false, 
				focusMode:		Mojo.Widget.focusSelectMode,
				autoReplace: true,
				changeOnKeyPress: false, //true,
				textReplacement: false,
				maxLength: 120,
				requiresEnterKey: false
		};
		var newmsgattributes = {
				hintText: 'Enter a message',
				textFieldName:	'newmsg', 
				modelProperty:		'newmsg', 
				multiline:		true,
				disabledProperty: 'disabled',
				focus: 			this.replysubject,  //false
				limitResize: 	false, 
				holdToEnable:  false, 
				focusMode:		Mojo.Widget.focusSelectMode,
				autoReplace: true,
				changeOnKeyPress: false, //true,
				textReplacement: false,
				textCase: Mojo.Widget.steModeSentenceCase,
				requiresEnterKey: false
		};
			
		this.model = {
			'subject' : this.replysubject ? this.replysubject : '',
			'newmsg' : '',
			disabled: false
		};

		this.controller.setupWidget('subject', subjattributes, this.model);
		this.controller.setupWidget('newmsg', newmsgattributes, this.model);
		this.propertyChanged = this.propertyChanged.bind(this);
		this.doSubmitWithFile = this.doSubmitWithFile.bind(this);
		this.logText = this.logText.bind(this);
		this.fileSelected = this.fileSelected.bind(this)
		Mojo.Event.listen(this.controller.get('subject'), Mojo.Event.propertyChange, this.propertyChanged);

    this.dodebug=false;

}

NewmessageAssistant.prototype.handleCommand = function(event) {
	//Mojo.Log.info("handleCommand - this:" + this);
    if (event.type === Mojo.Event.command) {
    	 Mojo.Log.info("command:" + event.command);
        switch (event.command) {
                case "pickimg":
                       this.openPicker();
                		  break;
                case "docancel":
                       this.controller.stageController.popScene( { "lastaction" : "cancel", "success" : true } );
                       break;

                case "dosubmit":
                       this.doSubmitWithFile(event);
                		  break;
        }
    }
}

NewmessageAssistant.prototype.openPicker = function() {
/* from file picker 
		{ actionType: 'attach', kinds: ['image'] }
		{ actionType: 'attach', kinds: ['audio', 'video'], defaultKind: 'audio' }
		{ actionName: 'Select', kinds: ['other'] }
*/
	var params = {
		kinds: ['image'],
		defaultKind: 'image',
		onSelect: this.fileSelected
	};
	Mojo.FilePicker.pickFile(params, this.controller.stageController);
};

NewmessageAssistant.prototype.fileSelected = function(file) {
	Mojo.Log.info("Picker returned, picked file:" + Object.toJSON(file));
	try {			
		this.filepath = file.fullPath;
		this.controller.get('status').update("Selected file: " + this.filepath);
	}
	catch (er)
	{
		Mojo.Log.info("Caught exception onSelect callback" + er);
	}
	this.filetype = "image/png";
	try {
		if (!this.filepath.endsWith) {
			Mojo.Log.info("Adding endsWith function");
			String.prototype.endsWith = function(suffix) {
			    return this.indexOf(suffix, this.length - suffix.length) !== -1;
			};			
		}
		if (this.filepath.endsWith(".jpg") || this.filepath.endsWith(".JPG") || this.filepath.endsWith(".jpeg") || this.filepath.endsWith(".JPEG")) {
			this.filetype="image/jpg";
		}
		else if (this.filepath.endsWith(".png") || this.filepath.endsWith(".PNG")) {
			this.filetype="image/png";
		}
	}
	catch (ex) {
		Mojo.Log.info("Unable to evaluate filepath: " + JSON.stringify(ex));
	}
	Mojo.Log.info("filetype: " + this.filetype);

}

NewmessageAssistant.prototype.propertyChanged = function(event){
	/* log the text field value when the value changes */
		//Mojo.Log.info("********* property Change *************: " + this.model);       
}


NewmessageAssistant.prototype.activate = function(record) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	   if (record)
	   {
	   	 //Mojo.Log.info(this + " Called with id of:" + Object.toJSON(record));
	   }
}


NewmessageAssistant.prototype.deactivate = function(record) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
}

NewmessageAssistant.prototype.cleanup = function(record) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
}
NewmessageAssistant.prototype.logText = function(formatted)
{
	try
	{
	//var formatted = JSON.stringify(jsonstr,null,'\t');
	//var formatted = JSON.stringify(jsonstr,null,4);
	var ii = 0;
	var jl = formatted.length;
	while (ii < jl)
	{
		Mojo.Log.info("logText:" + formatted.substring(ii,ii+900));
		ii+=900;
	}
	}
	catch (ex)
	{
		Mojo.Log.error("Exception in logText:" + Object.toJSON(ex));
	}
}

NewmessageAssistant.prototype.logJSON = function(jsonstr)
{
	try
	{
		Mojo.Log.info("logJSON started.");
	var formatted = JSON.stringify(jsonstr,null,'\t');
	//var formatted = JSON.stringify(jsonstr,null,4);
	var ii = 0;
	var jl = formatted.length;
	while (ii < jl)
	{
		Mojo.Log.info("logJSON:" + formatted.substring(ii,ii+900));
		ii+=900;
	}
	}
	catch (ex)
	{
		Mojo.Log.error("Exception in logJSON:" + Object.toJSON(ex));
	}
}



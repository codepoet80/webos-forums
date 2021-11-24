var social = function() {
	
}

social.tweet = function(message, callbackOk, callbackFail) {

	var url = "http://twitter.com/statuses/update.json";
	var method = "post";
	var objParameters = {
				status: message
	};

	var parameterMap = social.getOAuthParameters(url, method, appSettings.config.twitter.oauth_token, appSettings.config.twitter.oauth_token_secret, objParameters);

	var OAuthString = " ";
		//OAuthString += "OAuth realm=\""+ normalizedUrl +"\"";
		OAuthString += "OAuth realm=\"Twitter API\"";
		OAuthString += ",oauth_consumer_key=\""+ parameterMap.oauth_consumer_key +"\"";
		OAuthString += ",oauth_nonce=\""+ parameterMap.oauth_nonce +"\"";
		OAuthString += ",oauth_timestamp=\""+ parameterMap.oauth_timestamp +"\"";
		OAuthString += ",oauth_token=\""+ appSettings.config.twitter.oauth_token +"\"";
		OAuthString += ",oauth_signature_method=\""+ parameterMap.oauth_signature_method +"\"";
		OAuthString += ",oauth_version=\""+ parameterMap.oauth_version +"\"";
		OAuthString += ",oauth_signature=\""+ encodeURIComponent(parameterMap.oauth_signature) +"\"";
		

	var request = new Ajax.Request(url, {
		method: method,
		parameters: objParameters,
		requestHeaders: ["Authorization", OAuthString],
		evalJSON: 'true',
		onSuccess: callbackOk, //social.handleTwitterResponse,
		onFailure: callbackFail //social.handleTwitterErr
	});


};

social.getOAuthParameters = function(action, method, in_token, in_tokenSecret, objParameters){

		var tokenSecret = '';
		if(in_tokenSecret) tokenSecret = in_tokenSecret;
	    var accessor = { consumerSecret: appSettings.twitter.consumerSecret
	                   , tokenSecret   : tokenSecret};
		
		
		parameters = [];
		if(objParameters){
			for(var i in objParameters){
				parameters.push([i, objParameters[i]]);
			}
		}
		parameters.push(["oauth_consumer_key", appSettings.twitter.consumerKey]);
		parameters.push(["oauth_nonce", ""]);
		parameters.push(["oauth_signature_method", "HMAC-SHA1"]);
		parameters.push(["oauth_timestamp", ""]);
		if(in_tokenSecret) parameters.push(["oauth_token", in_token]);
		parameters.push(["oauth_version", "1.0"]);
		parameters.push(["oauth_signature", ""]);
		
	    var message = { action: action
	                  , method: method
	                  , parameters: parameters
	                  };
	    OAuth.setTimestampAndNonce(message);
	    OAuth.SignatureMethod.sign(message, accessor);
		
	    var parameterMap = OAuth.getParameterMap(message.parameters);
		return parameterMap;
	};

social.requestToken = function() {
    //Mojo.Log.info("^^^^^^ AuthorizeAssistant#RequestToek");
 try {
 	var request_url = "https://twitter.com/oauth/request_token";
 	
 	var accessor = {
 		consumerKey: appSettings.twitter.consumerKey,
 		consumerSecret: appSettings.twitter.consumerSecret
 	};
 	
 	var message = {
 		action: request_url,
 		method: "POST",
 		parameters: []
 	};
 	
 	OAuth.completeRequest(message, accessor);
 	
 	var post_body = OAuth.formEncode(message.parameters);
 	
 	var req = new Ajax.Request(request_url, {
 		method: 'post',
 		evalJSON: 'force',
 		postBody: post_body,
 		onSuccess: social.requestTokenSuccess,
 		onFailure: social.requestTokenFailure
 	});
 } catch (e) {
 	Mojo.Log.error("requestToken ERROR: ", e);
 }
};

social.requestTokenSuccess = function(response) {
    Mojo.Log.info("^^^^^^ AuthorizeAssistant#RequestTokenSuccess");
    
    Mojo.Log.info("Success: ", Object.toJSON(response.responseText));
    
    var authorize_url = "https://twitter.com/oauth/authorize/?" + response.responseText;
    
    //social.launchBrowser(authorize_url);
	Mojo.Controller.stageController.pushScene("social-authorizacion", authorize_url);
    
    var parameters = response.responseText.split("&");
    
    appSettings.config.twitter.oauth_token = parameters[0].replace("oauth_token=", "");
    appSettings.config.twitter.oauth_token_secret = parameters[1].replace("oauth_token_secret=", "");
    
    Mojo.Log.info("Request Token: ", appSettings.config.twitter.oauth_token);
    Mojo.Log.info("Request Token Secret: ", appSettings.config.twitter.oauth_token_secret);
    
    //this.controller.get("start_button").mojo.deactivate();
    //this.controller.get("authorization_number").mojo.focus();
};

social.requestTokenFailure = function(error) {
    Mojo.Log.info("^^^^^^ AuthorizeAssistant#RequestTokenFailure");
    
    //Mojo.Log.info("Failure: ", Object.toJSON(error));
    
    this.controller.get("start_button").mojo.deactivate();
    
    //RequestError.show(error, this.controller.window);
    Mojo.Controller.errorDialog(error.status + ": " + error.responseText, this.controller.window);
};

social.getAccessToken = function(PIN) {
    Mojo.Log.info("^^^^^^ AuthorizeAssistant#GetAccessToken");
    
    var request_url = "https://twitter.com/oauth/access_token";
    
    var accessor = {
	    consumerKey: appSettings.twitter.consumerKey,
	    consumerSecret: appSettings.twitter.consumerSecret
	    };

    var parameters = [['oauth_token', appSettings.config.twitter.oauth_token], 
                      ['oauth_token_secret', appSettings.config.twitter.oauth_token_secret],
                      ['oauth_verifier', PIN]];      
                        
	var message = {action: request_url, method: "POST", parameters: parameters};
	    
	OAuth.completeRequest(message, accessor);        
    
    var post_body = OAuth.formEncode(message.parameters);    
        
    var req = new Ajax.Request(request_url, {
        method: 'post',
        evalJSON: 'force',
        postBody: post_body,
        onSuccess: social.getAccessTokenSuccess,
        onFailure: social.getAccessTokenFailure
    });
};

social.getAccessTokenSuccess = function(response) {
    Mojo.Log.info("^^^^^^ AuthorizeAssistant#GetAccessTokenSuccess");
    
    Mojo.Log.info("Access Success: ", Object.toJSON(response.responseText));
    
    var parameters = response.responseText.split('&');
    //var account = new AccountModel();
    appSettings.config.twitter.oauth_token = parameters[0].replace("oauth_token=", "");
    appSettings.config.twitter.oauth_token_secret = parameters[1].replace("oauth_token_secret=", "");
    appSettings.config.twitter.idStr = parameters[2].replace("user_id=", "");
    appSettings.config.twitter.screenName = parameters[3].replace("screen_name=", "");
	appSettings.config.twitter.authorized = true;
    
    Mojo.Log.info("Account: ", Object.toJSON(appSettings.config.twitter));
    
/*
    //make this account default if no other has been made
    if(Carbon.Prefs.DEFAULT_ACCOUNT == null) {
    Carbon.Prefs.DEFAULT_ACCOUNT = account.idStr;
    Carbon.savePrefs();
    }

*/    
    //Mojo.controller.stageController.showAlertDialog("@"+ appSettings.config.twitter.screenName+" Authorized");
	controller = Mojo.Controller.stageController.activeScene();
	//var controller = Mojo.Controller.stageController.activeScene();
	Mojo.Log.info("Enviando evento...");
	controller.get("username").innerHTML = "@"+ appSettings.config.twitter.screenName;
	controller.get("authorization-instructions").hide();
	controller.get("authorization-instructions").hide();
	controller.get("username-field").show();
	controller.get("authorize_button").mojo.deactivate();
	controller.assistant.auth_button_att.label=$L("Change Account");
	controller.modelchanged(controller.assistant.auth_button_att);

};

social.getAccessTokenFailure = function(error) {
    Mojo.Log.info("^^^^^^ AuthorizeAssistant#GetAccessTokenFailure");
    
    Mojo.Log.info("Access Failure: ", Object.toJSON(error));
};

social.launchBrowser = function(url) {
    Mojo.Log.info("^^^^^^ AuthorizeAssistant#LaunchBrowser");
	var controller = Mojo.Controller.stageController.activeScene();
	controller.serviceRequest("palm://com.palm.applicationManager", {
		method: "open",
		parameters: {
			id: 'com.palm.app.browser',
			params: {
				scene: 'page',
				target: url
			}
		}
	});
};

social.xAccessToken = function(x_auth_username, x_auth_password) {
	var action = "https://api.twitter.com/oauth/access_token";
	var objParameters = social.getXAuthParameters(action, x_auth_username, x_auth_password, "client_auth");
	
	var request = new Ajax.Request(action, {
	   method: "post",
	   parameters: objParameters,
	   evalJSON: 'true',
	   onSuccess: social.handleAccessTokenOKResponse,
	   onFailure: social.handleErrResponse
	 });
}

social.handleAccessTokenOKResponse = function(responseJSON){
	//LoginAssistant.prototype.hideSpinner();
	
	var oauth_token = "";
	var oauth_token_secret = "";
	var oauth_token_secret_pos = 0;
	var responseText = responseJSON.request.transport.responseText;
	
	Mojo.Log.info(Object.toJSON(responseJSON));
	
	/*
	oauth_token_secret_pos = responseText.indexOf("&",12);
	weTwit.oauth_token = responseText.substring(12,oauth_token_secret_pos);
	weTwit.oauth_token_secret = responseText.substring(oauth_token_secret_pos+20,responseText.indexOf("&",oauth_token_secret_pos+1));
	*/
	
	var params=responseText.split(new RegExp("&", "g"));
	for (var i=0; i<params.length; i++){
		parts = params[i].split(new RegExp("=", "g"));;
		if(parts.length==2){
			switch(parts[0]){
				case "oauth_token":
					appSettings.config.twitter.oauth_token = parts[1];
					//weTwitDb.setConfig("oauth_token",weTwit.oauth_token);
					break;
				case "oauth_token_secret":
					appSettings.config.twitter.oauth_token_secret = parts[1];
					//weTwitDb.setConfig("oauth_token_secret",weTwit.oauth_token_secret);
				//case "screen_name":
					//weTwit.username = parts[1];
					//weTwitDb.setConfig("login",weTwit.username);
					break;
				default:
					//
			}
		}
	}
	
	//$('InfoZone').update("AccessToken response: <br><br>" + weTwit.JSON2HTML(responseJSON) +"<br /><br />oauth_token: "+ weTwit.oauth_token +"<br /><br />oauth_token_secret: "+ weTwit.oauth_token_secret);
	Mojo.Log.info("USER IS VALID");
};

social.handleErrResponse = function(responseJSON){
	//weTwit.oauth_token = "";
	//weTwit.oauth_token_secret = "";
	
	//Error identification
	var sError = "--";
	if(responseJSON.responseText)
	{
		try {
			eval("var response = " + responseJSON.responseText);
			if (response.error) {
				sError = ": <br />" + Object.toJSON(response.error);
			}
			else 
				if (response.errors) {
					sError = ": <br />" + Object.toJSON(response.errors);
				}
				else {
					sError = ": <br />" + Object.toJSON(responseJSON.responseText);
				}
		}catch(err){
			sError = ": <br />" + responseJSON.responseText;
		}
	}
	
Mojo.Log.error("Error: "+ sError);
	
	
/*
	lAssistant.controller.showAlertDialog({
	    onChoose: lAssistant.handleLostEvent,
	    title: weTwit.lg("identification"),
	    message: weTwit.lg("check_username_and_password"),
	    choices:[
	         {label: weTwit.lg("ok"), value:"ok"}
	    ]
    });

*/
};

social.getXAuthParameters = function(action, x_auth_username, x_auth_password, x_auth_mode){
	var tokenSecret = '';
	var accessor = {
		consumerSecret: appSettings.twitter.consumerSecret,
		tokenSecret: tokenSecret
	};
	var message = {
		action: action,
		method: 'post',
		parameters: [["oauth_consumer_key", appSettings.twitter.consumerKey], ["oauth_signature_method", "HMAC-SHA1"], ["oauth_nonce", ""], ["oauth_timestamp", ""], ["oauth_version", "1.0"], ["oauth_signature", ""], ["x_auth_mode", x_auth_mode], ["x_auth_password", x_auth_password], ["x_auth_username", x_auth_username]]
	};
	OAuth.setTimestampAndNonce(message);
	OAuth.SignatureMethod.sign(message, accessor);
	var parameterMap = OAuth.getParameterMap(message.parameters);
	return parameterMap;
};

social.handleTwitterResponse = function(responseJSON){
	//handling timeout
	Mojo.Log.info("RESPUESTA CORRECTA");
	
};

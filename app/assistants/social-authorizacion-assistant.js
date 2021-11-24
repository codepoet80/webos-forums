function SocialAuthorizacionAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  this.link=args
}

SocialAuthorizacionAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
    var webviewattribute = {
		minFontSize:18,
		virtualpagewidth: this.controller.window.innerWidth,
		virtualpageheight: 32 ,
        url: this.link,
		interrogateClicks: true,
		cacheAdapter : false
	};
    this.controller.setupWidget('webview', webviewattribute, {});
   //Mojo.Event.listen(this.controller.get("webview"), Mojo.Event.webViewTitleUrlChanged, this.URLChanged.bind(this));

   Mojo.Event.listen(this.controller.get("webview"), Mojo.Event.webViewLinkClicked, this.URLChanged.bind(this));
};

SocialAuthorizacionAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
   try {
        //Clean up the stuff
        var webview = this.controller.get('webview');                
        webview.mojo.clearCache();
        webview.mojo.clearCookies();
        webview.mojo.reloadPage();

   } catch(e) {
    //Tracking error coming soon
   }
};

SocialAuthorizacionAssistant.prototype.URLChanged = function(event){
	//Mojo.Log.info(event.url);
/*
    if(event.url.indexOf('https://graph.facebook.com/oauth/access_token?') != -1)
    {
        new Ajax.Request(event.url, {
                contentType: 'text/html',
                onComplete: this.facebookConnected.bind(this)
            });
            
    }
    else if(event.url.indexOf('error_reason=user_denied') != -1 && event.url.indexOf('error_description=The+user+denied+your+request') != -1)
    {
        Mojo.Controller.errorDialog('You\'ve denied logging in with facebook.');        
    }

*/
var values = parseUri(event.url);
//Mojo.Log.info(Object.toJSON(values));
if (!this.verified) {
	if (values.query && (values.query.indexOf("oauth_verifier=") >= 0)) {
		this.controller.get("webview").mojo.stopLoad();
		this.controller.get("webview").mojo.clearHistory();
		this.controller.get("webview").mojo.clearCookies();
		//Mojo.Event.stopListening(this.controller.get("webview"), Mojo.Event.webViewTitleUrlChanged, this.URLChanged.bind(this));
		var parameters = values.query.split('&');
		for (var i = 0; i < parameters.length; i++) {
			if (parameters[i].startsWith("oauth_verifier=")) {
				var oauth_verifier = parameters[i].replace("oauth_verifier=", "");
			}
		}
		
		if (oauth_verifier) {
			this.verified = true;
			Mojo.Log.info("VERIFICADOR: ", oauth_verifier);
			//this.controller.get("webview").mojo.stopLoad();
			this.controller.stageController.popScene({oauth_verifier: oauth_verifier})
		}
	}
}
};

SocialAuthorizacionAssistant.prototype.handleCommand = function(event) {
	try {
		Mojo.Log.info("GESTIONANDO EVENTOS");
		switch (event.type) {
			case Mojo.Event.back:
				event.stop();
				Mojo.Log.info("GESTIONANDO BACK");
				this.controller.stageController.popScene({oauth_verifier: false})
				break;
		}
	} 
	catch (e) {
		Mojo.Log.error("handleCommand: ", e);
	}
	
};

SocialAuthorizacionAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

SocialAuthorizacionAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
    //Mojo.Event.stopListening(this.controller.get("webview"), Mojo.Event.webViewTitleUrlChanged, this.URLChanged.bind(this));
   Mojo.Event.stopListening(this.controller.get("webview"), Mojo.Event.webViewLinkClicked, this.URLChanged.bind(this));
};

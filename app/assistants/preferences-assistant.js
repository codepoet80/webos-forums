function PreferencesAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

PreferencesAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */

	/* setup widgets here */

	/* add event handlers to listen to events from widgets */

		this.appMenuModel = {
		visible: true,
		items: [
			MenuData.ApplicationMenu.GoBack,
			MenuData.ApplicationMenu.Support,
			MenuData.ApplicationMenu.Help]
	};

	this.controller.setupWidget(Mojo.Menu.appMenu, {
			omitDefaultItems: true
		}, this.appMenuModel);

	this.controller.setInitialFocusedElement(null);

	    this.controller.setupWidget("spreadWordToggle",
        {modelProperty: "spreadWord"},
        appSettings.config);

	    this.controller.setupWidget("darkThemeToggle",
	            {modelProperty: "darkTheme"},
	            appSettings.config);
	    this.controller.listen('darkThemeToggle', Mojo.Event.propertyChange, this.themeChanged.bindAsEventListener(this));

		this.controller.setupWidget("shakeToRefreshToggle",
        {modelProperty: "shakeToRefresh"},
        appSettings.config);

	    this.controller.setupWidget("debugToggle",
        {modelProperty: "detailedLogging"},
        appSettings.debug);

	    this.controller.setupWidget("logPwdToggle",
	            {modelProperty: "logPassword"},
	            appSettings.debug);


    this.controller.setupWidget("defaultForumViewSelector",
        {
            label: $L("Default View"),
            choices: [
                {label: $L("Recent Posts"), value: "recentPosts"}, //mw 6/13/15 Changed from Lastest Posts
                {label: $L("Subscribed Posts"), value: "subscribedPosts"},
                {label: $L("Forum Tree"), value: "forums"},
                {label: $L("Private Messages"),	value: "privateMessages"}
            ],
			modelProperty: "defaultView"
        },
        appSettings.config);

/*
    this.controller.setupWidget("defaultViewSelector",
        {
            label: $L("Default View"),
            choices: [
                {label: $L("Forums Gallery"), value: "gallery"},
                {label: $L("My Forums"), value: "forums"},
                {label: $L("Recent Forums"), value: "recent"}
            ],
			modelProperty: "defaultAppView"
        },
        appSettings.config);

*/
   this.controller.setupWidget("autoLoginSelector",
        {
            label: $L("Login Mode"),
            choices: [
                {label: $L("Manual"), value: "false"},
                {label: $L("Automatic"), value: "true"}
			],
			modelProperty: "autoLogin"
        },
        appSettings.config);

   this.controller.setupWidget("fontSizeSelector",
	        {
	            label: $L("Font Size"),
	            choices: [
	                {label: $L("14px"), value: "fontsize1"},
	                {label: $L("15px"), value: "fontsize2"},
	                {label: $L("16px"), value: "fontsize3"},
	                {label: $L("18px"), value: "fontsize4"},
	                {label: $L("20px"), value: "fontsize5"},
	                {label: $L("22px"), value: "fontsize6"},
	                {label: $L("26px"), value: "fontsize7"}
				],
				modelProperty: "fontSize"
	        },
	        appSettings.config);
   Mojo.Event.listen(this.controller.get("fontSizeSelector"),
		   Mojo.Event.propertyChange, this.setFontSize.bind(this));

		this.topicCountAttr = {
				multiline: false,
				requiresEnterKey: false,
				changeOnKeyPress: false,
				autoFocus: false,
				modelProperty: "newTopicsCount",
				modifierState: Mojo.Widget.numLock,
				holdToEdit: false
			};

		this.controller.setupWidget('textFieldNewTopicsCount', this.topicCountAttr, appSettings.config);

		// TWITTER SETUP
/*
	this.auth_textfield_att = {
	    hintText: $L('Enter authorization number...'),
	    focus: false,
	    autoFocus: false,
	    changeOnKeyPress: true,
        enterSubmits: true,
        modifierState: Mojo.Widget.numLock,
        charsAllow: function(charCode) {
		            if (charCode > 47 && charCode < 58)
		            return true;
	                else
	                return false;
		            }.bind(this)
	};

	this.authTextfieldModel = { value: ""};
	this.controller.setupWidget("authorization_number", this.auth_textfield_att, this.authTextfieldModel);
	this.controller.listen("authorization_number", Mojo.Event.propertyChange, this.authTextfieldChange.bind(this));

*/
		this.authButtonAtt = {
			label: "Start Authorization",
			type: Mojo.Widget.activityButton
		};
		this.authButtonModel = {disabled: false};

		this.controller.setupWidget("authorize_button", this.authButtonAtt, this.authButtonModel);
		this.controller.listen("authorize_button", Mojo.Event.tap, this.authorizeApp.bind(this));

	this.configureScene();


};

PreferencesAssistant.prototype.authorizeApp = function() {
	//Mojo.Log.info("Authorizing the app for Twitter...")
	this.authButtonAtt.label="Authorizing...";
	this.authButtonModel.disabled=true;
	this.controller.modelChanged(this.authButtonAtt,this);
	this.controller.modelChanged(this.authButtonModel,this);
	social.requestToken();
};

PreferencesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
		if (event) {
			Mojo.Log.info("PreferencesAssistant.activate() event received: ", Object.toJSON(event));
			if (event.oauth_verifier && (event.oauth_verifier != false)) {
				this.getAccessToken(event.oauth_verifier);
			} else {
				Mojo.Log.info("CANCELLED");
				Mojo.Controller.errorDialog($L("You've cancelled the authorization process."));
				this.controller.get("authorize_button").mojo.deactivate();
				this.authButtonModel.disabled=false;
				this.controller.modelChanged(this.authButtonAtt,this);
				this.controller.modelChanged(this.authButtonModel,this);
			}
		}
};

PreferencesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
		appSettings.cookie.storeCookie();
};

PreferencesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
};


PreferencesAssistant.prototype.handleCommand = function(event) {
	Mojo.Log.info("prefsAssistant.handleCommand: " + event.command);
		if(event.type == Mojo.Event.commandEnable && (event.command == Mojo.Menu.prefsCmd)) {
			event.stopPropagation();
		}
};

PreferencesAssistant.prototype.setFontSize = function(event) {
	Mojo.Log.info("setFontSize() called.");
	$$('body')[0].removeClassName('fontsize1');
	$$('body')[0].removeClassName('fontsize2');
	$$('body')[0].removeClassName('fontsize3');
	$$('body')[0].removeClassName('fontsize4');
	$$('body')[0].removeClassName('fontsize5');
	$$('body')[0].removeClassName('fontsize6');
	$$('body')[0].removeClassName('fontsize7');
	$$('body')[0].addClassName(appSettings.config.fontSize);
    //or
	//this.controller.document.getElementsByTagName("body")[0].addClassName('palm-dark');
};

PreferencesAssistant.prototype.themeChanged = function(event)
{
	Mojo.Log.warn("themeChanged(): " + event.value);
//	// set the theme right away with the body class
//	var deviceTheme = '';
//	if (Mojo.Environment.DeviceInfo.modelNameAscii == 'Pixi' ||
//		Mojo.Environment.DeviceInfo.modelNameAscii == 'Veer')
//		deviceTheme += ' small-device';
//	if (Mojo.Environment.DeviceInfo.modelNameAscii.indexOf('TouchPad') == 0 ||
//		Mojo.Environment.DeviceInfo.modelNameAscii == 'Emulator')
//		deviceTheme += ' no-gesture';
//	this.controller.document.body.className = theme;// + deviceTheme;
	var theme=event.value ? "palm-dark" : "palm-default";
	switch (theme) {
	case "palm-dark":
		this.controller.document.getElementsByTagName("body")[0].removeClassName('palm-default');
		this.controller.document.getElementsByTagName("body")[0].addClassName('palm-dark');
		break;
	default:
		this.controller.document.getElementsByTagName("body")[0].removeClassName('palm-dark');
		this.controller.document.getElementsByTagName("body")[0].addClassName('palm-default');
	}

	//this.cookie.put(this.prefs);
};


PreferencesAssistant.prototype.getAccessToken = function(PIN) {
    //Mojo.Log.info("^^^^^^ AuthorizeAssistant#GetAccessToken");

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

	Mojo.Log.info("Making request...");
    var req = new Ajax.Request(request_url, {
        method: 'post',
        evalJSON: 'force',
        postBody: post_body,
        onSuccess: this.getAccessTokenSuccess.bind(this),
        onFailure: this.getAccessTokenFailure.bind(this)
    });
};

PreferencesAssistant.prototype.getAccessTokenSuccess = function(response) {
    //Mojo.Log.info("^^^^^^ AuthorizeAssistant#GetAccessTokenSuccess");

    Mojo.Log.info("Access Success: ", Object.toJSON(response.responseText));

    var parameters = response.responseText.split('&');
    //var account = new AccountModel();
    appSettings.config.twitter.oauth_token = parameters[0].replace("oauth_token=", "");
    appSettings.config.twitter.oauth_token_secret = parameters[1].replace("oauth_token_secret=", "");
    appSettings.config.twitter.idStr = parameters[2].replace("user_id=", "");
    appSettings.config.twitter.screenName = parameters[3].replace("screen_name=", "");
	appSettings.config.twitter.authorized = true;

    //Mojo.Log.info("Account: ", Object.toJSON(appSettings.config.twitter));
		appSettings.cookie.storeCookie();

	this.controller.get("authorize_button").mojo.deactivate();
	this.configureScene();
};

PreferencesAssistant.prototype.getAccessTokenFailure = function(error) {
    //Mojo.Log.info("^^^^^^ AuthorizeAssistant#GetAccessTokenFailure");

    Mojo.Log.info("Access Failure: ", Object.toJSON(error.transport));

	switch (error.transport.status) {
		case 401:
				Mojo.Controller.errorDialog($L("The authorization request has been rejected. Try again."));
				this.controller.get("authorize_button").mojo.deactivate();
				this.authButtonModel.disabled=false;
				this.controller.modelChanged(this.authButtonAtt,this);
				this.controller.modelChanged(this.authButtonModel,this);
				break;
		default:
				Mojo.Controller.errorDialog($L("The authorization process has failed. Please retry."));
				this.controller.get("authorize_button").mojo.deactivate();
				this.authButtonModel.disabled=false;
				this.controller.modelChanged(this.authButtonAtt,this);
				this.controller.modelChanged(this.authButtonModel,this);
	}

};

PreferencesAssistant.prototype.configureScene =function() {
	//Mojo.Log.info(Object.toJSON(appSettings.config.twitter));
	if (appSettings.config.twitter.authorized) {
		//Mojo.Log.info("Enviando evento...");
		this.controller.get("username").innerHTML = "@" + appSettings.config.twitter.screenName;
		this.controller.get("authorization-instructions").hide();
		this.controller.get("authorization-instructions").hide();
		this.controller.get("username-field").show();
		this.authButtonAtt.label = "Change Account";
		this.authButtonModel.disabled=false;
		this.controller.modelChanged(this.authButtonAtt, this);
		this.controller.modelChanged(this.authButtonModel, this);
	}
}

function UserForumSetupDialogAssistant(sceneAssistant,callbackFunc) {
	Mojo.Log.info("UserForumSetupDialogAssistant, callbackFunc: " + callbackFunc.name);
	this.callbackFunc = callbackFunc;
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
  	this.save = this.save.bindAsEventListener(this);
	this.handlePropertyChange = this.handlePropertyChange.bindAsEventListener(this);

};

UserForumSetupDialogAssistant.prototype.setup = function(widget) {
	this.widget = widget;
	/* this function is for setup tasks that have to happen when the scene is first created */
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	/* setup widgets here */
	/* add event handlers to listen to events from widgets */
	this.urlAttr = {
		hintText: $L('Enter forum address...'),
		multiline: false,
		requiresEnterKey: false,
		changeOnKeyPress: true,
		autoFocus: true,
		textCase: Mojo.Widget.steModeLowerCase
 	};

	this.nameAttr = {
		hintText: $L('Enter forum name...'),
		multiline: false,
		requiresEnterKey: false,
		changeOnKeyPress: true,
		autoFocus: false
 	};

	this.descAttr = {
		hintText: $L('Optional description..'),
		multiline: false,
		requiresEnterKey: false,
		changeOnKeyPress: true,
		autoFocus: false
 	};


	this.urlModel = {
		value: "",
		disabled: false
	};

	this.nameModel = {
		value: "",
		disabled: false
	};

	this.descModel = {
		value: "",
		disabled: false
	};

	this.controller.setupWidget('textFieldURL', this.urlAttr, this.urlModel);
	this.controller.setupWidget('textFieldName', this.nameAttr, this.nameModel);
	this.controller.setupWidget('textFieldDesc', this.descAttr, this.descModel);

	this.signInButtonModel = {buttonClass:'primary', buttonLabel:$L('Sign In'), disabled:true};

	this.signInButton = this.controller.get('save');

	this.controller.setupWidget('save', {type: Mojo.Widget.activityButton}, this.signInButtonModel);

	Mojo.Event.listen(this.controller.get('save'),Mojo.Event.tap,this.save);
	Mojo.Event.listen(this.controller.get('textFieldURL'), Mojo.Event.propertyChange, this.handlePropertyChange);
	Mojo.Event.listen(this.controller.get('textFieldName'), Mojo.Event.propertyChange, this.handlePropertyChange);
	Mojo.Event.listen(this.controller.get('textFieldDesc'), Mojo.Event.propertyChange, this.handlePropertyChange);

};

UserForumSetupDialogAssistant.prototype.save = function(event){
	/* put in event handlers here that should only be in effect when this scene is active. For
	 example, key handlers that are observing the document */
	var checkResult = false;
	Mojo.Log.info("UserForumSetupDialogAssistant.save() called.");

	this.signInHandler();

	Mojo.Log.info("UserForumSetupDialogAssistant.save(), building normalized URL (which will be ignored by the Tapatalk class and recreated).");
	var protocol="http://";
    // normalize server value and create url
    var remoteServer = trim(this.urlModel.value) // trim whitespaces
    if (remoteServer.indexOf("https:") == 0 || remoteServer.indexOf("HTTPS:") == 0 ) {
    	protocol="https://";
    }
    remoteServer = remoteServer.replace(/mobiquo\056php$/i, "") // remove ending "mobiquo.php"
    remoteServer = remoteServer.replace(/mobiquo\057$/i, "") // remove ending "mobiquo/", if any
    remoteServer = remoteServer.replace(/mobiquo$/i, "") // remove ending "mobiquo", if any
    remoteServer = remoteServer.replace(/\057$/, ""); // remove ending '/', if any
    remoteServer = remoteServer.replace(/http:\057\057/gi, ""); // remove starting 'http://', if any
    remoteServer = remoteServer.replace(/https:\057\057/gi, ""); // remove starting 'http://', if any

    var composedUrl = protocol + remoteServer + "/mobiquo/mobiquo.php";
	var that = this;
	//appSettings.Tapatalk = new appSettings.Tapatalk()

	Mojo.Log.info("UserForumSetupDialogAssistant.save() creating new forum object for appSettings.currentForum.");
	//Set some defaults so the forum saves correctly.
	appSettings.currentForum = {};
	appSettings.currentForum.name = this.nameModel.value;
	appSettings.currentForum.description = this.descModel.value;
	appSettings.currentForum.url = protocol + remoteServer; //composedUrl; - causing copy link to build bad URLs
	appSettings.currentForum.mobiquo_dir = "mobiquo";
	appSettings.currentForum.extension = "php";
    if (remoteServer.indexOf("proboards.com") > 0) {
    	//Proboards..
    	//http://tstoforum.com/mobiquo/index.cgi?action=tapatalk3
    	composedUrl = protocol + remoteServer + "/index.cgi?action=tapatalk3";
    	appSettings.currentForum.mobiquo_dir = "";
    	appSettings.currentForum.extension = "cgi";
    }

	Mojo.Log.info("currentForum object: " + JSON.stringify(appSettings.currentForum));
	Mojo.Log.info("remoteServer: " + remoteServer);
	Mojo.Log.info("composedUrl: " + composedUrl);
	Mojo.Log.info("UserForumSetupDialogAssistant.save() creating new Tapatalk object (without credentials).");
	appSettings.Tapatalk = new Tapatalk(composedUrl, "", "", function(returned){
		if (returned) {
			if (appSettings.debug.detailedLogging) {
				Mojo.Log.info("returned: " + JSON.stringify(returned));
			}
			if (returned.api_level >= 3) {
				Mojo.Log.info("returned contains data");
				returned.forum_url = composedUrl;
				//checkResult = returned;
				that.controller.get('save').mojo.deactivate();
				that.callbackFunc(returned);
				that.widget.mojo.close();
			} else {
				that.showErrorDialog($L("This forum isn't compatible with this version of Forums. Please request the Forum Admin to update their Tapatalk plugin."));
			}
		} else {
			that.showErrorDialog($L("Forum addres invalid. Check entered info and try again."));
		}
	}, function(err) {
		Mojo.Log.warn("UserForumSetupDialog.save() callbackFail invoked: " + JSON.stringify(err));
		if (err.error && err.error == 404) {
			that.showErrorDialog($L("The forum URL you entered could not be found.  Please check the URL and try again."));
		}
		else {
			that.showErrorDialog($L("An error has occurred trying to add the forum.  The forum may not be Tapatalk-enabled.  Please check the URL and try again."));
		}
	} 
	);

};

UserForumSetupDialogAssistant.prototype.cancel = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

	  this.widget.mojo.close();
};

UserForumSetupDialogAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

UserForumSetupDialogAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

UserForumSetupDialogAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
	Mojo.Event.stopListening(this.controller.get('save'),Mojo.Event.tap,this.save);
	Mojo.Event.stopListening(this.controller.get('textFieldURL'), Mojo.Event.propertyChange, this.handlePropertyChange);
};

UserForumSetupDialogAssistant.prototype.handlePropertyChange = function(event){
	// A character was entered.  Enable or disable the "Sign In" button based on valid data
	if (this.signInButtonModel.disabled && this.urlModel.value.length > 0 && this.nameModel.value.length > 0) {
		this.signInButtonModel.disabled = false;
		this.controller.modelChanged(this.signInButtonModel);
	}
	else
		if (!this.signInButtonModel.disabled && (this.urlModel.value.length == 0 || this.nameModel.value.length == 0)) {
			this.signInButtonModel.disabled = true;
			this.controller.modelChanged(this.signInButtonModel);
		}

	// If the password field has focus and Enter is pressed then simulate tapping on "Sign In"
	if (event && Mojo.Char.isEnterKey(event.originalEvent.keyCode)) {
		// If the submit button is enabled then create the account
		if (this.signInButtonModel.disabled == false) {
			this.controller.get('textFieldURL').blur();
			this.signInHandler();
			Event.stop(event);
		}
		else {
			this.controller.get('textFieldURL').mojo.focus();
		}
	}
};

UserForumSetupDialogAssistant.prototype.signInHandler = function(){
	// if the error message is already displayed then just make it invisible to avoid jumpiness
	if (this.controller.get('error_message').getStyle('display') != 'none') {
/*
		this.controller.get('error_message').setStyle({
			visibility: 'hidden'
		});

*/
		this.controller.get('error_message').hide();
	}
	else {
		this.controller.get('error_message').hide();
		this.controller.get('error_message').setStyle({
			visibility: 'visible'
		});
	}
	this.signInButtonModel.buttonLabel = $L('Signing In...');
	this.controller.modelChanged(this.signInButtonModel);
	this.signInButton.mojo.activate();
	// adding manual delay
	//setTimeout(this.showErrorDialog.bind(this), 500);
};

UserForumSetupDialogAssistant.prototype.showErrorDialog = function(message){
	try {
	this.controller.get("error_text").innerHTML = message;
	this.controller.get('error_message').show();
	this.controller.get('error_message').setStyle({
		visibility: 'visible'
	});
	} catch (ex) {}
	this.signInButtonModel.buttonLabel = $L('Sign In');
	this.controller.modelChanged(this.signInButtonModel);
	this.signInButton.mojo.deactivate();
	try { this.controller.get('textFieldURL').mojo.focus(); } catch (ex) { }
};

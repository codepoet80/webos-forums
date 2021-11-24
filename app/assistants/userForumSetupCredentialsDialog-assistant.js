function UserForumSetupCredentialsDialogAssistant(sceneAssistant,callbackFunc, arguments) {
	this.callbackFunc = callbackFunc;
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
	Mojo.Log.info(Object.toJSON(arguments));
	if (arguments.mode == "addForum") {
		this.credentialsNeeded = !arguments.forumData.guest_okay;
		this.forum_data = arguments.forumData;
	} else if (arguments.mode == "login") {
		//this.credentialsNeeded = !appSettings.currentForum.guest_okay;
		//this.forum_data = arguments;
		this.callback = arguments.callback;
	} else if (arguments.mode == "forumLogin") {
		this.callback = arguments.callback;
		this.forum_id = arguments.forum_id;
	}
	this.mode = arguments.mode;

	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
  	this.checkCredentials = this.checkCredentials.bindAsEventListener(this);
  	this.goSignUp = this.goSignUp.bindAsEventListener(this);
	this.handlePropertyChange = this.handlePropertyChange.bindAsEventListener(this);
	this.handlePropertyChangePassword = this.handlePropertyChangePassword.bindAsEventListener(this);

};

UserForumSetupCredentialsDialogAssistant.prototype.setup = function(widget) {
	this.widget = widget;
	/* this function is for setup tasks that have to happen when the scene is first created */
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */
	/* setup widgets here */
	/* add event handlers to listen to events from widgets */
	if (this.mode == "login") {
		this.controller.get("title").innerHTML = $L("Forum Login");
	}
	else
		if (this.mode == "forumLogin") {
			this.controller.get("title").innerHTML = $L("Password Protected Forum");
		}
		else {
			this.controller.get("title").innerHTML = $L("Add New Forum");
		}

	this.nameAttr = {
		hintText: $L('Enter User name...'),
		multiline: false,
		requiresEnterKey: false,
		changeOnKeyPress: true,
		autoFocus: true,
		textCase: Mojo.Widget.steModeLowerCase
 	};

	this.nameModel = {
		value: "",
		disabled: false
	};

	this.controller.setupWidget('textFieldUserName', this.nameAttr, this.nameModel);

	this.passwordAttr = {
		hintText: $L('Enter password...'),
		requiresEnterKey: false,
		changeOnKeyPress: true,
		autoFocus: false
 	};

	this.passwordModel = {
		value: "",
		disabled: false
	};

	this.controller.setupWidget('textFieldPassword', this.passwordAttr, this.passwordModel);

	this.signInButtonModel = {buttonClass:'affirmative', buttonLabel:$L('Sign In'), disabled:true};

	this.signInButton = this.controller.get('checkCredentials');

	this.controller.setupWidget('checkCredentials', {type: Mojo.Widget.activityButton}, this.signInButtonModel);

	this.signUpButtonModel = {buttonClass:'primary', buttonLabel:$L('Register'), disabled:false};

	this.signUpButton = this.controller.get('goRegister');

	this.controller.setupWidget('goRegister', {}, this.signUpButtonModel);

	Mojo.Event.listen(this.controller.get('checkCredentials'),Mojo.Event.tap,this.checkCredentials);
	Mojo.Event.listen(this.controller.get('goRegister'),Mojo.Event.tap,this.goSignUp);
	Mojo.Event.listen(this.controller.get('textFieldUserName'), Mojo.Event.propertyChange, this.handlePropertyChange);
	Mojo.Event.listen(this.controller.get('textFieldPassword'), Mojo.Event.propertyChange, this.handlePropertyChangePassword);


	if (this.credentialsNeeded) {
		this.controller.get('login_required').show();
	}

		if (this.mode == "forumLogin") {
			this.signUpButton.hide();
			this.controller.get('userNameField').hide();
		}

};

UserForumSetupCredentialsDialogAssistant.prototype.goSignUp = function() {
	var server = appSettings.currentForum.url.replace(/\057$/i, "");

	this.controller.serviceRequest('palm://com.palm.applicationManager', {
					method: 'open',
					parameters: {
						target: server + "/" + appSettings.Tapatalk.config.reg_url
					}
				})

};

UserForumSetupCredentialsDialogAssistant.prototype.checkCredentials = function(event){
	/* put in event handlers here that should only be in effect when this scene is active. For
	 example, key handlers that are observing the document */
	try {
		Mojo.Log.info("UserForumSetupCredentialsDialogAssistant.checkCredentials() MODE:", this.mode);
		//Mojo.Log.info("checkCredentials(), checking credentials... ", this.forum_data.forum_url, this.nameModel.value, this.passwordModel.value);

		var checkResult = false;

		this.signInHandler();

		var that = this;

		if (this.mode == "addForum") {
			appSettings.Tapatalk.set_user_name(that.nameModel.value);
			appSettings.Tapatalk.set_user_password(that.passwordModel.value);
			//appSettings.Tapatalk = new Tapatalk(this.forum_data.forum_url, this.nameModel.value, this.passwordModel.value);

			Mojo.Log.info("Instancia de Tapatalk creada: ");

//			appSettings.Tapatalk.forum.get_config(function(result){
				Mojo.Log.info("Trying to Login");
				appSettings.Tapatalk.user.login(function(response){

					Mojo.Log.info(Object.toJSON(response));
					if (response) {
						//Mojo.Log.info("returned contains data");
						//returned.forum_url = composedUrl;
						//Mojo.Log.info(Object.toJSON(response));
						if (!response.result && !response.authorize_result) {
							that.controller.get('error-message').innerHTML = response.result_text
							that.showErrorDialog();
						}
						else {
							//that.forum_data.forum_url = forumChecker.url;
							that.forum_data.user_name = that.nameModel.value;
							that.forum_data.user_password = that.passwordModel.value;
							forumChecker = undefined;
							that.controller.get('checkCredentials').mojo.deactivate();
							that.callbackFunc(that.forum_data, this.callback);
							that.widget.mojo.close();
						}
					}
					else {
						that.showErrorDialog();
					}
				});
//			});
		}
		else
			if (that.mode == "login") {
				appSettings.Tapatalk.set_user_name(that.nameModel.value);
				appSettings.Tapatalk.set_user_password(that.passwordModel.value);
				Mojo.Log.info("Calling Taptalk login for user " + that.nameModel.value);
				appSettings.Tapatalk.user.login(function(response){
					try {
						if (!response.result) {
							if (response.result_text) {
								that.controller.get('error-message').innerHTML = response.result_text
							} else {
								that.controller.get('error-message').innerHTML = $L("Login Error. Please check your credentials");
							}
							that.showErrorDialog();
						}
						else {

							appSettings.currentForum.user_name = that.nameModel.value;
							appSettings.currentForum.user_password = that.passwordModel.value;
							Mojo.Log.info("Checking for avatar: " + response.icon_url);
							if (response.icon_url && response.icon_url.length > 0) {
								appSettings.currentForum.logo = response.icon_url;
								appSettings.currentForum.logo_url = response.icon_url;
							}
							that.controller.get('checkCredentials').mojo.deactivate();
							that.callbackFunc(true);
							that.widget.mojo.close();
						}
					} catch (e) {
						Mojo.Log.error("userSetupCredentials: ", e);
					}
});
			} else if (that.mode == "forumLogin") {
				appSettings.Tapatalk.forum.login_forum(this.forum_id, this.passwordModel.value, function(response){
					if (!response.result) {
							that.controller.get('error-message').innerHTML = response.result_text
							that.showErrorDialog();
					}
					else {
						//appSettings.currentForum.user_name = that.nameModel.value;
						//appSettings.currentForum.user_password = that.passwordModel.value;
						that.controller.get('checkCredentials').mojo.deactivate();
						that.callbackFunc(true);
						that.widget.mojo.close();
					}
});
			}
	}
	catch (e) {
		Mojo.Log.error("CHECKCREDENTIALS ", e);
	}
};

UserForumSetupCredentialsDialogAssistant.prototype.cancel = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

	  this.widget.mojo.close();
};

UserForumSetupCredentialsDialogAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  			this.controller.get('textFieldUserName').mojo.focus();

};

UserForumSetupCredentialsDialogAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

UserForumSetupCredentialsDialogAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
	Mojo.Event.stopListening(this.controller.get('checkCredentials'),Mojo.Event.tap,this.checkCredentials);
	Mojo.Event.stopListening(this.controller.get('textFieldUserName'), Mojo.Event.propertyChange, this.handlePropertyChange);
	Mojo.Event.stopListening(this.controller.get('textFieldPassword'), Mojo.Event.propertyChange, this.handlePropertyChangePassword);
};

UserForumSetupCredentialsDialogAssistant.prototype.handlePropertyChange = function(event){
	// A character was entered.  Enable or disable the "Sign In" button based on valid data
	if (this.signInButtonModel.disabled && this.nameModel.value.length > 0) {
		this.signInButtonModel.disabled = false;
		this.controller.modelChanged(this.signInButtonModel);
	}
	else
		if (!this.signInButtonModel.disabled && (this.nameModel.value.length == 0)) {
			this.signInButtonModel.disabled = true;
			this.controller.modelChanged(this.signInButtonModel);
		}

};

UserForumSetupCredentialsDialogAssistant.prototype.handlePropertyChangePassword = function(event){
	// A character was entered.  Enable or disable the "Sign In" button based on valid data
	if (this.signInButtonModel.disabled && (this.nameModel.value.length > 0 || this.mode == "forumLogin") && this.passwordModel.value.length > 0) {
		this.signInButtonModel.disabled = false;
		this.controller.modelChanged(this.signInButtonModel);
	}
	else
		if (!this.signInButtonModel.disabled && ((this.nameModel.value.length == 0 && this.mode != "forumLogin") || this.passwordModel.value.length == 0)) {
			this.signInButtonModel.disabled = true;
			this.controller.modelChanged(this.signInButtonModel);
		}

	// If the password field has focus and Enter is pressed then simulate tapping on "Sign In"
	//Mojo.Log.info("DO SIGN IN:::: ", event.originalEvent.keyCode );
	if (event.originalEvent.type == 'keyup' && event.originalEvent.keyCode == Mojo.Char.enter)  {
		// If the submit button is enabled then create the account
		Mojo.Log.info("DO SIGN IN::::");
		if (this.signInButtonModel.disabled == false) {
			this.controller.get('textFieldPassword').blur();
			this.signInHandler();
			Event.stop(event);
		}
		else {
			this.controller.get('textFieldUserName').mojo.focus();
		}
	}

};

UserForumSetupCredentialsDialogAssistant.prototype.signInHandler = function(){
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
	//this.signInButton.mojo.activate();
	// adding manual delay
	//setTimeout(this.showErrorDialog.bind(this), 500);
};

UserForumSetupCredentialsDialogAssistant.prototype.showErrorDialog = function(){
	this.controller.get('error_message').show();
	this.controller.get('error_message').setStyle({
		visibility: 'visible'
	});
	this.signInButtonModel.buttonLabel = $L('Sign In');
	this.controller.modelChanged(this.signInButtonModel);
	this.signInButton.mojo.deactivate();
	this.controller.get('textFieldPassword').mojo.focus();
};

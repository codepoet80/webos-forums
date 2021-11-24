function UserForumSettingsAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

UserForumSettingsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
		this.urlAttr = {
			hintText: $L('HTTP://...'),
			multiline: false,
			requiresEnterKey: false,
			changeOnKeyPress: false,
			autoFocus: true     
		};
		
		this.urlModel = {
			value: "",
			disabled: false
		};

		this.controller.setupWidget('textFieldURL', this.urlAttr, this.urlModel);

		this.userAttr = {
			hintText: $L('Your Username...'),
			multiline: false,
			requiresEnterKey: false,
			changeOnKeyPress: false,
			autoFocus: false     
		};
		
		this.userModel = {
			value: "",
			disabled: false
		};

		this.controller.setupWidget('textFieldUsername', this.userAttr, this.userModel);

		this.passwordAttr = {
			hintText: $L('Your password...'),
			multiline: false,
			requiresEnterKey: false,
			changeOnKeyPress: false,
			autoFocus: false     
		};
		
		this.passwordModel = {
			value: "",
			disabled: false
		};

		this.controller.setupWidget('textFieldPassword', this.passwordAttr, this.passwordModel);

		this.cmdMenuModel = {
			visible: true,
			items: [{}, {},{
				icon: "delete",
				command: "deleteUserForum",
				disabled: false
			}]
		};

		this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.cmdMenuModel);

};

UserForumSettingsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

UserForumSettingsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

UserForumSettingsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

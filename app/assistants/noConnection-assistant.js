function NoConnectionAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

NoConnectionAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
};

NoConnectionAssistant.prototype.aboutToActivate = function(event){
	$$('body')[0].addClassName('dark-backdrop');
};

NoConnectionAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

NoConnectionAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	$$('body')[0].removeClassName('dark-backdrop');
};

NoConnectionAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

NoConnectionAssistant.prototype.handleCommand = function(event) {
	try {
		switch (event.type) {
			case Mojo.Event.command:
				switch (event.command) {
				}
				break;
			case Mojo.Event.back:
				event.stop();
				//if(!this.closingSession) this.doForumClose();
				break;
		}
	} 
	catch (e) {
		Mojo.Log.error("handleCommand: ", e);
	}
	
};

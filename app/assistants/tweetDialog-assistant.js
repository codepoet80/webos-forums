function TweetDialogAssistant(sceneAssistant,callbackFunc, arguments) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.callbackFunc = callbackFunc;
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
	this.url = arguments.url;
	this.urlShortened = "";
	if (arguments.tweet.length <= 118) {
		this.tweet = arguments.tweet;
	} else {
		this.tweet = arguments.tweet.substr(0,115) + "..."
	}
	
	this.checkTweetLengthHandler = this.checkTweetLength.bindAsEventListener(this);
	this.tweetTextChangeHandler = this.tweetTextChange.bindAsEventListener(this);
	this.tweetButtonTapHandler = this.tweetButtonTap.bindAsEventListener(this);
}

TweetDialogAssistant.prototype.setup = function(widget) {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	this.widget = widget;
	
	this.TweetTextAttr = {
		hintText: $L('Tweet...'),
		multiline: true,
		requiresEnterKey: false,
		changeOnKeyPress: true,
		autoFocus: true,
		textCase: Mojo.Widget.setModeLowerCase,
		//maxLength: 119,
		preventResize: false,
		growWidth: false
		//autoResizeMax: "300"
 	};
		
	this.TweetTextModel = {
		value: this.tweet,
		disabled: false
	};

	this.controller.setupWidget('TweetText', this.TweetTextAttr, this.TweetTextModel);

	this.controller.listen('TweetText', 'keydown', this.checkTweetLengthHandler);
	this.controller.listen('TweetText', Mojo.Event.propertyChange, this.tweetTextChangeHandler);
	
	this.controller.get("UpdateCount").innerText = 118 - this.TweetTextModel.value.length;
	//this.controller.get("url").innerText= this.url;

	this.tweetButtonModel = {buttonClass:'affirmative', buttonLabel:$L('Tweet'), disabled:true};

	this.tweetButton = this.controller.get('doTweet');

	this.controller.setupWidget('doTweet', {type: Mojo.Widget.activityButton}, this.tweetButtonModel);
	this.controller.listen('doTweet',Mojo.Event.tap, this.tweetButtonTapHandler); 	
	//Mojo.Event.listen(this.controller.get('doTweet'),Mojo.Event.tap,this.save);

};

TweetDialogAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

	//this.controller.document.addEventListener(Mojo.Event.tap, this._focusTextField);


	  var that = this;


	appSettings.Bitly.shorten(this.url, function(response){
		that.tweetButtonModel.disabled = false;
		that.controller.modelChanged(that.tweetButtonModel);
		that.urlShortened = response.url;
		that.controller.get("url").innerHTML = "<strong>" + response.url + "</strong>" + $L(" will be appended at the end of the Tweet.");
		that.controller.get("urlShortening").show();
	}, function(response){
		that.controller.get("error_message").show();
		that.tweetButtonModel.disabled = false;
		that.controller.modelChanged(that.tweetButtonModel);
	});
	this.controller.get("TweetText").mojo.setCursorPosition(0, this.TweetTextModel.value.length);
};

TweetDialogAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	//this.controller.document.removeEventListener(Mojo.Event.tap, this._focusTextField);
};

TweetDialogAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening('TweetText', 'keydown', this.checkTweetLengthHandler);
  	this.controller.stopListening('TweetText', Mojo.Event.propertyChange, this.tweetTextChangeHandler);
	this.controller.stopListening('doTweet',Mojo.Event.tap, this.tweetButtonTapHandler); 	

};

TweetDialogAssistant.prototype._focusTextField = function() {
		this.controller = Mojo.Controller.stageController.activeScene();
		this.controller.get('TweetText').mojo.focus.defer();	
};

TweetDialogAssistant.prototype.checkTweetLength = function(event) {
		if ((this.controller.get('TweetText').mojo.getValue().length == 118) &&  !Mojo.Char.isDeleteKey(event.keyCode)) {
			event.stop();
		}
};

TweetDialogAssistant.prototype.tweetTextChange = function(event) {
			this.controller.get("UpdateCount").innerText = (118 - event.value.length);
};

TweetDialogAssistant.prototype.tweetButtonTap= function() {
	//Mojo.Log.info("TWEET IT: ", this.urlShortened);
	if (this.urlShortened) {
		social.tweet(this.TweetTextModel.value + " " + this.urlShortened, this.tweetSuccess.bind(this), this.tweetFail.bind(this));
	} else {
		appSettings.Bitly.shorten(this.url, this.bitlySuccess.bind(this), this.bitlyFail.bind(this));
	}
}

TweetDialogAssistant.prototype.bitlySuccess = function(response) {
		this.urlShortened = response.url;
		this.controller.get("url").innerHTML = "<strong>" + response.url + "</strong>" + $L(" will be appended at the end of the Tweet.");
		this.controller.get("error_message").hide();
		this.controller.get("urlShortening").show();
		social.tweet(this.TweetTextModel.value + " " + this.urlShortened, this.tweetSuccess.bind(this), this.tweetFail.bind(this));
};

TweetDialogAssistant.prototype.bitlyFail = function(response) {
		this.controller.get("error_message").show();
		//this.tweetButtonModel.disabled = false;
		//this.controller.modelChanged(that.tweetButtonModel);	
		this.controller.get('doTweet').mojo.deactivate();
		this.tweetFail();
};

TweetDialogAssistant.prototype.tweetSuccess = function(response){
	Mojo.Controller.getAppController().showBanner($L("Tweet Sent"), {}, {});
	this.controller.get('doTweet').mojo.deactivate();
	this.widget.mojo.close();
};
TweetDialogAssistant.prototype.tweetFail = function(response){
	Mojo.Controller.getAppController().showBanner($L("Error Sending Tweet"), {}, {});
	this.controller.get('doTweet').mojo.deactivate();
	

};

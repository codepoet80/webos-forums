function HelpPageAssistant(arguments) {
	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  this.pageTitle = arguments.pageTitle;
	  this.pageName = arguments.pageName;

}

HelpPageAssistant.prototype = {

	setup: function(){
		/* this function is for setup tasks that have to happen when the scene is first created */

		/* use Mojo.View.render to render view templates and add them to the scene, if needed */

		/* setup widgets here */
			var menuAttributes = {
				omitDefaultItems: true
			};
/*
			if (demo.isDemo()) {
				var menuModel = {
					visible: true,
					items: [{
						label: $L('Help Topics'),
						command: 'menu-help-topics'
					}, {
						label: $L('Support'),
						command: 'menu-support'
					}, {
						label : $L('Get Full Version...'),
						command: 'go-full'
					}]
				};
			}
			else {

*/				var menuModel = {
					visible: true,
					items: [{
						label: $L('Help Topics'),
						command: 'menu-help-topics'
					}, {
						label: $L("Support"),
						command: 'menu-support'
					}]
				};
//			}
			this.controller.setupWidget(Mojo.Menu.appMenu, menuAttributes, menuModel);

		this.reloadModel = {
			label: $L('Reload'),
			icon: 'refresh',
			command: 'refresh'
		};

		this.stopModel = {
			label: $L('Stop'),
			icon: 'load-progress',
			command: 'stop'
		};

		this.cmdMenuModel = {
			visible: true,
			items: [{},{},{}]
		};

		this.progress = this.progress.bind(this);
		this.started = this.started.bind(this);
		this.stopped = this.stopped.bind(this);
		this.finished = this.finished.bind(this);


		Mojo.Event.listen(this.controller.get('WebId'), Mojo.Event.webViewLoadProgress, this.progress);
		Mojo.Event.listen(this.controller.get('WebId'), Mojo.Event.webViewLoadStarted, this.started);
		Mojo.Event.listen(this.controller.get('WebId'), Mojo.Event.webViewLoadStopped, this.stopped);
		Mojo.Event.listen(this.controller.get('WebId'), Mojo.Event.webViewLoadFailed, this.stopped);
		Mojo.Event.listen(this.controller.get('WebId'), Mojo.Event.webViewDidFinishDocumentLoad, this.stopped);
		Mojo.Event.listen(this.controller.get('WebId'), Mojo.Event.webViewDownloadFinished, this.finished);

		this.controller.setupWidget(Mojo.Menu.commandMenu, {
			menuClass: 'no-fade'
		}, this.cmdMenuModel);


		this.controller.get('pageTitle').innerHTML = this.pageTitle;

		this.webViewAttr = {
			url: ""
		}

		this.controller.setupWidget('WebId', this.webViewAttr, this.model = {});


		this.controller.serviceRequest('palm://com.palm.systemservice', {
			method: 'getPreferences',
			parameters: {
				'keys': ['locale']
			},
			onSuccess: this.getLocaleSuccess.bind(this),
			onFailure: this.getLocaleFailure.bind(this)
		});

	},

	handleCommand: function (event) {
		if (event.type == Mojo.Event.command) {
			switch (event.command) {
				case 'menu-help-topics':
					Mojo.Controller.stageController.swapScene('helpTopics');
					break;
			}
		}
	},

	getLocaleSuccess: function(response) {
		//{ "locale": { "languageCode": "en", "countryCode": "us" } }
		//Mojo.Log.info(Object.toJSON(response));
		var localeString = response.locale.languageCode + "_" + response.locale.countryCode;
		var appVersion = Mojo.Controller.appInfo.version;
		var appId = Mojo.Controller.appInfo.id;

		var helpPageUrl = 'http://newnessdevelopments.com/software/helpFiles/';
		helpPageUrl = 'http://www.fordmaverick.com/GrabberSoftware/helpFiles/';
    helpPageUrl = helpPageUrl.concat(appId);
    helpPageUrl = helpPageUrl.concat('/');
    //helpPageUrl = helpPageUrl.concat(appVersion);
    //helpPageUrl = helpPageUrl.concat('/');
    //helpPageUrl = helpPageUrl.concat(localeString);
	helpPageUrl = helpPageUrl.concat('en_us');
    helpPageUrl = helpPageUrl.concat('/');
    helpPageUrl = helpPageUrl.concat(this.pageName);
    helpPageUrl = helpPageUrl.concat('.html');

		Mojo.Log.info("HelpPageAssistant, opening page: " + helpPageUrl);

		this.controller.get("WebId").mojo.openURL(helpPageUrl);
		//this.controller.modelChanged(this.webViewAttr);

	},

	getLocaleFailure: function(error) {
		Mojo.Log.error(error);
	},

	started: function(event){
		this.cmdMenuModel.items[3] = this.stopModel;
		this.controller.modelChanged(this.cmdMenuModel);

		this.currLoadProgressImage = 0;
	},

	stopped: function(event){
		this.cmdMenuModel.items[3] = {};
		//this.cmdMenuModel.items.push(this.reloadModel);
		//this.cmdMenuModel.items.reverse();
		this.controller.modelChanged(this.cmdMenuModel);
	},

	finished: function(event){

	},

	progress: function(event){
		var percent = event.progress;


		try {
			if (percent > 100) {
				percent = 100;
			}
			else
				if (percent < 0) {
					percent = 0;
				}

			// Update the percentage complete
			this.currLoadProgressPercentage = percent;


			// Convert the percentage complete to an image number
			// Image must be from 0 to 23 (24 images available)
			var imageNumber = percent * 0.23;
			var image = Math.round(imageNumber);
			//Mojo.Log.info("IMAGEN A CARGAR: ",percent, " ", imageNumber, " ", image);
			if (image > 23) {
				image = 23;
			}

			// Ignore this update if the percentage is lower than where we're showing
			if (image < this.currLoadProgressImage) {
				return;
			}

			// Has the progress changed?
			if (this.currLoadProgressImage != image) {
				var icon = this.controller.select('div.load-progress')[0];
				if (icon) {
					this.loadProgressAnimator = Mojo.Animation.animateValue(Mojo.Animation.queueForElement(icon), "linear", this._updateLoadProgress.bind(this), {
						from: this.currLoadProgressImage,
						to: image,
						duration: 0.5
					});
				}
			}
		}
		catch (e) {
			Mojo.Log.logException(e, e.description);
		}
	},

	_updateLoadProgress: function(image){
		// Find the progress image
		image = Math.round(image);
		// Don't do anything if the progress is already displayed
		if (this.currLoadProgressImage == image) {
			return;
		}
		var icon = this.controller.select('div.load-progress');
		var backPosition = '0px -';
		var newPosition = image * 48;
		backPosition = backPosition.concat(newPosition);
		backPosition = backPosition.concat('px');
		if (icon && icon[0]) {
			icon[0].setStyle({
				'background-position': backPosition
			});
		}
		this.currLoadProgressImage = image;
	},

	temp: function(event){
		console.log("In htere" + event);
	}


};

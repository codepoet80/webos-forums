function ForumsAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  	this.listTapHandler = this.listTap.bindAsEventListener(this);
		this._searchKey = this._searchKey.bindAsEventListener(this);
		this._focusSearch = this._focusSearch.bindAsEventListener(this);
		this.dividerFunc = this.dividerFunc.bind(this);
	  	this.searchButtonPushHandler = this.searchButtonPush.bindAsEventListener(this);

		this.firstLoad = true;

		if(args) {
			//Mojo.Log.info("Hay args: ", Object.toJSON(args));
			if (args.forum_id) {
				if(args.topic_id) {
					this.launchMode = {
						mode: "topic",
						id: args.topic_id
					};
				} else {
					this.launchMode = {
						mode: "forum",
						id: args.forum_id
					};

				}
			} else if(args.topic_id) {
					this.launchMode = {
						mode: "topic",
						id: args.topic_id
					};
			} else {
				this.launchMode = {
					mode: "default"
				}
			}
		} else {
			//Mojo.Log.info("No hay args");
		}



}

ForumsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */

	/* setup widgets here */

	/* add event handlers to listen to events from widgets */
	//if (this.forum != appSettings.currentForum) appSettings.currentForum = this.forum;
	this.setupWaitingFeedback();
	this.scrim.hide();

		this.controller.get("scrim-minimized").hide();
		//this.controller.get("forum-image").src = appSettings.currentForum.logo;
		//this.controller.get("forum-name").innerHTML = appSettings.currentForum.name;
		this.controller.get("forum-image-small").src = appSettings.currentForum.logo;

	appSettings.currentScene = "forums";

	this.appMenuModel = formatMainAppMenus();

	this.controller.setupWidget(Mojo.Menu.appMenu, {
		omitDefaultItems: true
	}, this.appMenuModel);


	this.commandMenuModel = formatMainCommandMenus();
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'fade-bottom'}, this.commandMenuModel);

	//appSettings.visual.defaultCommandMenu.items[1].toggleCmd = 'go-tree';

		this._searchModel = { value: '' };
	    this.controller.setupWidget(
			'in-fa-ma-search-text',
			{
				hintText: $L('Search') + " " + appSettings.currentForum.name,
				focus: false,
				enterSubmits: true,
				multiline: false,
				modifierState: Mojo.Widget.sentenceCase,
				focusMode: Mojo.Widget.focusInsertMode,
				requiresEnterKey: true,
				changeOnKeyPress: true
			},
			this._searchModel
		);
	//Mojo.Log.info("Logged in: ", appSettings.Tapatalk.loggedIn);



		this.idListAttrs = {
			listTemplate: 'forums/forumContainer',
			itemTemplate: 'forums/forumItem',
			dividerTemplate: 'forums/sectionDivider',
			dividerFunction: this.dividerFunc,
			lookahead: 15,
			renderLimit: 150,
			uniquenessProperty: 'forum_id',
			hasNoWidgets: true,
			itemsProperty: 'forums',
			formatters: {
				new_post: appSettings.Formatting.formatIfNewPosts.bind(this),
				logo_url: appSettings.Formatting.formatForumImage.bind(this),
				is_subscribed: appSettings.Formatting.formatForumSubscribed.bind(this),
				is_closed: appSettings.Formatting.formatForumClosed.bind(this),
				url: appSettings.Formatting.formatIfUrlPlaceholder.bind(this)

			}
		};

		this.controller.setupWidget('forumList', this.idListAttrs, appSettings.Tapatalk.forum);
		this.controller.listen('forumList', Mojo.Event.listTap, this.listTapHandler);
	this.controller.listen(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);

};

ForumsAssistant.prototype.dividerFunc = function(itemModel) {
		return itemModel.category;
};

ForumsAssistant.prototype.aboutToActivate = function() {
	this.setWaitingFeedback(false);
	//$$('body')[0].addClassName('dark-backdrop');

//if (!this.firstLoad) {
	//this.scrim.show();
	var that = this;
	//MW what is the point of refreshing this scene when popping back to it?  Maybe to see new threads?
	if (this.firstLoad) {
		this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 5000);
		appSettings.Tapatalk.forum.get_forum(this.gotForums.bind(this));
	}
	//this.controller.modelChanged(appSettings.visual.defaultCommandMenu);
//} else {
//MW moved to bottom to disable refresh 
//	this.firstLoad = false;
//}
//Mojo.Log.info("LAUNCH TEST: ", Object.toJSON(this.launchMode));
	if (this.launchMode) {
		var launchMode = this.launchMode;
		switch (this.launchMode.mode) {
			case "topic":
							//el resultado es un número
				var topic = {};
				topic.topic_id = launchMode.id;
				topic.is_subscribed = false;
				topic.can_subscribe = false;
				topic.is_closed = false;
				topic.topic_title = $L("Loading...");
				topic.reply_number = 0;
				//Mojo.Log.info(Object.toJSON(topic));

				//var that = this;
				this.controller.stageController.pushScene({
					name: "topic",
					disableSceneScroller: true
				}, topic);
			break;
			case "forum":
				var forumItem;
				var searchChild = function(item) {
					item.child.each(function(item) {
					if(item.forum_id == launchMode.id) {
						//Mojo.Log.info("Encontrado en children");
							forumItem = item;
					} else {
						if(item.child) {
							searchChild(item);
						}
					}
					})
				}
				appSettings.Tapatalk.forum.forums.each(function(item) {
					if(item.forum_id == launchMode.id) {
						//Mojo.Log.info("Encontrado");
						forumItem = item;

					} else {
						if(item.child) {
							searchChild(item);
						}
					}
				});
				this.controller.stageController.pushScene("childForum", forumItem);
				break;
			case "default":
				break;
		}
		delete this.launchMode;

	}
	//MW disable refresh when popping back to this scene.
	if (this.firstLoad) {
	this.refreshScene();
	this.firstLoad = false;
	}
};

ForumsAssistant.prototype.gotForums = function(response){
	Mojo.Log.info("ForumsAssistant.gotForums()");
//No need to log this here, because it is being logged in the Tapatalk forum parser
//  (it was added when debugging the missing forums on one particular forum).
//	if (appSettings.debug.detailedLogging) {
//		try {
//			var forumtree = appSettings.Tapatalk.forum.forums;
//			for (ii=0;ii<forumtree.length; ii++) {
//				logJSON("ForumsAssistant.gotForums(), forum: " + JSON.stringify(forumtree[ii],null,2));	
//			}		
//		} catch (ex) {
//			Mojo.Log.info("Object too complex to build json string");
//		}
//	}
		this.setWaitingFeedback(false);
		this.controller.modelChanged(appSettings.Tapatalk.forum);
			//Mojo.Log.info("preguntando mensajes");
		     // Code setting up the scene's new state goes here


	if (appSettings.Tapatalk.loggedIn) {
		appSettings.Tapatalk.privateMessage.get_inbox_stat(this.controller.stageController.assistant.gotMessagesCount.bind(this));
	}

};

ForumsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
		this.controller.get('in-fa-ma-search-text').addEventListener(Mojo.Event.propertyChange, this._searchKey);
		this._searchModel.value = '';
		this.controller.modelChanged(this._searchModel);
		//this.controller.get('search-button').style.visibility = 'hidden'; // Because changing the model doesnt fire any propertyChange events
		this.controller.document.addEventListener(Mojo.Event.tap, this._focusSearch);
		this.controller.get('in-fa-ma-search-text').mojo.focus();
		//appSettings.asyncModules.checkSync();


};

ForumsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	//$$('body')[0].removeClassName('dark-backdrop');
		this.controller.get('in-fa-ma-search-text').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
		this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);
};

ForumsAssistant.prototype.cleanup = function(event) {
		if(this.requestFeedbackTimeout) {
			this.controller.window.clearTimeout(this.requestFeedbackTimeout);
			this.requestFeedbackTimeout = null;
		}
	this.controller.stopListening('forumList', Mojo.Event.listTap, this.listTapHandler);
	this.controller.stopListening(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);
};

ForumsAssistant.prototype.doForumClose = function() {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
	  this.scrim.show();
	  this.controller.get("scrim-message-wrapper").removeClassName("hidden");
	  this.closingSession = true;
	  if (!appSettings.Tapatalk.config.version.startsWith("huddler")) {
	  	appSettings.Tapatalk.user.logout_user(function(result){
	  		appSettings.Tapatalk.connection.disable();
	  		Mojo.Controller.stageController.popScene();
	  	});
	  } else {
	  		appSettings.Tapatalk.connection.disable();
	  		Mojo.Controller.stageController.popScene();
	  }
};

ForumsAssistant.prototype.handleCommand = function(event) {
	try {
		switch (event.type) {
			case Mojo.Event.command:
				switch (event.command) {
				}
				break;
			case Mojo.Event.back:
				event.stop();
				if(!this.closingSession) this.doForumClose();
				break;
		}
	}
	catch (e) {
		Mojo.Log.error("handleCommand: ", e);
	}

};

ForumsAssistant.prototype.listTap = function(event) {
	var item = event.index;

	//Mojo.Log.info(Object.toJSON(item));

	if (appSettings.Tapatalk.forum.forums[item].is_protected) {
		var args = {
			mode: "forumLogin",
			forum_id: appSettings.Tapatalk.forum.forums[item].forum_id
		};
		//this.controller = Mojo.Controller.stageController.activeScene();
		this.controller.showDialog({
			template: 'main/userForumSetupCredentials-scene',
			assistant: new UserForumSetupCredentialsDialogAssistant(this, function(response){
				//Mojo.Log.info(Object.toJSON(response));
				if (response == true) {
					this.controller.stageController.pushScene("childForum", appSettings.Tapatalk.forum.forums[item]);
				}
				else {

				}
			}
.bind(this), args)			,
			preventCancel: false
		});
	}
	else {

		//this.controller.stageController.pushScene("childForum", appSettings.Tapatalk.forum.forums[item]);
		//Mojo.Log.info(Object.toJSON(appSettings.Tapatalk.forum.forums[item]));
		if (!appSettings.Tapatalk.forum.forums[item].url) {
			this.controller.stageController.pushScene("childForum", appSettings.Tapatalk.forum.forums[item]);
		}
		else {
			handleUrl(appSettings.Tapatalk.forum.forums[item].url);
		}
	}

};

ForumsAssistant.prototype.refreshScene = function() {
	//Mojo.Log.info("ForumsAssistant.refreshScene...");

	if (appSettings.Tapatalk.loggedIn) {
		var newItems = formatMainCommandMenus();
		//Mojo.Log.info(Object.toJSON(newItems));
		this.commandMenuModel.items =  newItems.items;
		this.controller.modelChanged(this.commandMenuModel);
		newMenuItems = formatMainAppMenus();
		this.appMenuModel.items = newMenuItems.items;
		//Mojo.Log.info(Object.toJSON(this.appMenuModel.items));
		this.controller.modelChanged(this.appMenuModel);
	}

	this.controller.get('in-fa-ma-search-text').mojo.focus();

};

ForumsAssistant.prototype.setupWaitingFeedback = function() {
	try {
		this.spinnerAttrs = {
			spinnerSize: Mojo.Widget.spinnerLarge
		};
		this.spinnerModel = {
			spinning: false
		}
		this.controller.setupWidget('activity-spinner', this.spinnerAttrs, this.spinnerModel);

		this.spinner = this.controller.get('activity-spinner');
		this.scrim = this.controller.get('scrim');
	}
	catch (e) {
		Mojo.Log.error("setupWaitingFeedback: ", e);
	}


};

ForumsAssistant.prototype.setWaitingFeedback = function(activate) {
	if (activate) {
		this.controller = Mojo.Controller.stageController.activeScene();
		this.scrim.show();
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel);

	} else {
		this.scrim.hide();
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);

		if(this.requestFeedbackTimeout) {
			this.controller.window.clearTimeout(this.requestFeedbackTimeout);
		}
	}

};

ForumsAssistant.prototype._searchKey = function(event)
	{
		if (event.originalEvent.type == 'keyup' && event.originalEvent.keyCode == Mojo.Char.enter)
		{
			if (event.value.length >= 3) {
				var args = {
					searchString: event.value

				}
				this.controller.stageController.pushScene("search", args);
			}
		}
		else if (event.value.length < 3)
		{
			this.controller.get('search-button').addClassName("disabled");
		}
		else
		{
			this.controller.get('search-button').removeClassName("disabled");
		}
	};
ForumsAssistant.prototype._focusSearch = function(event)
	{
		this.controller.get('in-fa-ma-search-text').mojo.focus.defer();
	};

ForumsAssistant.prototype.searchButtonPush = function(event) {
	//Mojo.Log.info("Pulsado Botón: ", this._searchModel.value);
	if (this._searchModel.value.length >= 3) {
		var args = {
			searchString: this._searchModel.value,
			hideCommandMenu: true

		}
		//this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
		this.controller.stageController.pushScene("search", args);
	}

};

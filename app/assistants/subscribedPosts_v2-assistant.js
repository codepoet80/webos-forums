function SubscribedPostsAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  this.parentForum = args;

	  this.listTapHandler = this.listTap.bindAsEventListener(this);
	  this.topicListTapHandler = this.topicListTap.bindAsEventListener(this);
	  this.forumMenuTapHandler = this.forumMenuTap.bindAsEventListener(this);
	  this.searchButtonPushHandler = this.searchButtonPush.bindAsEventListener(this);
	  this.total_topic_num = 0;
	  this.total_forums_num = 0;
	  this.firstLoad = true;
	  this.topicList = {};
	  this.topicList.topics = [];
	  this.forumList = {};
	  this.forumList.forums = [];

	  //this.currentForum = {};
	  this.mode = "subscribed";

	  	this._searchKey = this._searchKey.bindAsEventListener(this);
		this._focusSearch = this._focusSearch.bindAsEventListener(this);
		this.searchBarState = false;
	  this.headerTapHandler = this.headerTap.bindAsEventListener(this);

		//for metatap handling
		this.metaTapPressed = false;
		this.metaTapHandler = this.metaTap.bindAsEventListener(this);
		this.metaTapReleaseHandler = this.metaTapRelease.bindAsEventListener(this);
		this.topicListOnHoldHandler = this.topicListOnHold.bindAsEventListener(this);
		this.topicListOnHoldEndHandler = this.topicListOnHoldEnd.bindAsEventListener(this);

}

SubscribedPostsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */

	/* setup widgets here */

	/* add event handlers to listen to events from widgets */

	appSettings.currentScene = "subscribedPosts";
	this.appMenuModel = formatMainAppMenus();

	this.controller.setupWidget(Mojo.Menu.appMenu, {
		omitDefaultItems: true
	}, this.appMenuModel);


	this.commandMenuModel = formatMainCommandMenus();
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'fade-bottom'}, this.commandMenuModel);

	this.setupWaitingFeedback();

		this.controller.get("scrim-minimized").hide();
		this.controller.get("forum-image-small").src = appSettings.currentForum.logo;

	this.topicListAttrs = {
		listTemplate: 'forums/forumContainer',
		itemTemplate: 'recentPosts/topicItem',
		dividerFunction: this.topicDivider,
		dividerTemplate: 'recentPosts/topicDivider',
		emptyTemplate: 'subscribedPosts/emptyTopics',
		lookahead: 10,
		renderLimit: 15,
		uniquenessProperty: 'topic_id',
		itemsCallback: this.getTopics.bind(this),
		hasNoWidgets: true,
		formatters: {
			post_time: appSettings.Formatting.getNiceDate.bind(this),
			icon_url: appSettings.Formatting.formatTopicImage.bind(this),
			new_post: appSettings.Formatting.formatIfNewPosts.bind(this),
			is_subscribed: function(value,model) {return "hidden";}.bind(this),
			is_closed: appSettings.Formatting.formatForumClosed.bind(this),
			topic_title: appSettings.Formatting.formatTopicTitle.bind(this),
			short_content: appSettings.Formatting.formatPostContent.bind(this)

		}

	};

	this.controller.setupWidget('topicList', this.topicListAttrs, this.topicList);


	this.forumListAttrs = {
		listTemplate: 'forums/forumContainer',
		itemTemplate: 'forums/forumItem',
		emptyTemplate: 'subscribedPosts/emptyForums',
		lookahead: 15,
		renderLimit: 25,
		uniquenessProperty: 'forum_id',
		hasNoWidgets: true,
		//itemsCallback: this.getForumsWrapper.bind(this),
		itemsProperty: "forums",
		formatters: {
			logo_url: appSettings.Formatting.formatForumImage.bind(this),
			new_post: appSettings.Formatting.formatIfNewPosts.bind(this),
			is_subscribed: function(value, model){
				return "hidden";
			}.bind(this), //formatting.formatForumSubscribed.bind(this),
			is_closed: appSettings.Formatting.formatForumClosed.bind(this),
			url: appSettings.Formatting.formatIfUrlPlaceholder.bind(this)
		}

	};

	this.controller.setupWidget('forumList', this.forumListAttrs, this.forumList);

	switch (this.mode) {
		case "subscribed":
			this.controller.get("header_button").innerHTML = MenuData.PopupMenu.ViewSubscribedTopics.label;
			this.controller.get("forums").removeClassName("hidden");
			break;
		case "participated":
			this.controller.get("header_button").innerHTML = MenuData.PopupMenu.ViewParticipatedTopics.label;
			this.controller.get("forums").addClassName("hidden");
			break;
	}

	this.controller.get("forum_name").innerHTML = appSettings.currentForum.name;


		this._searchModel = { value: '' };
	    this.controller.setupWidget(
			'search-field',
			{
				hintText: $L('Search...'),
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
		this.searchBar = this.controller.get("search-bar");

	this.controller.listen('topicList', Mojo.Event.listTap, this.topicListTapHandler);
	this.controller.listen('forumList', Mojo.Event.listTap, this.listTapHandler);
	this.controller.listen(this.controller.get("header_button"), Mojo.Event.tap, this.forumMenuTapHandler);
	this.controller.listen(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);
	this.controller.listen(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);

	this.controller.listen('topicList', Mojo.Event.hold, this.topicListOnHoldHandler.bind(this));
	this.controller.listen('topicList', Mojo.Event.holdEnd, this.topicListOnHoldEndHandler.bind(this));


};

SubscribedPostsAssistant.prototype.refreshScene = function() {
	Mojo.Log.info("SubscribedPostsAssistant.refreshScene(), logged in: " + appSettings.Tapatalk.loggedIn);
	this.controller.get('topicList').mojo.setLengthAndInvalidate(this.total_topic_num);
	if (appSettings.Tapatalk.loggedIn) {
		var newItems = formatMainCommandMenus();
		if (false && appSettings.debug.detailedLogging) {
			Mojo.Log.info("CommandMenu items: " + Object.toJSON(newItems));
		}
		this.commandMenuModel.items =  newItems.items;
		this.controller.modelChanged(this.commandMenuModel);
		newMenuItems = formatMainAppMenus();
		this.appMenuModel.items = newMenuItems.items;
		if (false && appSettings.debug.detailedLogging) {
			Mojo.Log.info("appMenu items: " + Object.toJSON(this.appMenuModel.items));
		}
		this.controller.modelChanged(this.appMenuModel);
	}

};


SubscribedPostsAssistant.prototype.aboutToActivate = function () {
	Mojo.Log.info("SubscribedPostsAssistant.aboutToActivate()");
	this.setWaitingFeedback(false);
	//$$('body')[0].addClassName('dark-backdrop');

	try {
		if (!this.firstLoad) {
			this.refreshScene();
		}
	this.firstLoad = false;

	} catch (e) {
		Mojo.Log.error("SubscribedPostsAssistant aboutToActivate ERROR", e);
	}
};

SubscribedPostsAssistant.prototype.activate = function(event) {
	//appSettings.asyncModules.checkSync();
	Mojo.Log.info("SubscribedPostsAssistant.activate(), logged in: " + appSettings.Tapatalk.loggedIn);
	if (appSettings.Tapatalk.loggedIn) {
		Mojo.Log.info("SubscribedPostsAssistant.activate(), checking for new private messages");
		appSettings.Tapatalk.privateMessage.get_inbox_stat(this.controller.stageController.assistant.gotMessagesCount.bind(this));
	}
	
//TODO: implement UI for these..
/*
	appSettings.Tapatalk.social.get_alert("me", function(result) {
		logJSON("gotAlert(): " + JSON.stringify(result,null,2));
	}.bind(this));
*/
		this.controller.get('search-field').addEventListener(Mojo.Event.propertyChange, this._searchKey);
		this._searchModel.value = '';
		this.controller.modelChanged(this._searchModel);
		//this.controller.get('search-button').style.visibility = 'hidden'; // Because changing the model doesnt fire any propertyChange events
		this.controller.get('search-button').addClassName('disabled');
		this.controller.document.addEventListener(Mojo.Event.tap, this._focusSearch);
		if (Mojo.Environment.DeviceInfo.keyboardAvailable) {
			this.controller.get('search-field').mojo.focus();
		}

		//metatap support
		this.controller.listen(this.controller.document, Mojo.Event.keydown, this.metaTapHandler, true);
		this.controller.listen(this.controller.document, Mojo.Event.keyup, this.metaTapReleaseHandler, true);

};


SubscribedPostsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
		this.controller.get('search-field').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
		this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);
	//$$('body')[0].removeClassName('dark-backdrop');

		//metatap support
		this.controller.stopListening(this.controller.document, Mojo.Event.keydown, this.metaTapHandler, true);
		this.controller.stopListening(this.controller.document, Mojo.Event.keyup, this.metaTapReleaseHandler, true);

};

SubscribedPostsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
		if(this.requestFeedbackTimeout) {
			this.controller.window.clearTimeout(this.requestFeedbackTimeout);
			this.requestFeedbackTimeout = null;
		}
	this.controller.stopListening('topicList', Mojo.Event.listTap, this.topicListTapHandler);
	this.controller.stopListening('forumList', Mojo.Event.listTap, this.listTapHandler);
	this.controller.stopListening(this.controller.get("header_button"), Mojo.Event.tap, this.forumMenuTapHandler);
	this.controller.stopListening(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);
	this.controller.stopListening(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);

	this.controller.stopListening('topicList', Mojo.Event.hold, this.topicListOnHoldHandler.bind(this));
	this.controller.stopListening('topicList', Mojo.Event.holdEnd, this.topicListOnHoldEndHandler.bind(this));

};

SubscribedPostsAssistant.prototype.doForumClose = function() {
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

SubscribedPostsAssistant.prototype.handleCommand = function(event) {

		//Mojo.Log.info("SubscribedPostsAssistant.handleCommand()");

		if(event.type == Mojo.Event.commandEnable && (event.command == Mojo.Menu.helpCmd || event.command == Mojo.Menu.prefsCmd)) {
			event.stopPropagation();
		}

		try {

			if (event.type == Mojo.Event.command) {
				switch (event.command) {
				}
			}
			if (event.type == Mojo.Event.back) {
				event.stop();
				if(!this.closingSession) this.doForumClose();
			}
		}
		catch (e) {
			Mojo.Log.error("handleCommand: ", e);
		}
};

SubscribedPostsAssistant.prototype.setupWaitingFeedback = function() {
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

SubscribedPostsAssistant.prototype.setWaitingFeedback = function(activate) {
	if (activate) {
		var that = this;
		this.requestFeedbackTimeout = this.controller.window.setTimeout(function(){
			//that.controller.get('activity-spinner');
			that.controller.get('scrim').show();

			//that.scrim.show();
			that.spinnerModel.spinning = true;
			that.controller.modelChanged(that.spinnerModel);
		}, 3000);

	} else {
		this.controller.get('scrim').hide();
		//this.scrim.hide();
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);

		if(this.requestFeedbackTimeout) {
			this.controller.window.clearTimeout(this.requestFeedbackTimeout);
			this.requestFeedbackTimeout = null;
		}
	}
	//this.timeoutRequesting = null;

};

SubscribedPostsAssistant.prototype.forumMenuTap = function(event) {

	try {
		var place = event.target.id;
		event.stopPropagation();

		var subMenuItems = [];

		//Mojo.Log.info(Object.toJSON(this.parentForum));

		//subMenuItems.push(MenuData.PopupMenu.MarkAsRead);
		subMenuItems.push(MenuData.PopupMenu.ViewSubscribedTopics);
		subMenuItems.push(MenuData.PopupMenu.ViewParticipatedTopics);
		subMenuItems.push({});
		subMenuItems.push(MenuData.PopupMenu.MarkAllAsRead);

		if(this.mode == "subscribed") {
			subMenuItems[0].chosen = true;
			subMenuItems[1].chosen = false;
		} else {
			subMenuItems[0].chosen = false;
			subMenuItems[1].chosen = true;
		}
		this.popupMenuModel = {
			onChoose: this.forumMenuPopupHandler,
			//placeNear: place,
			manualPlacement: true,
			popupClass: "forum-menu-popup",
			items: subMenuItems
		};

		this.controller.popupSubmenu(this.popupMenuModel);
	} catch (e) {
		Mojo.Log.error("Tap&Talk - forumMenuTap: ", e);
	}
};

SubscribedPostsAssistant.prototype.forumMenuPopupHandler = function(choice) {
	try {
	//this.scrim.removeClassName("hidden");;
		switch (choice) {
			case 'viewSubscribedTopics':
				this.controller.getSceneScroller().mojo.revealTop();
				this.controller.getSceneScroller().mojo.adjustBy(0, 50);
				this.controller.get("header_button").innerHTML = MenuData.PopupMenu.ViewSubscribedTopics.label;
				this.mode = "subscribed";
				this.scrim.removeClassName("hidden");
				if (this.total_topic_num == 0) this.total_topic_num = 1;
				this.controller.get("topicList").mojo.setLengthAndInvalidate(this.total_topic_num);
				break;
			case 'viewParticipatedTopics':
				this.controller.getSceneScroller().mojo.revealTop();
				this.controller.getSceneScroller().mojo.adjustBy(0, 50);
				this.controller.get("header_button").innerHTML = MenuData.PopupMenu.ViewParticipatedTopics.label;
				this.mode = "participated";
				this.scrim.removeClassName("hidden");
				if (this.total_topic_num == 0) this.total_topic_num = 1;
				this.controller.get("topicList").mojo.setLengthAndInvalidate(this.total_topic_num);
				break;
			case MenuData.PopupMenu.MarkAllAsRead.command:
				var that = this;
				appSettings.Tapatalk.forum.mark_all_as_read(function(result){
					Mojo.Controller.getAppController().showBanner($L("All forums marked as read"), {}, {});
					that.controller.get('topicList').mojo.setLengthAndInvalidate(that.total_topic_num);
				});
				break;
		}

	} catch (e) {
		Mojo.Log.error("childForum forumMenuPopupHandler: ", e);
	}

};

SubscribedPostsAssistant.prototype.listTap = function(event) {
	var item = event.item;
	var index = event.index;

	this.controller.stageController.pushScene("childForum", item);

};

SubscribedPostsAssistant.prototype.topicListTap = function(event) {
	var item = event.item;
	var index = event.index;

if (!this.metaTapPressed && !this._onHold) {
	this.controller.stageController.pushScene({
		name: "topic",
		disableSceneScroller: true
	}, item);

} else if (this.metaTapPressed && !this._onHold) {
				//var currentSession = appSettings.Tapatalk.headers;
				Mojo.Log.info("SESSION (Tapatalk.headers): ", appSettings.Tapatalk.headers);
				this.metaTapPressed = false;
				var newStageName = "forumsSL-" + Date.now();
				appSettings.subLaunchStages.push(newStageName);
				var params = {
					method: "_openTopic",
					forum: appSettings.currentForum,
					newStageName: newStageName,
					parentStage: appSettings.currentStage,
					parameters: {
						loggedIn: appSettings.Tapatalk.loggedIn,
						session: appSettings.Tapatalk.headers,
						topic: item
					}
				};
				Mojo.Controller.getAppController().launch(Mojo.Controller.appInfo.id, params);
/*
				this.controller.serviceRequest('palm://com.palm.applicationManager', {
					method: 'open',
					parameters: {
						'id': Mojo.Controller.appInfo.id,
						'params': params
					}
				});

*/

}
else {

			if (!this.currentEvent) {
				this.currentEvent = item;
			}
			this._onHold=false;

/*
	try {
		this.controller = Mojo.Controller.stageController.activeScene();

		var params = {
			method: "_openTopic",
			forum: appSettings.currentForum,
			parameters: {
				session: appSettings.Tapatalk.headers,
				topic: item
			}
		};
		this.controller.serviceRequest('palm://com.palm.applicationManager', {
			method: 'open',
			parameters: {
				'id': Mojo.Controller.appInfo.id,
				'params': params
			}
		});
	}
	catch (e) {
		Mojo.Log.error("Error launching new card: ", e);
	}

*/
}

};

SubscribedPostsAssistant.prototype.topicListOnHold = function(event) {

		//Mojo.Log.info(Object.toJSON(event));
		Mojo.Log.info("onHold");
		var target = event.target;
		this.currentElement = event.srcElement.up(".palm-row");
		this._onHold = true;

			//Deactivating Horizontal Scroller
			//this.horizScrollerModel.mode = "none";
			//this.controller.modelChanged(this.horizScrollerModel);


			var currentEvent = {};
			var listElement = this.controller.get("topicList");
			var rows = listElement.select(".palm-row");
			var modelIndex = rows.indexOf(this.currentElement);

			//currentEvent = {};
			//currentEvent.index = modelIndex;

		//Mojo.Log.info(Object.toJSON(currentEvent.index));
		//this.currentEvent = currentEvent;
		var dragElem = event.target.up("div.palm-row");

		this.popupMenuModel = {
			onChoose: this.holdPopupHandler,
            placeNear: dragElem,
			items: [MenuData.PopupMenu.OpenTopic,
			MenuData.PopupMenu.OpenTopicNewCard]
		};
		if (appSettings.Tapatalk.config.enableCopy) {
			this.popupMenuModel.items.push({});
			this.popupMenuModel.items.push(MenuData.PopupMenu.CopyThreadURL);
			if (appSettings.config.twitter.authorized) {
				this.popupMenuModel.items.push({});
				this.popupMenuModel.items.push(MenuData.PopupMenu.TweetThis);
			}
		}

		this.controller.popupSubmenu(this.popupMenuModel);



	};

SubscribedPostsAssistant.prototype.holdPopupHandler = function(command){
	var item = Object.clone(this.currentEvent);

	//delete this.currentEvent;
	//this.currentEvent = undefined;
	if (this.currentEvent) {
		Mojo.Log.info("HAY CURRENT EVENT");
		switch (command) {
			case MenuData.PopupMenu.OpenTopic.command:
				this.controller.stageController.pushScene({
					name: "topic",
					disableSceneScroller: true
				}, item);
				break;
			case MenuData.PopupMenu.OpenTopicNewCard.command:
				var newStageName = "forumsSL-" + Date.now()
				appSettings.subLaunchStages.push(newStageName)
				var params = {
					method: "_openTopic",
					forum: appSettings.currentForum,
					newStageName: newStageName,
					parentStage: appSettings.currentStage,
					parameters: {
						loggedIn: appSettings.Tapatalk.loggedIn,
						session: appSettings.Tapatalk.headers,
						topic: item
					}
				};
				this.controller.serviceRequest('palm://com.palm.applicationManager', {
					method: 'open',
					parameters: {
						'id': Mojo.Controller.appInfo.id,
						'params': params
					}
				});
				break;
			case MenuData.PopupMenu.CopyThreadURL.command:
				var currentURI = generateURI(this.currentEvent.forum_id, this.currentEvent.topic_id, 0, true);
/*
				var siteRoot = appSettings.currentForum.url.replace(/\057$/i, "");
				var fullURL = siteRoot + "/" + currentURI;

*/				Mojo.Log.info(currentURI);
				this.controller.stageController.setClipboard(currentURI, true);
				Mojo.Controller.getAppController().showBanner($L("URL Copied to Clipboard"), {}, {});
				break;
			case MenuData.PopupMenu.TweetThis.command:
				var currentURI = generateURI(this.currentEvent.forum_id, this.currentEvent.topic_id, 0, true);
				var arguments = {
					tweet: this.currentEvent.topic_title,
					url: currentURI
				}
				this.controller.showDialog({
					template: 'tweetDialog/tweetDialog-scene',
					assistant: new TweetDialogAssistant(this, function(response){
					}
.bind(this), arguments)					,
					preventCancel: false
				});

				break;
		}
		delete this.currentEvent;
	}
	else {
		Mojo.Log.info("NO HAY CURRENT EVENT");
	}
};

SubscribedPostsAssistant.prototype.topicListOnHoldEnd = function(event) {
		if (this.currentElement === event.srcElement.up(".palm-row")) {
			this._onHold = true;
		} else {
			this._onHold = false;
		}
		Mojo.Log.info("ONHOLD: ", this._onHold);
	};

SubscribedPostsAssistant.prototype.metaTap = function(event){
	Mojo.Log.info("Key pressed;  meta:", (event.originalEvent.metaKey === true), " - ", event.originalEvent.keyCode);
	if (event.originalEvent.metaKey === true) {
		Mojo.Log.info("METATAP PRESSED");
		this.metaTapPressed = true;
	};

	if (event.originalEvent.keyCode == 84) {
		this.controller.getSceneScroller().mojo.scrollTo(0, 0, true);
		//Another possible method:
		//list.mojo.revealItem(0, false);
	}

	if (event.originalEvent.keyCode == 66) {
		//Mojo.Log.info("Scroller size: " + Object.toJSON(this.controller.getSceneScroller().mojo.scrollerSize()));
		//Mojo.Log.info("Scroller height: " + this.controller.getSceneScroller().mojo.scrollerSize().height);
		//Mojo.Log.info("Scroller position: " + Object.toJSON(this.controller.getSceneScroller().mojo.getScrollPosition()));
		//this.controller.getSceneScroller().mojo.revealBottom();
		//this.controller.getSceneScroller().mojo.scrollTo(200, 200, true);

		///*
		var lengthList;
		lengthList = this.controller.get('topicList').mojo.getLength();

		//Mojo.Log.info("topicList length: " + this.controller.get('topicList').mojo.length);
		Mojo.Log.info("topicList length: " + this.controller.get('topicList').mojo.getLength());
		//Mojo.Log.info("topicList length: " + JSON.stringify(this.controller.get('topicList').mojo));
		this.controller.get('topicList').mojo.revealItem(lengthList, true);
		//*/

	}
	//Key pressed;  meta: true  -  66 (B)
	//Key pressed;  meta: true  -  84 (T)

};

SubscribedPostsAssistant.prototype.metaTapRelease = function(event){
	Mojo.Log.info("Key released;  meta:", (event.originalEvent.metaKey === true), " - ", event.originalEvent.keyCode);
	if (event.originalEvent.metaKey === true) {
		Mojo.Log.info("METATAP RELEASED");
		this.metaTapPressed = false;
	}
	else if (!this.searchBarState) {
		Mojo.Log.info("Key released;  meta:", (event.originalEvent.metaKey === true), " - ", event.originalEvent.keyCode);
		//Detect if search is open.. if not, don't scroll
		if (event.originalEvent.keyCode == 8) {
			this.controller.getSceneScroller().mojo.scrollTo(0, 0, true);
			//Another possible method:
			//this.controller.get('topicList').mojo.revealItem(0, false);
		}

		if (event.originalEvent.keyCode == 13) {
			//Mojo.Log.info("Scroller size: " + Object.toJSON(this.controller.getSceneScroller().mojo.scrollerSize()));
			//Mojo.Log.info("Scroller height: " + this.controller.getSceneScroller().mojo.scrollerSize().height);
			//Mojo.Log.info("Scroller position: " + Object.toJSON(this.controller.getSceneScroller().mojo.getScrollPosition()));
			//this.controller.getSceneScroller().mojo.revealBottom();
			//this.controller.getSceneScroller().mojo.scrollTo(200, 200, true);

			///*
			var lengthList;
			lengthList = this.controller.get('topicList').mojo.getLength();

			//Mojo.Log.info("topicList length: " + this.controller.get('topicList').mojo.length);
			Mojo.Log.info("topicList length: " + this.controller.get('topicList').mojo.getLength());
			//Mojo.Log.info("topicList length: " + JSON.stringify(this.controller.get('topicList').mojo));
			this.controller.get('topicList').mojo.revealItem(lengthList, true);
			//*/

		}
	}
};

SubscribedPostsAssistant.prototype.getTopics = function(listWidget,postsOffset,postsLimit) {
	var last_number = postsOffset + postsLimit -1;
	//var that = this;

	try {
		Mojo.Log.info("SubscribedPostsAssistant.getTopics, postOffset=" + postsOffset + ",postsLimit=" + postsLimit);
		
 		//this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
  		if (!this.requestFeedbackTimeout) this.setWaitingFeedback(true);
		this.controller.get('topicCounter').addClassName('hidden');

		if (this.mode == "subscribed") {

			appSettings.Tapatalk.subscription.get_subscribed_forum(this.gotForums.bind(this));
			//appSettings.Tapatalk.subscription.get_subscribed_topic(this.gotTopics.curry(listWidget, postsOffset, postsLimit).bind(this));
			//mw need to pass in offset and last_number to get all subscribed topics.
			appSettings.Tapatalk.subscription.get_subscribed_topic(postsOffset, last_number, this.gotTopics.curry(listWidget, postsOffset, postsLimit).bind(this));
		}
		else {
			appSettings.Tapatalk.topic.get_participated_topic(postsOffset, last_number, this.gotTopics.curry(listWidget, postsOffset, postsLimit).bind(this));
		}
	}
	catch (e) {
		Mojo.Log.error("getTopics ERROR: ", e);
	}

};

SubscribedPostsAssistant.prototype.gotForums = function(response){
	if (appSettings.debug.detailedLogging) { 
		logJSON("Subscribed.gotForums() response: " + JSON.stringify(response,null,2));
	}
				//Mojo.Log.info(Object.toJSON(response));
				try {
					//that.setWaitingFeedback(false);

					//that.cmdMenuModel.items[0].disabled = !response.can_post;
					//that.controller.modelChanged(that.cmdMenuModel);
					if (response.result == false) {
						//Mojo.Controller.errorDialog(response.result_text);
						this.setWaitingFeedback(false);

					}
					else {
						var i;
						//Mojo.Log.info("Completing forum Info...");
						for (i = 0; i <= response.forums.length - 1; i++) {
							//Mojo.Log.info("CARGANDO FOROS::::", Object.toJSON(appSettings.forums[1]));
							response.forums[i].is_subscribed = true;
							response.forums[i].can_subscribe = true;
						}

						this.forumList.forums = response.forums;
						this.controller.modelChanged(this.forumList);
					}

				}
				catch (e) {
					Mojo.Log.error("ERROR obtaining forums: ", e);
				}
};

SubscribedPostsAssistant.prototype.gotTopics = function(listWidget, postsOffset, postsLimit, response) {
	Mojo.Log.info("SubscribedPostsAssistant.gotTopics");
	try {

		if (!response.error && response.topics) {
			//&& !response.result==false)
			if (appSettings.debug.detailedLogging) { 
				//logJSON("SubscribedPostsAssistant.gotTopics, ok: \n" + JSON.stringify(response,null,2));
				Mojo.Log.info("SubscribedPostsAssistant.gotTopics, ok: received " + response.topics.length + " topics.  postOffset=" + postsOffset + ",postsLimit=" + postsLimit);
				for (ii=0;ii<response.topics.length;ii++) {
					Mojo.Log.info("subscribedtopic" + ii + ":" + response.topics[ii].topic_title);
				}
			}
			if (this.mode == "subscribed") {
				this.controller.get("forums").removeClassName("hidden");
			}
			else {
				this.controller.get("forums").addClassName("hidden");
			}
			//Mojo.Log.info("RESPUESTA: ", Object.toJSON(response));
			listWidget.mojo.noticeUpdatedItems(postsOffset, response.topics);
			///*
			if (response.total_topic_num != this.total_topic_num && this.total_topic_num != 0) {
				Mojo.Log.info("gotTopics() calling setLengthAndInvalidate");
				listWidget.mojo.setLengthAndInvalidate(response.total_topic_num);
			}
			else {
				Mojo.Log.info("gotTopics() calling setLength");
				listWidget.mojo.setLength(response.total_topic_num);
			}

			this.total_topic_num = response.total_topic_num;
			//*/
			/*
			//mw let's try some different logic, like the recentPosts logic, because the get_subscribed_topic method isn't taking or sending any parms to the Tapatalk API
			//This method will not request additional topics as you scroll. In subscribed topic view, I think that is what is
			//causing the topics to be repeated. I suspect the logic for requesting more is using the wrong start #
			listWidget.mojo.setLength(response.topics.length);
			this.total_topic_num = response.topics.length;
			*/
			
			if (this.total_topic_num != "0") {
				this.controller.get("forum_count").innerHTML = this.total_topic_num;
				this.controller.get('topicCounter').removeClassName('hidden');
			}
			else {
				this.controller.get('topicCounter').addClassName('hidden');

			}
			//clearTimeout(this.requestFeedbackTimeout);
/*
			if (this.mode == "subscribed") {
				appSettings.Tapatalk.subscription.get_subscribed_forum(this.gotForums.bind(this));
			}

*/			Mojo.Log.info("Disabling scrim");
			this.setWaitingFeedback(false);
		} else {
			//mw experimental 'fix' for session errors on webosnation.  re-authenticate if session has been invalidated.
			//TODO: add error handling to new message send, which is also affected. 
			Mojo.Log.info("SubscribedPostsAssistant.gotTopics, error:" + JSON.stringify(response));
			//appSettings.debug.sessionRecovery && 
			if (response.error == "reauthenticate" || (appSettings.Tapatalk.loggedIn && response.result == false)) {
				Mojo.Log.info("Server indicates reauthenticate, or session somehow invalidated: reauthenticate ", appSettings.Tapatalk.connection.reauthenticate);
				Mojo.Controller.getAppController().showBanner($L("Re-authenticating..."), "", "");
				var that = this;
				var retries = 0;
				var wasReauthenticate = false;
				var timer = that.controller.window.setInterval(function(){
					if (!appSettings.Tapatalk.connection.reauthenticate) {
						Mojo.Log.info("waiting...");
						//retries = retries + 1;
						//if (appSettings.Tapatalk.loggedIn && retries == 2) {
							Mojo.Log.info("Tired of waiting, calling authenticate...");
							clearInterval(timer);
							appSettings.Tapatalk.authenticate(function(result) {
								that.getTopics(listWidget, postsOffset, postsLimit);
							});
						//}
					}
				}, 2000);
				//this.getTopics(listWidget, postsOffset, postsLimit);
			}
			else if (response.result==false) {
				Mojo.Log.error("Well, what now?");
				if (response.result == false) {
					var alertMessage = $L(response.result_text);
					Mojo.Controller.errorDialog(alertMessage);
					//this.canSendMessages = false;
				}
			}
		}
		//this.setWaitingFeedback(false);

	}
	catch (e) {
		Mojo.Log.error(e);
	}
};

SubscribedPostsAssistant.prototype.topicDivider = function(model){
	//Mojo.Log.info(itemModel.niceDate);
	return model.niceDate;
	//return model.dividerDate;
	//return model.topic_id;

};

/*
SubscribedPostsAssistant.prototype.startRequestTimer = function () {
this.start_date = new Date();
this.timer = this.controller.window.setInterval(this.setWaitingFeedback(true), 1000);
};

*/

SubscribedPostsAssistant.prototype.headerTap = function(event){

	this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
};
SubscribedPostsAssistant.prototype.searchBarAnimationDone = function(){
	this.searchBarState = !this.searchBarState;
};

SubscribedPostsAssistant.prototype.animateSearchPanel = function(panel, reverse, callback){

	var searchPanelHiddenTop = 26;
	var searchPanelVisibleTop = 75;


	 Mojo.Animation.animateStyle(panel, 'top', 'bezier', {
	 from: searchPanelHiddenTop,
	 to: searchPanelVisibleTop,
	 duration: 0.32,
	 curve: 'over-easy',
	 reverse: reverse,
	 onComplete: callback
	 });


/*	Mojo.Animation.animateStyle(scrim, 'top', 'bezier', {
		from: searchPanelHiddenTop,
		to: searchPanelVisibleTop,
		duration: 0.5,
		curve: 'ease-in',
		onComplete: callback
	});*/
};

SubscribedPostsAssistant.prototype._searchKey = function(event)
	{
		if (event.originalEvent.type == 'keyup' && event.originalEvent.keyCode == Mojo.Char.enter)
		{
			if (event.value.length >= 3) {
				var args = {
					searchString: event.value,
					hideCommandMenu: true

				}
				this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
				this.controller.stageController.pushScene("search", args);
			}
		}
		else if (event.value.length < 3)
		{
			//this.controller.get('search-button').style.visibility = 'hidden';
			this.controller.get('search-button').addClassName('disabled');
		}
		else
		{
			//this.controller.get('search-button').style.visibility = 'visible';
			this.controller.get('search-button').removeClassName('disabled');

		}
		if (event.value.length > 0 && !this.searchBarState) {
				this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
		}
		if (event.value.length == 0 && Mojo.Char.isDeleteKey(event.originalEvent.keyCode) && this.searchBarState) {
				this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
		}

	};
SubscribedPostsAssistant.prototype._focusSearch = function(event)
	{
		this.controller = Mojo.Controller.stageController.activeScene();
		this.controller.get('search-field').mojo.focus.defer();
	};

SubscribedPostsAssistant.prototype.searchButtonPush = function(event) {
	Mojo.Log.info("Pulsado Botón: ", this._searchModel.value);
	if (this._searchModel.value.length >= 3) {
		var args = {
			searchString: this._searchModel.value,
			hideCommandMenu: true

		}
		//this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
		this.controller.stageController.pushScene("search", args);
	}

};

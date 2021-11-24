function RecentPostsAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  //this.parentForum = args;

	  this.topicListTapHandler = this.topicListTap.bindAsEventListener(this);
	  this.forumMenuTapHandler = this.forumMenuTap.bindAsEventListener(this);
	  this.headerTapHandler = this.headerTap.bindAsEventListener(this);
	  this.searchButtonPushHandler = this.searchButtonPush.bindAsEventListener(this);
	  this.total_unread_num = 0;
	  this.firstLoad = true;
	  this.topicList = {};
	  this.topicList.items = [];
	  this.mode = "recent";
	  if (!appSettings.config.newTopicsCount) {
	  	appSettings.config.newTopicsCount = 20;
	  }
	  //Debug

	  this.logTopics = false;

	  //this.currentForum = {};
	  	this._searchKey = this._searchKey.bindAsEventListener(this);
		this._focusSearch = this._focusSearch.bindAsEventListener(this);
		this.searchBarState = false;

		//for metatap handling
		this.metaTapPressed = false;
		this.metaTapHandler = this.metaTap.bindAsEventListener(this);
		this.metaTapReleaseHandler = this.metaTapRelease.bindAsEventListener(this);
		this.topicListOnHoldHandler = this.topicListOnHold.bindAsEventListener(this);
		this.topicListOnHoldEndHandler = this.topicListOnHoldEnd.bindAsEventListener(this);

}

RecentPostsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */

	/* setup widgets here */

	/* add event handlers to listen to events from widgets */

	appSettings.currentScene = "recentPosts";

	this.appMenuModel = formatMainAppMenus();

	this.controller.setupWidget(Mojo.Menu.appMenu, {
		omitDefaultItems: true
	}, this.appMenuModel);


	this.commandMenuModel = formatMainCommandMenus();
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'fade-bottom'}, this.commandMenuModel);

	this.setupWaitingFeedback();

		this.controller.get("scrim-minimized").hide();
		this.controller.get("forum-image-small").src = appSettings.currentForum.logo;

	this.controller.get("header_button").innerHTML = $L("Recent Posts");
	this.controller.get("forum_name").innerHTML = appSettings.currentForum.name;

	this.topicListAttrs = {
		listTemplate: 'forums/forumContainer',
		itemTemplate: 'recentPosts/topicItem',
		dividerFunction: this.topicDivider,
		dividerTemplate: 'recentPosts/topicDivider',
		emptyTemplate: 'recentPosts/emptyPosts',
		lookahead: 10, //request approx. half again this many when scrolling toward bottom of list (10->6, 5->3)
		renderLimit: 20, //15,  //can't figure out formula for how many list requests.  with lookahead of 10: 15->35, 20 ->40
		uniquenessProperty: 'topic_id',
		itemsCallback: this.getTopics.bind(this),
		hasNoWidgets: true,
		formatters: {
			post_time: appSettings.Formatting.getNiceDate.bind(this),
			icon_url: appSettings.Formatting.formatTopicImage.bind(this),
			new_post: appSettings.Formatting.formatIfNewPosts.bind(this),
			is_subscribed: appSettings.Formatting.formatForumSubscribed.bind(this),
			is_closed: appSettings.Formatting.formatForumClosed.bind(this),
			topic_title: appSettings.Formatting.formatTopicTitle.bind(this),
			short_content: appSettings.Formatting.formatPostContent.bind(this)
		}

	};

	this.controller.setupWidget('topicList', this.topicListAttrs, this.topicList);

/*	this.cmdMenuModel = {
		visible: true,
		items: [{
			iconPath: "images/menu-icon-new-thread.png",
			command: "addNewTopic",
			disabled: this.parentForum.sub_only
		}, {}, {}]
	};

	this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.cmdMenuModel);
*/

		this._searchModel = { value: '' };
	    this.controller.setupWidget(
			'search-field',
			{
				hintText: $L('Search Forums...'),
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
	this.controller.listen(this.controller.get("header_button"), Mojo.Event.tap, this.forumMenuTapHandler);
	this.controller.listen(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);
	this.controller.listen(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);

	this.controller.listen('topicList', Mojo.Event.hold, this.topicListOnHoldHandler.bind(this));
	this.controller.listen('topicList', Mojo.Event.holdEnd, this.topicListOnHoldEndHandler.bind(this));

};

RecentPostsAssistant.prototype.refreshScene = function() {
	//Mojo.Log.info("REFRESCANDO Scene...");
	this.controller.get('topicList').mojo.setLengthAndInvalidate(appSettings.config.newTopicsCount);

//Mojo.Log.info("Logged in: ", appSettings.Tapatalk.loggedIn);
	if (appSettings.Tapatalk.loggedIn) {
		var newItems = formatMainCommandMenus();
		Mojo.Log.info(Object.toJSON(newItems));
		this.commandMenuModel.items =  newItems.items;
		this.controller.modelChanged(this.commandMenuModel);
		newMenuItems = formatMainAppMenus();
		this.appMenuModel.items = newMenuItems.items;
		//Mojo.Log.info(Object.toJSON(this.appMenuModel.items));
		this.controller.modelChanged(this.appMenuModel);
	}


};


RecentPostsAssistant.prototype.aboutToActivate = function () {
	this.setWaitingFeedback(false);
	//$$('body')[0].addClassName('dark-backdrop');

	try {
		if (!this.firstLoad) {
			//mcw experiment with disabling auto-refresh on scene activation.  Might mess up initial load if recent is default view
			//this.refreshScene();
			Mojo.Log.info("About to activate recent posts scene.");
		}
	this.firstLoad = false;

	} catch (e) {
		Mojo.Log.error("recentPosts aboutToActivate ERROR", e);
	}

};

RecentPostsAssistant.prototype.activate = function(event) {
//appSettings.asyncModules.checkSync();
	//Mojo.Log.info("preguntando mensajes");
	if (appSettings.Tapatalk.loggedIn) {
		appSettings.Tapatalk.privateMessage.get_inbox_stat(this.controller.stageController.assistant.gotMessagesCount.bind(this));
	}

		this.controller.get('search-field').addEventListener(Mojo.Event.propertyChange, this._searchKey);
		this._searchModel.value = '';
		this.controller.modelChanged(this._searchModel);
		//this.controller.get('search-button').style.visibility = 'hidden'; // Because changing the model doesnt fire any propertyChange events
		this.controller.get('search-button').addClassName('disabled');
		this.controller.document.addEventListener(Mojo.Event.tap, this._focusSearch);
		//logJSON(JSON.stringify(Mojo.Environment.DeviceInfo,null,2));
		if (Mojo.Environment.DeviceInfo.keyboardAvailable) {
			//Mojo.Log.error("Found physical keyboard");
			this.controller.get('search-field').mojo.focus();
		}

		//metatap support
		this.controller.listen(this.controller.document, Mojo.Event.keydown, this.metaTapHandler, true);
		this.controller.listen(this.controller.document, Mojo.Event.keyup, this.metaTapReleaseHandler, true);

};


RecentPostsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
		this.controller.get('search-field').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
		this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);

		//$$('body')[0].removeClassName('dark-backdrop');

		//metatap support
		this.controller.stopListening(this.controller.document, Mojo.Event.keydown, this.metaTapHandler, true);
		this.controller.stopListening(this.controller.document, Mojo.Event.keyup, this.metaTapReleaseHandler, true);

};

RecentPostsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
		if(this.requestFeedbackTimeout) {
			this.controller.window.clearTimeout(this.requestFeedbackTimeout);
			this.requestFeedbackTimeout = null;
		}
	this.controller.stopListening('topicList', Mojo.Event.listTap, this.topicListTapHandler);
	this.controller.stopListening(this.controller.get("header_button"), Mojo.Event.tap, this.forumMenuTapHandler);
	this.controller.stopListening(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);

	this.controller.stopListening(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);

	this.controller.stopListening('topicList', Mojo.Event.hold, this.topicListOnHoldHandler.bind(this));
	this.controller.stopListening('topicList', Mojo.Event.holdEnd, this.topicListOnHoldEndHandler.bind(this));

};

RecentPostsAssistant.prototype.doForumClose = function() {
	Mojo.Log.info("doForumClose() called.");
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

RecentPostsAssistant.prototype.handleCommand = function(event) {

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
		} catch (e) {
			Mojo.Log.error("handleCommand: ", e);
		}
};

RecentPostsAssistant.prototype.setupWaitingFeedback = function() {
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

RecentPostsAssistant.prototype.setWaitingFeedback = function(activate) {
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

RecentPostsAssistant.prototype.forumMenuTap = function(event) {

	try {
		var place = event.target.id;
		event.stopPropagation();

		var subMenuItems = [];

		subMenuItems.push(MenuData.PopupMenu.ViewAll);
		subMenuItems.push(MenuData.PopupMenu.ViewUnread);
		subMenuItems.push({});
		subMenuItems.push(MenuData.PopupMenu.MarkAllAsRead);

		if (this.mode == "recent") {
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

RecentPostsAssistant.prototype.forumMenuPopupHandler = function(choice) {
	try {

		switch (choice) {
			case 'viewAll':
				this.controller.getSceneScroller().mojo.revealTop();
				this.controller.getSceneScroller().mojo.adjustBy(0, 50);
				this.controller.get("header_button").innerHTML = MenuData.PopupMenu.ViewAll.label;
				this.mode = "recent";
				this.controller.get("topicList").mojo.setLengthAndInvalidate(appSettings.config.newTopicsCount);
				break;
			case 'viewUnread':
				this.controller.getSceneScroller().mojo.revealTop();
				this.controller.getSceneScroller().mojo.adjustBy(0, 50);
				this.controller.get("header_button").innerHTML = MenuData.PopupMenu.ViewUnread.label;
				this.mode = "unread";
				this.controller.get("topicList").mojo.setLengthAndInvalidate(appSettings.config.newTopicsCount);
				break;
			case MenuData.PopupMenu.MarkAllAsRead.command:
				var that = this;
				appSettings.Tapatalk.forum.mark_all_as_read(function(result) {
					Mojo.Controller.getAppController().showBanner($L("All forums marked as read"), {}, {});
					that.controller.get('topicList').mojo.setLengthAndInvalidate(that.recentNumber);
				});
				break;
		}
		this.controller.getSceneScroller().mojo.revealTop();
	} catch (e) {
		Mojo.Log.error("RecentPosts forumMenuPopupHandler: ", e);
	}

};

RecentPostsAssistant.prototype.listTap = function(event) {
	var item = event.item;
	var index = event.index;


	this.controller.stageController.pushScene("RecentPosts", this.parentForum.child[index]);

};

RecentPostsAssistant.prototype.topicListTap = function(event) {
	var item = event.item;
	var index = event.index;

if (!this.metaTapPressed && !this._onHold) {
	this.controller.stageController.pushScene({
		name: "topic",
		disableSceneScroller: true
	}, item);

} else if (this.metaTapPressed && !this._onHold) {
				//var currentSession = appSettings.Tapatalk.headers;
				//Mojo.Log.info("SESSION: ", appSettings.Tapatalk.headers);
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

RecentPostsAssistant.prototype.topicListOnHold = function(event) {

		//Mojo.Log.info(Object.toJSON(event));
		//Mojo.Log.info("onHold");
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

RecentPostsAssistant.prototype.holdPopupHandler = function(command){
	var item = Object.clone(this.currentEvent);

	//delete this.currentEvent;
	//this.currentEvent = undefined;
	if (this.currentEvent) {
		//Mojo.Log.info("HAY CURRENT EVENT");
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
	 */
				//Mojo.Log.info(currentURI);
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
		//Mojo.Log.info("NO HAY CURRENT EVENT");
	}
};

RecentPostsAssistant.prototype.topicListOnHoldEnd = function(event) {
		if (this.currentElement === event.srcElement.up(".palm-row")) {
			this._onHold = true;
		} else {
			this._onHold = false;
		}
		//Mojo.Log.info("ONHOLD: ", this._onHold);
	};

RecentPostsAssistant.prototype.metaTap = function(event){
	Mojo.Log.info("Key pressed;  meta:", (event.originalEvent.metaKey === true), " - ", event.originalEvent.keyCode);
	if (event.originalEvent.metaKey === true) {
		//Mojo.Log.info("METATAP PRESSED");
		this.metaTapPressed = true;

		if (event.originalEvent.keyCode == 84) {
			this.controller.getSceneScroller().mojo.scrollTo(0, 0, true);
			//Another possible method:
			//this.controller.get('topicList').mojo.revealItem(0, false);
		}

		if (event.originalEvent.keyCode == 66) {
			//Mojo.Log.info("Scroller size: " + Object.toJSON(this.controller.getSceneScroller().mojo.scrollerSize()));
			//Mojo.Log.info("Scroller height: " + this.controller.getSceneScroller().mojo.scrollerSize().height);
			//Mojo.Log.info("Scroller position: " + Object.toJSON(this.controller.getSceneScroller().mojo.getScrollPosition()));
			this.controller.getSceneScroller().mojo.revealBottom();
			//this.controller.getSceneScroller().mojo.scrollTo(200, 200, true);

			/*
			var lengthList;
			lengthList = this.controller.get('topicList').mojo.getLength();

			//Mojo.Log.info("topicList length: " + this.controller.get('topicList').mojo.length);
			Mojo.Log.info("topicList length: " + this.controller.get('topicList').mojo.getLength());
			//Mojo.Log.info("topicList length: " + JSON.stringify(this.controller.get('topicList').mojo));
			this.controller.get('topicList').mojo.revealItem(lengthList, true);
			*/

		}
		//Key pressed;  meta: true  -  66 (B)
		//Key pressed;  meta: true  -  84 (T)

	}
};

RecentPostsAssistant.prototype.metaTapRelease = function(event){
	//Mojo.Log.info("Key released;  meta:", (event.originalEvent.metaKey === true), " - ", event.originalEvent.keyCode);
	if (event.originalEvent.metaKey === true) {
		//Mojo.Log.info("METATAP RELEASED");
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
			this.controller.getSceneScroller().mojo.revealBottom();
			//this.controller.getSceneScroller().mojo.scrollTo(200, 200, true);

			/*
			var lengthList;
			lengthList = this.controller.get('topicList').mojo.getLength();

			//Mojo.Log.info("topicList length: " + this.controller.get('topicList').mojo.length);
			Mojo.Log.info("topicList length: " + this.controller.get('topicList').mojo.getLength());
			//Mojo.Log.info("topicList length: " + JSON.stringify(this.controller.get('topicList').mojo));
			this.controller.get('topicList').mojo.revealItem(lengthList, true);
			*/

		}
	}
};

RecentPostsAssistant.prototype.getTopics = function(listWidget,postsOffset,postsLimit) {
	//mcw subtract 1, or we will not see one post, as we will get one too many topics for the list to hold
	var last_number = (postsOffset + postsLimit) - 1;
	var that = this;

	//this.scrim.show();
	this.controller.get('topicCounter').addClassName('hidden');

	Mojo.Log.warn("Requesting recent topics, mode: " + this.mode + ", postsLimit: " + postsLimit);
	Mojo.Log.warn("postsOffset: " + postsOffset + ", postsLimit: " + postsLimit);
  	if(!this.requestFeedbackTimeout) this.setWaitingFeedback(true);

		try {

			if (this.mode == "recent") {
				appSettings.Tapatalk.topic.get_new_topic(postsOffset, last_number, this.gotTopics.curry(listWidget, postsOffset, postsLimit).bind(this));
			}
			else {
				appSettings.Tapatalk.topic.get_unread_topic(postsOffset, last_number, this.gotTopics.curry(listWidget, postsOffset, postsLimit).bind(this));
			}
		}
		catch (e) {
			Mojo.Log.error("getTopics ERROR: ", e);
		}



};

RecentPostsAssistant.prototype.gotTopics = function(listWidget, postsOffset, postsLimit, response) {

	try {

		//if (!response.error || (response.result && !response.result == false))
		// && (!response.result && !response.result == false)
		if (response.topics)
		{
			if (this.mode == "recent") {
				//Mojo.Log.warn("gotTopics asked for " + appSettings.config.newTopicsCount + " recent topics.");
				Mojo.Log.warn("gotTopics asked for " + postsLimit + " recent topics.");
				Mojo.Log.warn("gotTopics total recent topics: " + response.total_topic_num);
				try {
					if (response.topics) {
						Mojo.Log.warn("gotTopics response items received:" + response.topics.length );
						for (ii=0;ii<response.topics.length;ii++) {
							//Full dump
							//Mojo.Log.info("item " + ii + ": " + JSON.stringify(response.topics[ii]) );
							if (appSettings.debug.dumpRecentTopicList) {
							Mojo.Log.info("items[" + ii + "]: " + response.topics[ii].topic_id + ", " + response.topics[ii].topic_title );
							}
						}
					}
					else {
						Mojo.Log.warn("gotTopics did not receive topics, response: " + JSON.stringify(response) );
					}
				} catch (ex) {
					Mojo.Log.error("Unable to log response", ex);
					//Mojo.Log.warn("Unable to log response: " + ex);
				}
				Mojo.Log.warn("gotTopics telling list to notice updated items.");
				Mojo.Log.warn("gotTopics current list length: " + listWidget.mojo.getLength());
				//orig line	listWidget.mojo.noticeUpdatedItems(postsOffset, response);
				listWidget.mojo.noticeUpdatedItems(postsOffset, response.topics);
				//mcwtest
				//set list length to total recent count, will request more as needed. Testing shows it requests 5 at a time as you scroll near the end of the list
				//listWidget.mojo.setLength(response.total_topic_num);
				//set list length to actual number returned (added before I realized it was requesting more than it should, so it was not displaying them all)
				listWidget.mojo.setLength(response.topics.length);
				//orig
				//listWidget.mojo.setLength(appSettings.config.newTopicsCount);
				this.controller.get('topicCounter').addClassName('hidden');
				Mojo.Log.warn("gotTopics done.");
			}
			else {

				Mojo.Log.warn("gotTopics received " + response.total_unread_num + " unread topics.");
				try {
					if (response.topics) {
						Mojo.Log.warn("gotTopics response items:" + response.topics.length );
						if (appSettings.debug.dumpRecentTopicList) {
						for (ii=0;ii<response.topics.length;ii++) {
							//Mojo.Log.warn("item" + ii + ": " + JSON.stringify(response.topics[ii]) );
							Mojo.Log.info("items[" + ii + "]: " + response.topics[ii].topic_id + ", " + response.topics[ii].topic_title );
						}
						}
					}
					else {
						Mojo.Log.warn("gotTopics unable to get unread topics: unread response " + JSON.stringify(response) );
					}
				} catch (ex) { Mojo.Log.warn("Unable to log response." + ex); }
				listWidget.mojo.noticeUpdatedItems(postsOffset, response.topics);
				if (response.total_topic_num != this.total_unread_num && this.total_unread_num != 0) {
					listWidget.mojo.setLengthAndInvalidate(response.total_topic_num);
				}
				else {
					listWidget.mojo.setLength(response.total_topic_num);
				}
				this.total_unread_num = response.total_topic_num;

				if (this.total_unread_num != "0") {
					this.controller.get("forum_count").innerHTML = this.total_unread_num;
					this.controller.get('topicCounter').removeClassName('hidden');
				}
				else {
					this.controller.get("forum_count").innerHTML = "0";
					this.controller.get('topicCounter').addClassName('hidden');
				}
				this.controller.getSceneScroller().mojo.scrollTo(0, 0, false);

			}
			this.setWaitingFeedback(false);
		}
		else if (response.result != undefined && response.result == false) {
			Mojo.Log.warn("gotTopics response result was false, result_text: " + response.result_text);
		}
		else {
			Mojo.Log.warn("gotTopics unable to get topics. response " + JSON.stringify(response) );
			Mojo.Log.warn("gotTopics response contains error: " + response.error);
			if (response.error == "reauthenticate") {
				var that = this;
				var retries = 0;
				var timer = that.controller.window.setInterval(function(){
					if (!appSettings.Tapatalk.connection.reauthenticate) {
						//Mojo.Log.info("waiting...");
						//retries = retries + 1;
						//if (appSettings.Tapatalk.loggedIn && retries == 2) {
							//Mojo.Log.info("Tired of waiting, calling authenticate...");
							clearInterval(timer);
							appSettings.Tapatalk.authenticate(function(result) {
								that.getTopics(listWidget, postsOffset, postsLimit);
							});
						//}
					}
				}, 2000);
			}
		}

	}
	catch (e) {
		Mojo.Log.error("Error in gotTopics: ", e);
	}
};

RecentPostsAssistant.prototype.topicDivider = function(model){
	//return model.topic_id;
	return model.niceDate;
};

RecentPostsAssistant.prototype.headerTap = function(event){

	this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
};
RecentPostsAssistant.prototype.searchBarAnimationDone = function(){
	this.searchBarState = !this.searchBarState;
};

RecentPostsAssistant.prototype.animateSearchPanel = function(panel, reverse, callback){

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

RecentPostsAssistant.prototype._searchKey = function(event)
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
RecentPostsAssistant.prototype._focusSearch = function(event)
	{
		this.controller = Mojo.Controller.stageController.activeScene();
		this.controller.get('search-field').mojo.focus.defer();
	};

RecentPostsAssistant.prototype.searchButtonPush = function(event) {
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

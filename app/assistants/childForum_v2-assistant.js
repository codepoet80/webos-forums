function ChildForumAssistant(args){
	/* this is the creator function for your scene assistant object. It will be passed all the
	 additional parameters (after the scene name) that were passed to pushScene. The reference
	 to the scene controller (this.controller) has not be established yet, so any initialization
	 that needs the scene controller should be done in the setup function below. */
	this.parentForum = args;

	if (args.forum_id) {
		if (!this.parentForum.child) {
			this.parentForum.child = [];
		}
	}
	else {
		var len = args.length;
		this.parentForum = getForumObject(appSettings.Tapatalk.forum.forums, args);
		if (!this.parentForum.child) {
			this.parentForum.child = [];
		}
	}
	this.listTapHandler = this.listTap.bindAsEventListener(this);
	this.topicListTapHandler = this.topicListTap.bindAsEventListener(this);
	this.topicListOnHoldHandler = this.topicListOnHold.bindAsEventListener(this);
	this.topicListOnHoldEndHandler = this.topicListOnHoldEnd.bindAsEventListener(this);
	this.forumMenuTapHandler = this.forumMenuTap.bindAsEventListener(this);

	this.searchButtonPushHandler = this.searchButtonPush.bindAsEventListener(this);

	this.total_topic_num = 20;
	this.total_announcements_num = 0;
	this.total_stickies_num = 0;
	this.firstLoad = true;
	this.topicList = {};
	this.topicList.items = [];

	this.stickList = {};
	this.stickList.items = [];
	this.annList = {};
	this.annList.items = [];

	this.currentView = "showPosts";

	this._searchKey = this._searchKey.bindAsEventListener(this);
	this._focusSearch = this._focusSearch.bindAsEventListener(this);
	this.searchBarState = false;
	this.headerTapHandler = this.headerTap.bindAsEventListener(this);

	this.metaTapPressed = false;
	this._onHold = false;
	this.metaTapHandler = this.metaTap.bindAsEventListener(this);
	this.metaTapReleaseHandler = this.metaTapRelease.bindAsEventListener(this);
};

ChildForumAssistant.prototype.setup = function(){
	/* this function is for setup tasks that have to happen when the scene is first created */

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */

	/* setup widgets here */

	/* add event handlers to listen to events from widgets */
	this.setupWaitingFeedback();

	this.childStructure = Object.clone(this.parentForum);
	this.childStructure.child = [];
	for (x = 0; x < this.parentForum.child.length; x++) {
		//Mojo.Log.info(Object.toJSON(this.parentForum.child[x]));
		if (!this.parentForum.child[x].sub_only) {
			this.childStructure.child.push(this.parentForum.child[x]);

		}
		else {
			for (i = 0; i < this.parentForum.child[x].child.length; i++) {
				this.parentForum.child[x].child[i].category = this.parentForum.child[x].forum_name;
				this.childStructure.child.push(this.parentForum.child[x].child[i]);
			}
		}
	}


	this.controller.get("scrim-minimized").hide();
	this.controller.get("forum-image-small").src = appSettings.currentForum.logo;

	this.appMenuModel = formatMainAppMenus(false);
	Mojo.Log.info("this.appMenuModel.items[1]=" + Object.toJSON(this.appMenuModel.items[1]));
	if (this.appMenuModel.items[1] == MenuData.ApplicationMenu.Logout) {
		this.appMenuModel.items.splice(1, 1);
		this.controller.modelChanged(this.appMenuModel);
	}
	Mojo.Log.info("this.appMenuModel.items[1]=" + Object.toJSON(this.appMenuModel.items[1]));

	this.controller.setupWidget(Mojo.Menu.appMenu, {
		omitDefaultItems: true
	}, this.appMenuModel);



	this.controller.get("header_button").innerHTML = this.childStructure.forum_name;
	this.controller.get("forum_name").innerHTML = appSettings.currentForum.name;

	this.topicListAttrs = {
		listTemplate: 'forums/forumContainer',
		itemTemplate: 'childForum/topicItem',
		dividerFunction: this.topicDivider,
		dividerTemplate: 'childForum/topicDivider',
		lookahead: 10,
		renderLimit: 15,
		uniquenessProperty: 'topic_id',
		itemsCallback: this.getTopics.bind(this),
		hasNoWidgets: true,
		formatters: {
			last_reply_time: appSettings.Formatting.getNiceDate.bind(this),
			icon_url: appSettings.Formatting.formatTopicImage.bind(this),
			new_post: appSettings.Formatting.formatIfNewPosts.bind(this),
			is_subscribed: appSettings.Formatting.formatForumSubscribed.bind(this),
			is_closed: appSettings.Formatting.formatForumClosed.bind(this),
			topic_title: appSettings.Formatting.formatTopicTitle.bind(this),
			is_online: appSettings.Formatting.formatIsOnline.bind(this)
		}

	};

	this.controller.setupWidget('topicList', this.topicListAttrs, this.topicList);
	if (!this.childStructure.sub_only) {
		this.cmdMenuModel = {
			visible: true,
			items: [{
				iconPath: "images/menu-icon-new-thread.png",
				command: "addNewTopic",
				disabled: this.childStructure.sub_only
			}, {}, {
				items: [{
					iconPath: "images/menu-icon-conversation.png",
					command: "showPosts"
				}, {
					iconPath: "images/menu-icon-announcements.png",
					command: "showAnnounces"
				}, {
					iconPath: "images/menu-icon-stickies.png",
					command: "showStickies"

				}],
				toggleCmd: "showPosts"
			}]
		};

	}
	else {
		this.cmdMenuModel = {
			visible: true,
			items: [{
				iconPath: "images/menu-icon-new-thread.png",
				command: "addNewTopic",
				disabled: this.childStructure.sub_only
			}, {}, {}]
		};

	}
	this.controller.setupWidget(Mojo.Menu.commandMenu, {
		menuClass: 'fade-bottom'
	}, this.cmdMenuModel);

	this.forumListAttrs = {
		listTemplate: 'forums/forumContainer',
		itemTemplate: 'forums/forumItem',
		dividerFunction: this.forumDivider,
		dividerTemplate: 'forums/sectionDivider',
		lookahead: 15,
		renderLimit: 25,
		uniquenessProperty: 'forum_id',
		hasNoWidgets: true,
		itemsProperty: 'child',
		formatters: {
			logo_url: appSettings.Formatting.formatForumImage.bind(this),
			new_post: appSettings.Formatting.formatIfNewPosts.bind(this),
			is_subscribed: appSettings.Formatting.formatForumSubscribed.bind(this),
			is_closed: appSettings.Formatting.formatForumClosed.bind(this),
			url: appSettings.Formatting.formatIfUrlPlaceholder.bind(this)
		}

	};

	this.controller.setupWidget('forumList', this.forumListAttrs, this.childStructure);

	if (this.childStructure.sub_only) {
	}
	else {
		if (this.childStructure.child) {
			if (this.childStructure.child.length == 0) {
			}
			else {
			}
		}
	}

	this._searchModel = {
		value: ''
	};
	this.controller.setupWidget('search-field', {
		hintText: $L('Search...'),
		focus: false,
		enterSubmits: true,
		multiline: false,
		modifierState: Mojo.Widget.sentenceCase,
		focusMode: Mojo.Widget.focusInsertMode,
		requiresEnterKey: true,
		changeOnKeyPress: true
	}, this._searchModel);
	this.searchBar = this.controller.get("search-bar");

	this.controller.listen('topicList', Mojo.Event.listTap, this.topicListTapHandler);
	this.controller.listen('topicList', Mojo.Event.hold, this.topicListOnHoldHandler.bind(this));
	this.controller.listen('topicList', Mojo.Event.holdEnd, this.topicListOnHoldEndHandler.bind(this));
	this.controller.listen('forumList', Mojo.Event.listTap, this.listTapHandler);
	this.controller.listen(this.controller.get("header_button"), Mojo.Event.tap, this.forumMenuTapHandler);
	this.controller.listen(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);
};


ChildForumAssistant.prototype.refreshScene = function(){
	//Mojo.Log.info("refrescando...");
	this.controller.get('topicList').mojo.setLengthAndInvalidate(this.total_topic_num);
	if (appSettings.Tapatalk.loggedIn) {
		var newMenuItems = formatMainAppMenus(false);
		if (this.appMenuModel.items[1] == MenuData.ApplicationMenu.Logout) {
			this.appMenuModel.items.splice(1, 1);
			this.controller.modelChanged(this.appMenuModel);
		}
		this.appMenuModel.items = newMenuItems.items;
		this.controller.modelChanged(this.appMenuModel);
	}
};

ChildForumAssistant.prototype.aboutToActivate = function(){
	//this.setWaitingFeedback(false);
	$$('body')[0].addClassName('dark-backdrop');
	//Mojo.Log.info("Refrescando... aboutToActivate; firstLoad: ", this.firstLoad);
	try {
		if (!this.firstLoad) {
			this.refreshScene();
		}
		this.firstLoad = false;

	}
	catch (e) {
		Mojo.Log.error("ChildForumAssistant aboutToActivate ERROR", e);
	}
};

ChildForumAssistant.prototype.activate = function(event){

	if (!this.childStructure.sub_only) {


		if (!!this.total_topic_num) {
			this.controller.get("forum_count").innerHTML = this.total_topic_num;

		}
	}
	else {

	}
	if (appSettings.Tapatalk.loggedIn) {
		appSettings.Tapatalk.privateMessage.get_inbox_stat(this.controller.stageController.assistant.gotMessagesCount.bind(this));
	}

	this.metaTapPressed = false;

	this.controller.get('search-field').addEventListener(Mojo.Event.propertyChange, this._searchKey);
	this._searchModel.value = '';
	this.controller.modelChanged(this._searchModel);
	this.controller.get('search-button').addClassName('disabled');
	this.controller.document.addEventListener(Mojo.Event.tap, this._focusSearch);
	if (Mojo.Environment.DeviceInfo.keyboardAvailable) {
		this.controller.get('search-field').mojo.focus();
	}

	this.controller.listen(this.controller.document, Mojo.Event.keydown, this.metaTapHandler);
	this.controller.listen(this.controller.document, Mojo.Event.keyup, this.metaTapReleaseHandler);

};


ChildForumAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
		this.controller.get('search-field').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
		this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);

		//metatap support
		this.controller.stopListening(this.controller.document, Mojo.Event.keydown, this.metaTapHandler);
		this.controller.stopListening(this.controller.document, Mojo.Event.keyup, this.metaTapReleaseHandler);
};

ChildForumAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
		if(this.requestFeedbackTimeout) {
			this.controller.window.clearTimeout(this.requestFeedbackTimeout);
			this.requestFeedbackTimeout = null;
		}
	this.controller.stopListening('topicList', Mojo.Event.listTap, this.topicListTapHandler);
	this.controller.stopListening('topicList', Mojo.Event.hold, this.topicListOnHoldHandler.bind(this));
	this.controller.stopListening('topicList', Mojo.Event.holdEnd, this.topicListOnHoldEndHandler.bind(this));
	this.controller.stopListening('forumList', Mojo.Event.listTap, this.listTapHandler);
	this.controller.stopListening(this.controller.get("header_button"), Mojo.Event.tap, this.forumMenuTapHandler);
	this.controller.stopListening(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);
	this.controller.stopListening(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);


};

ChildForumAssistant.prototype.handleCommand = function(event) {

		if(event.type == Mojo.Event.commandEnable && (event.command == Mojo.Menu.helpCmd || event.command == Mojo.Menu.prefsCmd)) {
			event.stopPropagation();
		}

		try {

			if (event.type == Mojo.Event.command) {
				switch (event.command) {
					case Mojo.Menu.helpCmd:
						break;
					case 'addNewTopic':
						var args = {
							topicMode: true,
							newTopic: true,
							forum_id: this.childStructure.forum_id
						};
						this.controller.stageController.pushScene("newPost", args);
						break;
					case 'showStickies':
					case 'showPosts':
					case 'showAnnounces':
						this.runChange = true;
						this.formatScene(event.command);
						break;
				}
			}

		} catch (e) {
			Mojo.Log.error("handleCommand ERROR: ", e);
		}
};

ChildForumAssistant.prototype.metaTap = function(event){
	if (event.originalEvent.metaKey === true) {
		this.metaTapPressed = true;
	};
};

ChildForumAssistant.prototype.metaTapRelease = function(event){
	if (event.originalEvent.metaKey === true) {
		this.metaTapPressed = false;
	};
};

ChildForumAssistant.prototype.setupWaitingFeedback = function() {
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
		Mojo.Log.error("setupWaitingFeedback ERROR: ", e);
	}


};

ChildForumAssistant.prototype.setWaitingFeedback = function(activate) {
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

ChildForumAssistant.prototype.formatScene = function(state) {
	try {
		this.currentView = state;
		this.controller.get("topics").hide();
		switch(state) {
			case 'showPosts':
				this.controller.get("forums").removeClassName("hidden");
				break;
			case 'showAnnounces':
				this.controller.get("forums").addClassName("hidden");
				break;
			case 'showStickies':
				this.controller.get("forums").addClassName("hidden");
				break;
		}
			this.scrim.show();
			//this.controller.getSceneScroller().mojo.revealTop();
			this.controller.get("topicList").mojo.setLengthAndInvalidate(10);

	} catch (e) {
		Mojo.Log.error("formatScene ERROR: ", e);
	}

};

ChildForumAssistant.prototype.forumMenuTap = function(event) {

	try {
		var place = event.target.id;
		event.stopPropagation();
		var subMenuItems = [];

			//subMenuItems.push(MenuData.PopupMenu.separators.forumActions);
			if (this.childStructure.can_subscribe) {
				if (this.childStructure.is_subscribed) {
					subMenuItems.push(MenuData.PopupMenu.UnsubscribeForum);
				}
				else {
					subMenuItems.push(MenuData.PopupMenu.SubscribeForum);
				}

			}
			if (appSettings.Tapatalk.config.enableCopy) {
				subMenuItems.push(MenuData.PopupMenu.CopyForumURL);
/*
				if (appSettings.config.twitter.authorized) {
					this.popupMenuModel.items.push({});
					this.popupMenuModel.items.push(MenuData.PopupMenu.TweetThis);
				}

*/			}

			if(subMenuItems.length >0) subMenuItems.push({});

			//subMenuItems.push({});
			//subMenuItems.push(MenuData.PopupMenu.CopyForumURL);


		//subMenuItems.push(MenuData.PopupMenu.separators.options);
		//subMenuItems.push({});
		//Mojo.Log.info("MARK AS READ ", appSettings.Tapatalk.config.mark_read);
		if (appSettings.Tapatalk.config.mark_read) {
			subMenuItems.push(MenuData.PopupMenu.MarkAsRead);
		}
		subMenuItems.push(MenuData.PopupMenu.MarkAllAsRead);

		this.popupMenuModel = {
			onChoose: this.forumMenuPopupHandler.bind(this),
			manualPlacement: true,
			popupClass: "forum-menu-popup",
			items: subMenuItems
		};

		this.controller.popupSubmenu(this.popupMenuModel);
	} catch (e) {
		Mojo.Log.error("ChildForumAssistant_v2.forumMenuTap ERROR: ", e);
		logJSON("Stack: " + e.stack);
	}
};

ChildForumAssistant.prototype.forumMenuPopupHandler = function(choice){
	try {
		switch (choice) {
			case 'subscribeForum':
				var that = this;
				appSettings.Tapatalk.subscription.subscribe_forum(this.childStructure.forum_id, function(response){
					//Mojo.Log.info(Object.toJSON(response));
					if (response.result == true) {
						that.childStructure.is_subscribed = true;
						that.controller.get('subsbribedFlag').removeClassName("hidden");
					}
				});
				break;
			case 'unsubscribeForum':
				var that = this;
				appSettings.Tapatalk.subscription.unsubscribe_forum(this.childStructure.forum_id, function(response){
					if (response.result == true) {
						that.childStructure.is_subscribed = false;
						that.controller.get('subsbribedFlag').addClassName("hidden");
					}
				});
				break;
/*
			case MenuData.PopupMenu.CopyForumURL.command:
				var currentURI = generateURI(this.parentForum.forum_id, 0, 0);
				break;

*/			case MenuData.PopupMenu.MarkAsRead.command:
				var that = this;
				appSettings.Tapatalk.forum.mark_as_read(this.parentForum.forum_id, function(result){
					Mojo.Controller.getAppController().showBanner(that.parentForum.forum_name + $L(" marked as read"), {}, {});
					that.controller.get('topicList').mojo.setLengthAndInvalidate(that.total_topic_num);
				});
				break;
			case MenuData.PopupMenu.MarkAllAsRead.command:
				var that = this;
				appSettings.Tapatalk.forum.mark_all_as_read(function(result){
					Mojo.Controller.getAppController().showBanner($L("All forums marked as read"), {}, {});
					that.controller.get('topicList').mojo.setLengthAndInvalidate(that.total_topic_num);
				});
				break;
			case MenuData.PopupMenu.CopyForumURL.command:
				var currentURI = generateURI(this.parentForum.forum_id, 0, 0, true);
				//Mojo.Log.info(currentURI);
				this.controller.stageController.setClipboard(currentURI, true);
				Mojo.Controller.getAppController().showBanner($L("URL Copied to Clipboard"), {}, {});
				break;

		}
	}
	catch (e) {
		Mojo.Log.error("childForum forumMenuPopupHandler ERROR: ", e);
	}

};

ChildForumAssistant.prototype.listTap = function(event) {
	var item = event.item;
	var index = event.index;

	if (!this.childStructure.child[index].url) {
		this.controller.stageController.pushScene("childForum", this.childStructure.child[index]);
	} else {
			handleUrl(this.childStructure.child[index].url);

	}

};


ChildForumAssistant.prototype.topicListTap = function(event) {
	var item = event.item;
	var index = event.index;
	//Mojo.Log.info("> > > > TOPIC: ", Object.toJSON(item));
if (!this.metaTapPressed && !this._onHold) {
	this.controller.stageController.pushScene({
		name: "topic",
		disableSceneScroller: true
	}, item);

}
else
	if (this.metaTapPressed && !this._onHold) {

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
	}
	else {

		if (!this.currentEvent) {
			this.currentEvent = item;
		}
		this._onHold = false;
	}

};

ChildForumAssistant.prototype.topicListOnHold = function(event){

	var target = event.target;
	this.currentElement = event.srcElement.up(".palm-row");
	this._onHold = true;
	var currentEvent = {};
	var listElement = this.controller.get("topicList");
	var rows = listElement.select(".palm-row");
	var modelIndex = rows.indexOf(this.currentElement);

	var dragElem = event.target.up("div.palm-row");

	this.popupMenuModel = {
		onChoose: this.holdPopupHandler,
		placeNear: dragElem,
		items: [MenuData.PopupMenu.OpenTopic, MenuData.PopupMenu.OpenTopicNewCard]
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

ChildForumAssistant.prototype.holdPopupHandler = function(command){
	var item = Object.clone(this.currentEvent);

	if (this.currentEvent) {
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

*/				//Mojo.Log.info(currentURI);
				this.controller.stageController.setClipboard(currentURI, true);
				Mojo.Controller.getAppController().showBanner($L("URL Copied to Clipboard"), {}, {});
				break;
			case MenuData.PopupMenu.TweetThis.command:
				var currentURI = generateURI(this.currentEvent.forum_id, this.currentEvent.topic_id, 0, true);
//				appSettings.Bitly.shorten(currentURI, function(response){}, function(response){});
/*
				Bitly.shorten(currentURI);var siteRoot = appSettings.currentForum.url.replace(/\057$/i, "");
				var fullURL = siteRoot + "/" + currentURI;

				//Mojo.Log.info(currentURI);
				this.controller.stageController.setClipboard(currentURI, true);
				Mojo.Controller.getAppController().showBanner($L("URL Copied to Clipboard"), {}, {});
*/
	var arguments = {
		tweet: this.currentEvent.topic_title,
		url: currentURI
	}
		this.controller.showDialog({
			template: 'tweetDialog/tweetDialog-scene',
			assistant: new TweetDialogAssistant(this, function(response){
				//Mojo.Log.info(Object.toJSON(response));
/*
				if (response == true) {
					this.controller.stageController.pushScene("childForum", appSettings.Tapatalk.forum.forums[item]);
				}
				else {

				}
*/
			}
.bind(this), arguments)			,
			preventCancel: false
		});

				break;


		}
		delete this.currentEvent;
	}
	else {
		Mojo.Log.warn("ChildForumAssistant.holdPopupHandler: No current event.");
	}
};

ChildForumAssistant.prototype.topicListOnHoldEnd = function(event){
	if (this.currentElement === event.srcElement.up(".palm-row")) {
		this._onHold = true;
	}
	else {
		this._onHold = false;
	}
};


ChildForumAssistant.prototype.getTopics = function(listWidget,postsOffset,postsLimit) {
	var last_number = postsOffset + postsLimit;
	var that = this;

  	if ((this.currentView != "showAnnounces") & (this.currentView !="showStickies")) {
		//Mojo.Log.info("HAY FEEDBACK: ", this.currentView);
		if (listWidget.mojo.getLength == 0) {
			this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 5000);
		}
		}
	var topicTag = "";

		switch(this.currentView) {
			case 'showPosts':
				topicTag = "";
				break;
			case 'showAnnounces':
				topicTag = "ANN";
				break;
			case 'showStickies':
				topicTag = "TOP";
				break;
			this.controller.getSceneScroller().mojo.revealTop();

		}


	appSettings.Tapatalk.topic.get_topic(this.childStructure.forum_id,postsOffset,last_number ,topicTag, this.gotTopics.curry(listWidget, postsOffset, postsLimit).bind(this));

};

/*
ChildForumAssistant.prototype.getStickies = function(listWidget,postsOffset,postsLimit) {
	var last_number = postsOffset + postsLimit;
	var that = this;

  	//this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);

	appSettings.Tapatalk.topic.get_topic(this.childStructure.forum_id,postsOffset,last_number ,"TOP", function(response){
		try {
			if (response.total_topic_num == 0) {
				listWidget.mojo.noticeUpdatedItems(postsOffset, []);

			}
			else {
				listWidget.mojo.noticeUpdatedItems(postsOffset, response.topics);

			}

			if (response.total_topic_num != that.total_stickies_num) {
				listWidget.mojo.setLengthAndInvalidate(response.total_topic_num);
			}
			that.total_stickies_num = response.total_topic_num;

		} catch (e) {
			Mojo.Log.error ("getStickies ERROR: ",e);
		}

	});

};

ChildForumAssistant.prototype.getAnnouncements = function(listWidget,postsOffset,postsLimit) {
	var last_number = postsOffset + postsLimit;
	var that = this;

  	//this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);

	appSettings.Tapatalk.topic.get_topic(this.childStructure.forum_id,postsOffset,last_number ,"ANN", function(response){
		try {
			if (response.total_topic_num == 0) {
				listWidget.mojo.noticeUpdatedItems(postsOffset, []);
			}
			else {
				listWidget.mojo.noticeUpdatedItems(postsOffset, response.topics);
			}

			if (response.total_topic_num != that.total_announcements_num) {
				listWidget.mojo.setLengthAndInvalidate(response.total_topic_num);
			}
			that.total_announcements_num = response.total_topic_num;

		} catch (e) {
			Mojo.Log.error ("getAnnouncements ERROR: ",e);
		}

	});

};

*/
ChildForumAssistant.prototype.gotTopics = function(listWidget, postsOffset, postsLimit, response){
	try {

		//if (this.runChange) {

		if (this.total_topic_num == 0) {

			//var transition = this.controller.prepareTransition(Mojo.Transition.crossFade, false);
		}
		//}

		this.controller.window.clearTimeout(this.requestFeedbackTimeout);

		if (response.total_topic_num == 0) {
			//listWidget.mojo.noticeUpdatedItems(postsOffset, []);
			listWidget.mojo.setLengthAndInvalidate(response.total_topic_num);
		}
		else {
			if (response.total_topic_num == this.total_topic_num) {
				listWidget.mojo.noticeUpdatedItems(postsOffset, response.topics);
			} else {
				listWidget.mojo.setLengthAndInvalidate(response.total_topic_num);
			}
		}

/*
		if (response.total_topic_num != this.total_topic_num && this.total_topic_num != 0) {
			listWidget.mojo.setLengthAndInvalidate(response.total_topic_num);
			this.firstLoad = false;
		}
		else if(response.total_topic_num != this.total_topic_num){
			listWidget.mojo.setLength(response.total_topic_num);
		}

*/
		this.total_topic_num = response.total_topic_num;

/*
		//Applies proper scene formatting
		if(this.runChange) {
			this.runChange = false;
			transition.run();
		}

*/
		if (!!this.parentForum.sub_only) {
			if (response.can_post) {
				this.cmdMenuModel.items[0].disabled = true;
			}
			else {
				this.cmdMenuModel.items[0].disabled = true;
			}
		}
		else {
			if (appSettings.Tapatalk.loggedIn) {
				this.cmdMenuModel.items[0].disabled = !response.can_post;
			} else {
				this.cmdMenuModel.items[0].disabled = true;
			}
		}
		this.controller.modelChanged(this.cmdMenuModel);

		if (this.parentForum.is_subscribed) {
			this.controller.get('subsbribedFlag').removeClassName("hidden");
		}
		else {
			this.controller.get('subsbribedFlag').addClassName("hidden");
		}
		if (this.parentForum.is_closed) {
			this.controller.get('closedFlag').removeClass("hidden");
		}
		else {
			this.controller.get('closedFlag').addClassName("hidden");
		}
		if (this.total_topic_num != "0") {

			this.controller.get("forum_count").innerHTML = Math.ceil(this.total_topic_num);
			this.controller.get('topicCounter').removeClassName('hidden');
		}
		else {
			this.controller.get("forum_count").innerHTML = "0";
			this.controller.get('topicCounter').addClassName('hidden');
		}
		this.controller.get("topics").show();

		//this.requestFeedbackTimeout = null;
		this.setWaitingFeedback(false);
/*
		if (transition) {
			transition.run();
			//this.transition = undefined;
		}

*/
	}
	catch (e) {
		Mojo.Log.error("gotTopics ERROR: ", e);
	}

};

ChildForumAssistant.prototype.topicDivider = function(model){
	//return model.topic_id;
	return model.niceDate;

};

ChildForumAssistant.prototype.forumDivider = function(itemModel) {
		return itemModel.category;
};


ChildForumAssistant.prototype.headerTap = function(event){

	this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
};
ChildForumAssistant.prototype.searchBarAnimationDone = function(){
	this.searchBarState = !this.searchBarState;
};

ChildForumAssistant.prototype.animateSearchPanel = function(panel, reverse, callback){

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

ChildForumAssistant.prototype._searchKey = function(event)
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
ChildForumAssistant.prototype._focusSearch = function(event)
	{
		this.controller = Mojo.Controller.stageController.activeScene();
		this.controller.get('search-field').mojo.focus.defer();
	};

ChildForumAssistant.prototype.searchButtonPush = function(event){
	if (this._searchModel.value.length >= 3) {
		var args = {
			searchString: this._searchModel.value,
			hideCommandMenu: true

		}
		this.controller.stageController.pushScene("search", args);
	}
};


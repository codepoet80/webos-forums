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

}

SubscribedPostsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */

	/* setup widgets here */

	/* add event handlers to listen to events from widgets */

	appSettings.currentScene = "subscribedPosts";
	this.commandMenuModel = {
		visible: true,
		items: [{},{
			items:[],
			toggleCmd: "go-subscribed"
		},{}]
	}

if(appSettings.Tapatalk.config.disable_search && appSettings.Tapatalk.config.disable_search == "1") {
	MenuData.ApplicationMenu.Search.disabled = true;
	MenuData.CommandMenu.Search.disabled = true;
} else {
	MenuData.ApplicationMenu.Search.disabled = false;
	MenuData.CommandMenu.Search.disabled = false;
}

if(appSettings.Tapatalk.config.disable_lastest && appSettings.Tapatalk.config.disable_lastest == "1") {
	MenuData.ApplicationMenu.Lastest.disabled = true;
	MenuData.CommandMenu.Recent.disabled = true;
} else {
	MenuData.ApplicationMenu.Lastest.disabled = false;
	MenuData.CommandMenu.Recent.disabled = false;
}

	if (appSettings.Tapatalk.loggedIn || !appSettings.Tapatalk.config.api_level) {
		this.appMenuModel = {
		visible: true,
		items: [
			{
				label: $L("Forum"),
				disabled: true,
				items: [MenuData.ApplicationMenu.AddToLauncher, //MenuData.ApplicationMenu.ShareForum
				MenuData.ApplicationMenu.Search,
				MenuData.ApplicationMenu.Lastest,
				MenuData.ApplicationMenu.Subscribed,
				MenuData.ApplicationMenu.ForumTree,
				MenuData.ApplicationMenu.PrivateMessages
				]
			},
			MenuData.ApplicationMenu.GoBack, 	//Added by Jonathan Wise 11/14/2020
			MenuData.ApplicationMenu.NewCard,
			MenuData.ApplicationMenu.Preferences,
			MenuData.ApplicationMenu.Support,
			MenuData.ApplicationMenu.Help]
	};

		this.controller.setupWidget(Mojo.Menu.appMenu, {
			omitDefaultItems: true
		}, this.appMenuModel);
		this.commandMenuModel.items[1].items = [
			MenuData.CommandMenu.Recent,
			MenuData.CommandMenu.Subscribed,
			MenuData.CommandMenu.Tree,
			MenuData.CommandMenu.Messages,
			MenuData.CommandMenu.Search
		]
		this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'fade-bottom'},this.commandMenuModel);
	}
	else {
		this.appMenuModel = {
		visible: true,
		items: [
			{
				label: $L("Forum"),
				disabled: true,
				items: [MenuData.ApplicationMenu.AddToLauncher, //MenuData.ApplicationMenu.ShareForum
				MenuData.ApplicationMenu.Search,
				MenuData.ApplicationMenu.Lastest,
				MenuData.ApplicationMenu.Subscribed,
				MenuData.ApplicationMenu.ForumTree,
				MenuData.ApplicationMenu.PrivateMessages
				]
			},
			MenuData.ApplicationMenu.GoBack, 	//Added by Jonathan Wise 11/14/2020
			MenuData.ApplicationMenu.Login,
			MenuData.ApplicationMenu.NewCard,
			MenuData.ApplicationMenu.Preferences,
			MenuData.ApplicationMenu.Support,
			MenuData.ApplicationMenu.Help]
	};

		this.controller.setupWidget(Mojo.Menu.appMenu, {
			omitDefaultItems: true
		}, this.appMenuModel);
		this.commandMenuModel.items[1].items = [
			MenuData.CommandMenu.Recent,
			MenuData.CommandMenu.Tree,
			MenuData.CommandMenu.Search
		]

		this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'fade-bottom'}, this.commandMenuModel);
	}

	this.setupWaitingFeedback();

		this.controller.get("scrim-minimized").hide();
		this.controller.get("forum-image-small").src = appSettings.currentForum.logo;

	this.topicListAttrs = {
		listTemplate: 'forums/forumContainer',
		itemTemplate: 'recentPosts/topicItem',
		dividerFunction: this.topicDivider,
		dividerTemplate: 'recentPosts/topicDivider',
		emptyTemplate: 'subscribedPosts/emptyTopics',
		lookahead: 15,
		renderLimit: 25,
		uniquenessProperty: 'topic_id',
		itemsCallback: this.getTopics.bind(this),
		hasNoWidgets: true,
		formatters: {
			post_time: appSettings.Formatting.getNiceDate.bind(this),
			icon_url: appSettings.Formatting.formatTopicImage.bind(this),
			new_post: appSettings.Formatting.formatIfNewPosts.bind(this),
			is_subscribed: function(value,model) {return "hidden";}.bind(this),
			is_closed: appSettings.Formatting.formatForumClosed.bind(this),
			topic_title: appSettings.Formatting.formatTopicTitle.bind(this)
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
				changeOnKeyPress: true,
			},
			this._searchModel
		);
		this.searchBar = this.controller.get("search-bar");

	this.controller.listen('topicList', Mojo.Event.listTap, this.topicListTapHandler);
	this.controller.listen('forumList', Mojo.Event.listTap, this.listTapHandler);
	this.controller.listen(this.controller.get("header_button"), Mojo.Event.tap, this.forumMenuTapHandler);
	this.controller.listen(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);
	this.controller.listen(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);



};

SubscribedPostsAssistant.prototype.refreshScene = function() {
	Mojo.Log.info("REFRESCANDO Scene...");
	this.controller.get('topicList').mojo.setLengthAndInvalidate(this.total_topic_num);
	if (appSettings.Tapatalk.loggedIn) {
		this.commandMenuModel.items[1].items = [MenuData.CommandMenu.Recent, MenuData.CommandMenu.Subscribed, MenuData.CommandMenu.Tree, MenuData.CommandMenu.Messages, MenuData.CommandMenu.Search]
		if (this.appMenuModel.items[1] == MenuData.ApplicationMenu.Login) {
			this.appMenuModel.items.splice(1,1);
			this.controller.modelChanged(this.appMenuModel);
		}
	}
	else {
		this.commandMenuModel.items[1].items = [MenuData.CommandMenu.Recent, MenuData.CommandMenu.Tree, MenuData.CommandMenu.Search]
	}
		this.controller.modelChanged(this.commandMenuModel);

};


SubscribedPostsAssistant.prototype.aboutToActivate = function () {
	$$('body')[0].addClassName('dark-backdrop');

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
	Mojo.Log.info("preguntando mensajes");
	if (appSettings.Tapatalk.loggedIn) {
		appSettings.Tapatalk.privateMessage.get_inbox_stat(this.controller.stageController.assistant.gotMessagesCount.bind(this));
	}

		this.controller.get('search-field').addEventListener(Mojo.Event.propertyChange, this._searchKey);
		this._searchModel.value = '';
		this.controller.modelChanged(this._searchModel);
		//this.controller.get('search-button').style.visibility = 'hidden'; // Because changing the model doesnt fire any propertyChange events
		this.controller.get('search-button').addClassName('disabled');
		this.controller.document.addEventListener(Mojo.Event.tap, this._focusSearch);
		this.controller.get('search-field').mojo.focus();

};


SubscribedPostsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
		this.controller.get('search-field').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
		this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);
	$$('body')[0].removeClassName('dark-backdrop');
};

SubscribedPostsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
	this.controller.stopListening('topicList', Mojo.Event.listTap, this.topicListTapHandler);
	this.controller.stopListening('forumList', Mojo.Event.listTap, this.listTapHandler);
	this.controller.stopListening(this.controller.get("header_button"), Mojo.Event.tap, this.forumMenuTapHandler);
	this.controller.stopListening(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);
	this.controller.stopListening(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);

/*
	if (!appSettings.changingScene) {
		this.controller.stageController.assistant.closeChildWindows();
	}

*/
};

SubscribedPostsAssistant.prototype.doForumClose = function() {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */

	  this.scrim.show();
	  this.controller.get("scrim-message-wrapper").removeClassName("hidden");
	  this.closingSession = true;
	  	appSettings.Tapatalk.user.logout_user(function(result) {
			appSettings.Tapatalk.connection.disable();
			Mojo.Controller.stageController.popScene();
		});
};

SubscribedPostsAssistant.prototype.handleCommand = function(event) {

						Mojo.Log.info("HANDLECOMMAND");

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
		subMenuItems.push(MenuData.PopupMenu.MarkAsRead);

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
			case MenuData.PopupMenu.MarkAsRead.command:
				var that = this;
				appSettings.Tapatalk.forum.mark_all_as_read(function(result){
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

//Mojo.Log.info(Object.toJSON(event.item));
this.controller.stageController.pushScene({
	name: "topic",
	disableSceneScroller: true
}, item);

};


SubscribedPostsAssistant.prototype.getTopics = function(listWidget,postsOffset,postsLimit) {
	var last_number = postsOffset + postsLimit;
	//var that = this;

	try {

 		//this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
  		if (!this.requestFeedbackTimeout) this.setWaitingFeedback(true);
		this.controller.get('topicCounter').addClassName('hidden');

		if (this.mode == "subscribed") {

			appSettings.Tapatalk.subscription.get_subscribed_forum(this.gotForums.bind(this));
			appSettings.Tapatalk.subscription.get_subscribed_topic(this.gotTopics.curry(listWidget, postsOffset, postsLimit).bind(this));
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

	try {

		if (!response.error) {
			if (this.mode == "subscribed") {
				this.controller.get("forums").removeClassName("hidden");
			}
			else {
				this.controller.get("forums").addClassName("hidden");
			}
			Mojo.Log.info("RESPUESTA: ", Object.toJSON(response));
			listWidget.mojo.noticeUpdatedItems(postsOffset, response.topics);
			if (response.total_topic_num != this.total_topic_num && this.total_topic_num != 0) {
				Mojo.Log.info("invalidate");
				listWidget.mojo.setLengthAndInvalidate(response.total_topic_num);
			}
			else {
				Mojo.Log.info("new length");
				listWidget.mojo.setLength(response.total_topic_num);
			}

			this.total_topic_num = response.total_topic_num;

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

*/			Mojo.Log.info("Cancelando scrim");
			this.setWaitingFeedback(false);
		} else {
			if (response.error == "reauthenticate") {
				Mojo.Log.info("error de autenticacion: reauthenticate ", appSettings.Tapatalk.connection.reauthenticate);
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

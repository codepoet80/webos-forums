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
	  
	  //this.currentForum = {};
	  	this._searchKey = this._searchKey.bindAsEventListener(this);
		this._focusSearch = this._focusSearch.bindAsEventListener(this);
		this.searchBarState = false;

}

RecentPostsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
		
	appSettings.currentScene = "recentPosts";
	this.commandMenuModel = {
		visible: true,
		items: [{},{
			items:[],
			toggleCmd: "go-recent"
		},{}]
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
			MenuData.ApplicationMenu.GoBack, 	//Added by Jon W 11/14/2020
			MenuData.ApplicationMenu.NewCard,
			MenuData.ApplicationMenu.Preferences,
			MenuData.ApplicationMenu.Support,
			MenuData.ApplicationMenu.Help]
	};

/*
if (!appSettings.Tapatalk.config.api_level) {
	Mojo.Log.info("lolailo");
	this.appMenuModel.items[0].items[0].disabled = true;
	this.appMenuModel.items[0].items[1].disabled = true;
	MenuData.CommandMenu.Search.disabled = true;
	MenuData.CommandMenu.Recent.disabled = true;
}

*/

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
			MenuData.ApplicationMenu.GoBack, 	//Added by Jon W 11/14/2020
			MenuData.ApplicationMenu.Login,
			MenuData.ApplicationMenu.NewCard,
			MenuData.ApplicationMenu.Preferences,
			MenuData.ApplicationMenu.Support,
			MenuData.ApplicationMenu.Help]
	};

		this.controller.setupWidget(Mojo.Menu.appMenu, {
			omitDefaultItems: true
		}, this.appMenuModel);
		this.commandMenuModel = {
			visible: true,
			items: [MenuData.CommandMenu.Login, {}, {
				items: [MenuData.CommandMenu.Recent, MenuData.CommandMenu.Tree, MenuData.CommandMenu.Search],
				toggleCmd: "go-recent"
			}, {}, {}, {}]
		};

		this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'fade-bottom'}, this.commandMenuModel);
	}

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
		lookahead: 15,
		renderLimit: 25,
		uniquenessProperty: 'topic_id',
		itemsCallback: this.getTopics.bind(this),
		hasNoWidgets: true,
		formatters: {
			post_time: appSettings.Formatting.getNiceDate.bind(this),
			icon_url: appSettings.Formatting.formatTopicImage.bind(this),
			new_post: appSettings.Formatting.formatIfNewPosts.bind(this),
			is_subscribed: appSettings.Formatting.formatForumSubscribed.bind(this),
			is_closed: appSettings.Formatting.formatForumClosed.bind(this),		
			topic_title: appSettings.Formatting.formatTopicTitle.bind(this)		
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
				changeOnKeyPress: true,
			}, 
			this._searchModel
		);
		this.searchBar = this.controller.get("search-bar");

	
	this.controller.listen('topicList', Mojo.Event.listTap, this.topicListTapHandler);
	this.controller.listen(this.controller.get("header_button"), Mojo.Event.tap, this.forumMenuTapHandler);
	this.controller.listen(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);
	
	this.controller.listen(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);

};

RecentPostsAssistant.prototype.refreshScene = function() {
	Mojo.Log.info("REFRESCANDO Scene...");
	this.controller.get('topicList').mojo.setLengthAndInvalidate(appSettings.config.newTopicsCount);

Mojo.Log.info("Logged in: ", appSettings.Tapatalk.loggedIn);
	if (appSettings.Tapatalk.loggedIn) {
		this.commandMenuModel.items = [{},
		{items: [
		MenuData.CommandMenu.Recent, MenuData.CommandMenu.Subscribed, MenuData.CommandMenu.Tree, MenuData.CommandMenu.Messages, MenuData.CommandMenu.Search], toggleCmd: "go-recent"
		},
		{}];
	}
	else {
		//this.commandMenuModel.items[1].items = [MenuData.CommandMenu.Recent, MenuData.CommandMenu.Tree, MenuData.CommandMenu.Search]
	}
		this.controller.modelChanged(this.commandMenuModel);
		this.controller.modelChanged(this.appMenuModel);

};


RecentPostsAssistant.prototype.aboutToActivate = function () {
	//$$('body')[0].addClassName('dark-backdrop');

	try {
		if (!this.firstLoad) {
			this.refreshScene();
		}
	this.firstLoad = false;	

	} catch (e) {
		Mojo.Log.error("recentPosts aboutToActivate ERROR", e);
	}

};

RecentPostsAssistant.prototype.activate = function(event) {
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


RecentPostsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
		this.controller.get('search-field').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
		this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);

//$$('body')[0].removeClassName('dark-backdrop');

};

RecentPostsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening('topicList', Mojo.Event.listTap, this.topicListTapHandler);
	this.controller.stopListening(this.controller.get("header_button"), Mojo.Event.tap, this.forumMenuTapHandler);
	this.controller.stopListening(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);
	  
	this.controller.stopListening(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);

};

RecentPostsAssistant.prototype.doForumClose = function() {
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
		subMenuItems.push(MenuData.PopupMenu.MarkAsRead);
		
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
				//this.controller.get("topicList").mojo.revealTop();
				//this.controller.get('forumsPathDrawer').mojo.setOpenState(false);
				break;
			case MenuData.PopupMenu.MarkAsRead.command:
				var that = this;
				appSettings.Tapatalk.forum.mark_all_as_read(function(result) {
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
	
this.controller.stageController.pushScene({
	name: "topic",
	disableSceneScroller: true
}, item);
	
};

RecentPostsAssistant.prototype.getTopics = function(listWidget,postsOffset,postsLimit) {
	var last_number = postsOffset + postsLimit;
	var that = this;
	
	//this.scrim.show();
	this.controller.get('topicCounter').addClassName('hidden');
	
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
	
		if (!response.error) {
			if (this.mode == "recent") {
				listWidget.mojo.noticeUpdatedItems(postsOffset, response);
				listWidget.mojo.setLength(appSettings.config.newTopicsCount);
				this.controller.get('topicCounter').addClassName('hidden');
				
			}
			else {
			
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
		else {
			if (response.error == "reauthenticate") {
				var that = this;
				var retries = 0;
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
			}
		}
		
	} 
	catch (e) {
		Mojo.Log.error(e);
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

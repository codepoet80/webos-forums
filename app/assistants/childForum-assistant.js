function ChildForumAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  this.parentForum = args;
	  
	if(!this.parentForum.child) {
		this.parentForum.child = [];
	}
	this.listTapHandler = this.listTap.bindAsEventListener(this);
	this.topicListTapHandler = this.topicListTap.bindAsEventListener(this);
	this.topicListOnHoldHandler = this.topicListOnHold.bindAsEventListener(this);
	this.topicListOnHoldEndHandler = this.topicListOnHoldEnd.bindAsEventListener(this);
	this.forumMenuTapHandler = this.forumMenuTap.bindAsEventListener(this);

	  this.searchButtonPushHandler = this.searchButtonPush.bindAsEventListener(this);

	  this.total_topic_num = 0;
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
	  //this.currentForum = {};

		//for metatap handling
		this.metaTapPressed = false;
		
	  	this._searchKey = this._searchKey.bindAsEventListener(this);
		this._focusSearch = this._focusSearch.bindAsEventListener(this);
		this.searchBarState = false;
	  	this.headerTapHandler = this.headerTap.bindAsEventListener(this);
		this.metaTapHandler = this.metaTap.bindAsEventListener(this);
		this.metaTapReleaseHandler = this.metaTapRelease.bindAsEventListener(this);
}

ChildForumAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	this.setupWaitingFeedback();
	
	//Mojo.Log.info ("CHILDFORUMS: ", Object.toJSON(this.parentForum));
	
	this.childStructure = Object.clone(this.parentForum);
	this.childStructure.child = []; 
				for (x = 0; x < this.parentForum.child.length; x++) {
					if (!this.parentForum.child[x].child) {
						this.childStructure.child.push(this.parentForum.child[x]);
						
					} else {
						for (i = 0; i < this.parentForum.child[x].child.length; i++) {
							//Mojo.Log.info(this.parentForum.child[x].forum_name);
							this.parentForum.child[x].child[i].category = this.parentForum.child[x].forum_name;
							//Mojo.Log.info(Object.toJSON(this.parentForum.child[x].child[i]));
							this.childStructure.child.push(this.parentForum.child[x].child[i]);
						}
					}
				}


		this.controller.get("scrim-minimized").hide();
		this.controller.get("forum-image-small").src = appSettings.currentForum.logo;

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
			MenuData.ApplicationMenu.GoBack, 	//Added by Jon W 11/14/2020
			MenuData.ApplicationMenu.NewCard,
			MenuData.ApplicationMenu.Preferences,
			MenuData.ApplicationMenu.Support,
			MenuData.ApplicationMenu.Help]
	};

		this.controller.setupWidget(Mojo.Menu.appMenu, {
			omitDefaultItems: true
		}, this.appMenuModel);
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
	}


		
	this.controller.get("header_button").innerHTML = this.childStructure.forum_name;
	this.controller.get("forum_name").innerHTML = appSettings.currentForum.name;

	this.topicListAttrs = {
		listTemplate: 'forums/forumContainer',
		itemTemplate: 'childForum/topicItem',
		dividerFunction: this.topicDivider,
		dividerTemplate: 'childForum/topicDivider',
		lookahead: 15,
		renderLimit: 25,
		uniquenessProperty: 'topic_id',
		itemsCallback: this.getTopics.bind(this),
		hasNoWidgets: true,
		formatters: {
			last_reply_time: appSettings.Formatting.getNiceDate.bind(this),
			icon_url: appSettings.Formatting.formatTopicImage.bind(this),
			new_post: appSettings.Formatting.formatIfNewPosts.bind(this),
			is_subscribed: appSettings.Formatting.formatForumSubscribed.bind(this),
			is_closed: appSettings.Formatting.formatForumClosed.bind(this),
			topic_title: appSettings.Formatting.formatTopicTitle.bind(this)
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
			
		} else {
			this.cmdMenuModel = {
				visible: true,
				items: [{
					iconPath: "images/menu-icon-new-thread.png",
					command: "addNewTopic",
					disabled: this.childStructure.sub_only
				}, {}, {}]
			};
			
		}
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'fade-bottom'}, this.cmdMenuModel);

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
	this.controller.listen('topicList', Mojo.Event.hold, this.topicListOnHoldHandler.bind(this));
	this.controller.listen('topicList', Mojo.Event.holdEnd, this.topicListOnHoldEndHandler.bind(this));
	this.controller.listen('forumList', Mojo.Event.listTap, this.listTapHandler);
	this.controller.listen(this.controller.get("header_button"), Mojo.Event.tap, this.forumMenuTapHandler);
	this.controller.listen(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);
	

};


ChildForumAssistant.prototype.refreshScene = function () {
	//this.scrim.show();
	this.controller.get('topicList').mojo.setLengthAndInvalidate(this.total_topic_num);
	//Mojo.Log.info("REFRESCANDO Scene...");
	if (appSettings.Tapatalk.loggedIn) {
//		appSettings.visual.defaultCommandMenu.items[1].items[1].disabled = false;
//		appSettings.visual.defaultCommandMenu.items[1].items[3].disabled = false;
		if (this.appMenuModel.items[1] == MenuData.ApplicationMenu.Login) {
			this.appMenuModel.items.splice(1,1);
		}
	}
	else {
//		appSettings.visual.defaultCommandMenu.items[1].items[1].disabled = true;
//		appSettings.visual.defaultCommandMenu.items[1].items[3].disabled = true;
	}
//		this.controller.modelChanged(this.commandMenuModel);
		this.controller.modelChanged(this.appMenuModel);

};

ChildForumAssistant.prototype.aboutToActivate = function () {
		$$('body')[0].addClassName('dark-backdrop');

	//Mojo.Log.info("forums: childForum aboutToActivate");
	try {
		if (!this.firstLoad) {
			this.refreshScene();
		}
	this.firstLoad = false;	

	} catch (e) {
		Mojo.Log.error("ChildForumAssistant aboutToActivate ERROR", e);
	}
};

ChildForumAssistant.prototype.activate = function(event) {

	if (!this.childStructure.sub_only) {


		if (!!this.total_topic_num) {
			this.controller.get("forum_count").innerHTML = this.total_topic_num;

		}
	}
	else {

	}
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
		if (Mojo.Environment.DeviceInfo.keyboardAvailable) {
			this.controller.get('search-field').mojo.focus();
		}
		
		//metatap support
		this.controller.listen(this.controller.document, Mojo.Event.keydown, this.metaTapHandler, true);
		this.controller.listen(this.controller.document, Mojo.Event.keyup, this.metaTapReleaseHandler, true);

};


ChildForumAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
		this.controller.get('search-field').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
		this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);
		
		//metatap support
		this.controller.stopListening(this.controller.document, Mojo.Event.keydown, this.metaTapHandler, true);
		this.controller.stopListening(this.controller.document, Mojo.Event.keyup, this.metaTapReleaseHandler, true);
};

ChildForumAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
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
						this.formatScene(event.command);
						break;
				}
			}

		} catch (e) {
			Mojo.Log.error("handleCommand ERROR: ", e);
		}	
};

ChildForumAssistant.prototype.metaTap = function(event){
	//Mojo.Log.info("Key pressed;  meta:", (event.originalEvent.metaKey === true), " - ", event.originalEvent.keyCode);
	if (event.originalEvent.metaKey === true) {
		//Mojo.Log.info("METATAP PRESSED");
		this.metaTapPressed = true;
	};
};

ChildForumAssistant.prototype.metaTapRelease = function(event){
	//Mojo.Log.info("Key released;  meta:", (event.originalEvent.metaKey === true), " - ", event.originalEvent.keyCode);
	if (event.originalEvent.metaKey === true) {
		//Mojo.Log.info("METATAP RELEASED");
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
			this.controller.getSceneScroller().mojo.revealTop();
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
				else 
					if (this.childStructure.can_subscribe) {
						subMenuItems.push(MenuData.PopupMenu.SubscribeForum);
					}
				
			subMenuItems.push({});
			}
			/*subMenuItems.push({});
			subMenuItems.push(MenuData.PopupMenu.CopyForumURL);*/


		//subMenuItems.push(MenuData.PopupMenu.separators.options);
		//subMenuItems.push({});
		if (appSettings.Tapatalk.config.mark_forum) {
			//subMenuItems.push(MenuData.PopupMenu.MarkAsRead);
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
		Mojo.Log.error("ChildForumAssistant.forumMenuTap ERROR: ", e);
	}
};

ChildForumAssistant.prototype.forumMenuPopupHandler = function(choice) {
	try {
		switch (choice) {
			case 'subscribeForum':
				var that = this;
				appSettings.Tapatalk.subscription.subscribe_forum(this.childStructure.forum_id, function(response){
					if (response.result == true) {
						that.parentForum.is_subscribed = true;
						that.controller.get('subsbribedFlag').removeClassName("hidden");
					}
				});
				break;
			case 'unsubscribeForum':
				var that = this;
				appSettings.Tapatalk.subscription.unsubscribe_forum(this.childStructure.forum_id, function(response){
					if (response.result == true) {
						that.parentForum.is_subscribed = false;
						that.controller.get('subsbribedFlag').addClassName("hidden");
					}
				});
				break;
			case MenuData.PopupMenu.CopyForumURL.command:
				//Mojo.Log.info("ELEMENTO: ", Object.toJSON(this.parentForum));
				var currentURI = generateURI(this.parentForum.forum_id, 0,0);
				break;
			case MenuData.PopupMenu.MarkAllRead.command:
/*
				var that = this;
				appSettings.Tapatalk.forum.mark_all_as_read(function(result) {
					that.controller.get('topicList').mojo.setLengthAndInvalidate(that.total_topic_num);
				});

*/				break;
			case MenuData.PopupMenu.MarkAllAsRead.command:
				var that = this;
				appSettings.Tapatalk.forum.mark_all_as_read(function(result) {
					that.controller.get('topicList').mojo.setLengthAndInvalidate(that.total_topic_num);
				});
				break;
/*
			case MenuData.ApplicationMenu.Search.command:
				var args = {
					searchString: '',
					hideCommandMenu: true
				}
				this.controller.stageController.pushScene("search", args);
				break;

*/		}
	} catch (e) {
		Mojo.Log.error("childForum forumMenuPopupHandler ERROR: ", e);
	}
	
};

ChildForumAssistant.prototype.listTap = function(event) {
	var item = event.item;
	var index = event.index;
	
	if (!this.childStructure.child[index].url) {
		this.controller.stageController.pushScene("childForum", this.childStructure.child[index]);
	} else {
		//Mojo.Log.info("URL: ", this.childStructure.child[index].url);
		
		this.controller.serviceRequest('palm://com.palm.applicationManager', {
					method: 'open',
					parameters: {
						target: this.childStructure.child[index].url
					}
				});

	}
	
};


ChildForumAssistant.prototype.topicListTap = function(event) {
	var item = event.item;
	var index = event.index;
	
if (!this.metaTapPressed && !this._onHold) {
	this.controller.stageController.pushScene({
		name: "topic",
		disableSceneScroller: true
	}, item);
	
} else if (this.metaTapPressed && !this._onHold) {

				this.metaTapPressed = false;
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

ChildForumAssistant.prototype.topicListOnHold = function(event) {
				
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
		
		this.controller.popupSubmenu(this.popupMenuModel);


				
	};
	
ChildForumAssistant.prototype.holdPopupHandler = function(command){
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
		}
		delete this.currentEvent;
	}
	else {
		//Mojo.Log.info("NO HAY CURRENT EVENT");
	}
};
	
ChildForumAssistant.prototype.topicListOnHoldEnd = function(event) {
		if (this.currentElement === event.srcElement.up(".palm-row")) {
			this._onHold = true;
		} else {
			this._onHold = false;
		}
		//Mojo.Log.info("ONHOLD: ", this._onHold);
	};


ChildForumAssistant.prototype.getTopics = function(listWidget,postsOffset,postsLimit) {
	var last_number = postsOffset + postsLimit;
	var that = this;
	
  	this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 5000);
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

	
	appSettings.Tapatalk.topic.get_topic(this.childStructure.forum_id,postsOffset,last_number ,topicTag, function(response){
		try {
			that.setWaitingFeedback(false);
			
			if (response.total_topic_num == 0) {
				//listWidget.mojo.noticeUpdatedItems(postsOffset, []);
				listWidget.mojo.setLengthAndInvalidate(response.total_topic_num);
			}
			else {
				listWidget.mojo.noticeUpdatedItems(postsOffset, response.topics);
			}
			
			if (response.total_topic_num != that.total_topic_num && that.total_topic_num != 0) {
				listWidget.mojo.setLengthAndInvalidate(response.total_topic_num);
				this.firstLoad = false;
			} else {
				listWidget.mojo.setLength(response.total_topic_num);
			}
			that.total_topic_num = response.total_topic_num;

			//Applies proper scene formatting

			if (!!that.parentForum.sub_only) {
				if (response.can_post) {
					that.cmdMenuModel.items[0].disabled = true;
				}
				else {
					that.cmdMenuModel.items[0].disabled = true;
				}
			} else {
				that.cmdMenuModel.items[0].disabled = !response.can_post;
			}
			that.controller.modelChanged(that.cmdMenuModel);
			
			if (that.parentForum.is_subscribed) {
				that.controller.get('subsbribedFlag').removeClassName("hidden");
			} else {
				that.controller.get('subsbribedFlag').addClassName("hidden");
			}
			if (that.parentForum.is_closed) {
				that.controller.get('closedFlag').removeClass("hidden");	
			} else {
				that.controller.get('closedFlag').addClassName("hidden");	
			}
			if (that.total_topic_num != "0") {
				
				that.controller.get("forum_count").innerHTML = Math.ceil(that.total_topic_num);
				that.controller.get('topicCounter').removeClassName('hidden');
			}
			else {
				that.controller.get("forum_count").innerHTML = "0";
				that.controller.get('topicCounter').addClassName('hidden');
			}
		that.controller.get("topics").show();

		} catch (e) {
			Mojo.Log.error ("getTopics ERROR: ",e);
		}
		
	});
	
};

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

ChildForumAssistant.prototype.searchButtonPush = function(event) {
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


function TopicAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
  	this.dividerFunc = this.topicDivider.bind(this);
  	this.topicMenuTapHandler = this.topicMenuTap.bindAsEventListener(this);
  	this.postTapHandler = this.postTap.bindAsEventListener(this);
  	//this.WindowResizeHandler = this.windowResize.bindAsEventListener(this);
	this.propertyChangedHandler = this.propertyChanged.bindAsEventListener(this);
	//this.scrollStartingHandler = this.scrollStarting.bindAsEventListener(this);
	  this.searchButtonPushHandler = this.searchButtonPush.bindAsEventListener(this);

Mojo.Log.info("PARAMETROS RECIBIDOS ", Object.toJSON(args));
	if (!args.forum) {
		appSettings.subLaunch = false;
		this.topic = args;
	}
	else {
		appSettings.subLaunch = true;
		appSettings.currentForum = args.forum;
		appSettings.currentStage = args.stageName;
		appSettings.parentStage = args.parentStageName;
		this.loggedIn = args.parameters.loggedIn;
		this.topic = args.parameters.topic;
		this.session = args.parameters.session;
		Mojo.Log.info(Object.toJSON(this.topic));		
	}

	if (!this.topic.posts) {
		this.topic.posts = [];
	}
		//DON'T SHOW FEEDBACK
	this.silentMode = false;
		
	if (this.topic.reply_number != 0) {
		this.currentPage = Math.ceil((this.topic.reply_number + 1) / 20);
	}
	else {
		this.currentPage = 1;
	}

	this.pagesArray = [];
	this.postsList = {};
	this.firstLoad = true;
	this.fromNewPost = false;
	this.horizScrollerModel= {scrollbars: false, mode: "horizontal-snap"};
	this.vScrollerModel= {mode: "vertical"};
	this._onChild =false;

	  	this._searchKey = this._searchKey.bindAsEventListener(this);
		this._focusSearch = this._focusSearch.bindAsEventListener(this);
		this.searchBarState = false;
	  this.headerTapHandler = this.headerTap.bindAsEventListener(this);

}

TopicAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
 	this.setupWaitingFeedback();
 	
 	this.controller.get("scrim-minimized").hide();
 	this.controller.get("forum-image-small").src = appSettings.currentForum.logo;
 	
/*
 	if (appSettings.Tapatalk.config.disable_search && appSettings.Tapatalk.config.disable_search == "1") {
 		MenuData.ApplicationMenu.Search.disabled = true;
 		MenuData.CommandMenu.Search.disabled = true;
 	}
 	else {
 		MenuData.ApplicationMenu.Search.disabled = false;
 		MenuData.CommandMenu.Search.disabled = false;
 	}
 	
 	if (appSettings.Tapatalk.config.disable_lastest && appSettings.Tapatalk.config.disable_lastest == "1") {
 		MenuData.ApplicationMenu.Lastest.disabled = true;
 		MenuData.CommandMenu.Recent.disabled = true;
 	}
 	else {
 		MenuData.ApplicationMenu.Lastest.disabled = false;
 		MenuData.CommandMenu.Recent.disabled = false;
 	}
 	
 	if (appSettings.Tapatalk.loggedIn || !appSettings.Tapatalk.config.api_level) {
 		this.appMenuModel = {
 			visible: true,
 			items: [{
 				label: $L("Forum"),
 				disabled: true,
 				items: [MenuData.ApplicationMenu.AddToLauncher, //MenuData.ApplicationMenu.ShareForum
 MenuData.ApplicationMenu.Search, MenuData.ApplicationMenu.Lastest, MenuData.ApplicationMenu.Subscribed, MenuData.ApplicationMenu.ForumTree, MenuData.ApplicationMenu.PrivateMessages]
				}, MenuData.ApplicationMenu.NewCard, MenuData.ApplicationMenu.Preferences, MenuData.ApplicationMenu.Help]
			};
		}
		else {
			this.appMenuModel = {
				visible: true,
				items: [{
					label: $L("Forum"),
					disabled: true,
					items: [MenuData.ApplicationMenu.AddToLauncher, //MenuData.ApplicationMenu.ShareForum
 MenuData.ApplicationMenu.Search, MenuData.ApplicationMenu.Lastest, MenuData.ApplicationMenu.Subscribed, MenuData.ApplicationMenu.ForumTree, MenuData.ApplicationMenu.PrivateMessages]
				}, MenuData.ApplicationMenu.Login, MenuData.ApplicationMenu.NewCard, MenuData.ApplicationMenu.Preferences, MenuData.ApplicationMenu.Help]
			};
		}
		
		this.controller.setupWidget(Mojo.Menu.appMenu, {
			omitDefaultItems: true
		}, this.appMenuModel);

*/	
		if (!appSettings.subLaunch) {
			this.appMenuModel = {
				visible: true,
				items: [{
					label: $L("Forum"),
					disabled: true,
					items: [MenuData.ApplicationMenu.AddToLauncher, //MenuData.ApplicationMenu.ShareForum
 MenuData.ApplicationMenu.Search, MenuData.ApplicationMenu.Lastest, MenuData.ApplicationMenu.Subscribed, MenuData.ApplicationMenu.ForumTree, MenuData.ApplicationMenu.PrivateMessages]
				}, MenuData.ApplicationMenu.GoBack, MenuData.ApplicationMenu.Login, MenuData.ApplicationMenu.NewCard, MenuData.ApplicationMenu.Preferences, MenuData.ApplicationMenu.Support, MenuData.ApplicationMenu.Help]
			};
		} else {
			this.appMenuModel = {
				visible: true,
				items: [MenuData.ApplicationMenu.GoBack, MenuData.ApplicationMenu.Login, MenuData.ApplicationMenu.NewCard, MenuData.ApplicationMenu.Preferences, MenuData.ApplicationMenu.Support, MenuData.ApplicationMenu.Help]
			};
			
		}//GoBack Added in both conditions by Jon W 11/14/2020
		
		this.controller.setupWidget(Mojo.Menu.appMenu, {
			omitDefaultItems: true
		}, this.appMenuModel);
	
		if (appSettings.config.postPagination == true) {
		
			this.topicsListAttrs = {
				listTemplate: 'topic/topicContainer',
				itemTemplate: 'topic/topicItem',
				dividerFunction: this.dividerFunc,
				dividerTemplate: 'topic/topicDivider',
				lookahead: 15,
				renderLimit: 25,
				hasNoWidgets: true,
				uniquenessProperty: 'topic_id',
				itemsProperty: "posts",
				//itemsCallback: this.getThread.bind(this),
				formatters: {
					post_time: appSettings.Formatting.getNiceDate.bind(this),
					icon_url: appSettings.Formatting.formatTopicImage.bind(this),
					post_content: appSettings.Formatting.formatPostContent.bind(this)
				}
			};
			
			this.controller.setupWidget('topicsList', this.topicsListAttrs, this.topic);
			
		}
		else {
			this.topicsListAttrs = {
				listTemplate: 'topic/topicContainer',
				itemTemplate: 'topic/topicItem',
				dividerFunction: this.dividerFunc,
				dividerTemplate: 'topic/topicDivider',
				lookahead: 15,
				renderLimit: 25,
				hasNoWidgets: true,
				uniquenessProperty: 'topic_id',
				itemsCallback: this.getThread.bind(this),
				formatters: {
					post_time: formatting.getNiceDate.bind(this),
					icon_url: formatting.formatTopicImage.bind(this),
					post_content: formatting.formatPostContent.bind(this)
				}
			};
			
			this.controller.setupWidget('topicsList', this.topicsListAttrs, {});
		}
		this.controller.get("topic_title").innerHTML = this.topic.topic_title;
		this.controller.get("forum_name").innerHTML = appSettings.currentForum.name;
		
		this.cmdMenuModel = {
			visible: true,
			items: [{
				iconPath: "images/menu-icon-newchat.png",
				command: "addNewPost",
				disabled: !this.topic.can_reply
			}, {}, {
				label: this.currentPage + "/" + this.currentPage,
				submenu: "pageSelector",
				visible: appSettings.config.postPagination
			}]
		};
		
		this.controller.setupWidget(Mojo.Menu.commandMenu, {
			menuClass: 'fade-bottom'
		}, this.cmdMenuModel);
		
		this.pageMenuModel = {
			label: $L('Sort Options'),
			items: this.pagesArray
		};
		
		this.controller.setupWidget('pageSelector', {}, this.pageMenuModel);
		
		this.controller.listen(this.controller.get("topic_title"), Mojo.Event.tap, this.topicMenuTapHandler);
		
		this.controller.listen(this.controller.get("topicsList"), Mojo.Event.listTap, this.postTapHandler);
		
		
		var elements = this.controller.select('.snap');
		this.horizScrollerModel.snapElements = {
			x: elements,
			y: []
		};
		this.horizScrollerModel.snapIndex = 1;
		this.horizontalScroller = this.controller.get('horz_scroller');
		this.controller.setupWidget('horz_scroller', {}, this.horizScrollerModel);
		
		//Ajustamos altura de scroller vertical al tama�o de pantalla
		var windowHeight = this.controller.window.innerHeight;
		this.controller.get('scrollerContainer').style.height = (windowHeight - 80) + "px";
		this.controller.get('v_scroller').style.height = (windowHeight - 80) + "px";
		
		this.controller.setupWidget('v_scroller', {
			mode: "vertical"
		}, {});
		
		
		this.controller.get("forum_name").innerHTML = appSettings.currentForum.name;
		
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
			changeOnKeyPress: true,
		}, this._searchModel);
		this.searchBar = this.controller.get("search-bar");
		
		this.controller.listen('horz_scroller', Mojo.Event.propertyChanged, this.propertyChangedHandler);
		//Mojo.Event.listen(this.controller.window, 'resize', this.WindowResizeHandler.bind(this));
		this.controller.listen(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);
		this.controller.listen(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);
		


};

TopicAssistant.prototype.forumReady = function (event,response) {
 try {
 	if (this.session) {
		appSettings.Tapatalk.headers = this.session;
		appSettings.Tapatalk.loggedIn = this.loggedIn;
	}
		try {
		if (!event) {
			Mojo.Log.info("No hay evento");
			this.refreshScene()
		}
		else {
			Mojo.Log.info("Hay evento");
			if (event.post_id) {
				if (appSettings.config.postPagination == true) {
					this.fromNewPost = true;
					this.getTopicsPerPage(-1);
				}
				
			}
			else 
				if (event.result) {
					if (appSettings.config.postPagination == true) {
						this.getTopicsPerPage(this.currentPage);
					}
					else {
						this.controller.get('topicsList').mojo.setLengthAndInvalidate(this.total_post_num);
					}
				}
			
		}

		this.controller.get('search-field').addEventListener(Mojo.Event.propertyChange, this._searchKey);
		this._searchModel.value = '';
		this.controller.modelChanged(this._searchModel);
		
		//this.controller.get('search-button').style.visibility = 'hidden'; // Because changing the model doesnt fire any propertyChange events
		
		this.controller.get('search-button').addClassName('disabled');
		this.controller.document.addEventListener(Mojo.Event.tap, this._focusSearch);
		this.controller.get('search-field').mojo.focus();

		
		
		Mojo.Log.info("preguntando mensajes");
		
		if (Mojo.Controller.getAppController().getStageController(appSettings.currentStage).isActiveAndHasScenes()) {
			if (appSettings.Tapatalk.loggedIn) {
				appSettings.Tapatalk.privateMessage.get_inbox_stat(this.controller.stageController.assistant.gotMessagesCount.bind(this));
			}
		}
		
	} catch (e) {
		Mojo.Log.error("forumReady ERROR: ", e);
	}

	} 
	catch (e) {
		Mojo.Log.error("forumReady: ", e);
	}
};

TopicAssistant.prototype.refreshScene = function() {
	try {
		Mojo.Log.info("REFRESCANDO Scene...", Object.toJSON(this.appMenuModel));
		Object.toJSON(this.appMenuModel)
		if (appSettings.Tapatalk.loggedIn) {
			Mojo.Log.info("LOGGED IN");
			//this.commandMenuModel.items[1].items = [MenuData.CommandMenu.Recent, MenuData.CommandMenu.Subscribed, MenuData.CommandMenu.Tree, MenuData.CommandMenu.Messages, MenuData.CommandMenu.Search]
			if (!appSettings.subLaunch) {
				if (this.appMenuModel.items[1] == MenuData.ApplicationMenu.Login) {
					this.appMenuModel.items.splice(1, 1);
					this.controller.modelChanged(this.appMenuModel);
				}
			} else {
				Mojo.Log.info("ES sublaunch:", Object.toJSON(this.appMenuModel.items[0]));
				if (this.appMenuModel.items[0] == MenuData.ApplicationMenu.Login) {
					this.appMenuModel.items.splice(0, 1);
					this.controller.modelChanged(this.appMenuModel);
				}
			}
		} else {
			Mojo.Log.info("NOT LOGGED IN");
		}
		
				if (appSettings.config.postPagination == true && (!this.topic.post_id)){
					Mojo.Log.info("NO HAY POST ID");
					if (this.firstLoad) {
						this.firstLoad = false;
						if (this.topic.position) {
							Mojo.Log.info("Último visto");
						//this.showLastUnread();
						} else {
							Mojo.Log.info("Cargando Hilo");
							this.getTopicsPerPage(-1);
						}
					} else {
						Mojo.Log.info("recuperando hilo");
						this.getTopicsPerPage(this.currentPage);
					}
				} else if (appSettings.config.postPagination == true && (this.topic.post_id)) {
					Mojo.Log.info("HAY POST ID");
					this.firstLoad = false;
					if (this.topic.post_id) {
						this.findPostPosition();
					}		
				}
				else {
					this.controller.get('topicsList').mojo.setLengthAndInvalidate(this.total_post_num);
				}
		
	/*
	 if (appSettings.Tapatalk.loggedIn) {
	 this.commandMenuModel.items[1].items = [MenuData.CommandMenu.Recent, MenuData.CommandMenu.Subscribed, MenuData.CommandMenu.Tree, MenuData.CommandMenu.Messages, MenuData.CommandMenu.Search]
	 }
	 else {
	 this.commandMenuModel.items[1].items = [MenuData.CommandMenu.Recent, MenuData.CommandMenu.Tree, MenuData.CommandMenu.Search]
	 }
	 this.controller.modelChanged(this.commandMenuModel);
	 */
	} catch (e) {
		Mojo.Log.error("refreshScene ERROR: ", e);
	}
};

TopicAssistant.prototype.aboutToActivate = function(event){
	Mojo.Log.info("Forums: topicAssistant aboutToActivate");
	$$('body')[0].addClassName('dark-backdrop');

};

TopicAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	//this.scrim.show();
	//Mojo.Log.info("EVENTO: ",Object.toJSON(event));
	if (appSettings.subLaunch && this.firstLoad) {
		//TODO: decrypt password to pass in..
		appSettings.Tapatalk = new Tapatalk(appSettings.currentForum.url, appSettings.currentForum.user_name, appSettings.currentForum.user_password,this.forumReady.curry(event).bind(this));
		//appSettings.Tapatalk.loggedIn = this.loggedIn;
	}
	else {
		Mojo.Log.info("Launched from previous");
		if (!event) {
			this.forumReady();
		} else {
			this.forumReady(event);
		}
	}


};

TopicAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
		this.controller.get('search-field').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
		this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);
	$$('body')[0].removeClassName('dark-backdrop');
	
	

};

TopicAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */

		this.controller.stopListening(this.controller.get("topic_title"), Mojo.Event.tap, this.topicMenuTapHandler);
		this.controller.stopListening(this.controller.get("topicsList"), Mojo.Event.listTap, this.postTapHandler);
		//Mojo.Event.stopListening(this.controller.window, 'resize', this.WindowResizeHandler.bind(this));
	this.controller.stopListening(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);
	this.controller.stopListening(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);
};

TopicAssistant.prototype.handleCommand = function(event) {
		try {

		if(event.type == Mojo.Event.commandEnable && (event.command == Mojo.Menu.helpCmd || event.command == Mojo.Menu.prefsCmd)) {
			event.stopPropagation();
		}

		
			if (event.type == Mojo.Event.command) {
				switch (event.command) {
					case Mojo.Menu.helpCmd:
/*
						$$('body')[0].addClassName('no-wallpaper');
						var arguments = {pageTitle: $L("Communicate Help"), pageName: "main"};
						this.controller.stageController.pushScene("helpPage", arguments	);

*/
						break; 
					case 'addNewPost':
						this._onChild = true;
						var args = {topicMode: true, newTopic: false, currentTopic: this.topic, editMode: false};
						this.controller.stageController.pushScene("newPost", args);
						break;
					case 'pageViewer':
						var total = this.totalPages();
						var args = {
							minValue: 1,
							maxValue: total,
							currentValue: this.currentPage
						};

						this.controller.showDialog({
							template: 'topic/goToPageDialog-scene',
							assistant: new GoToPageDialogAssistant(this, this.goToPage.bind(this), args)							,
							preventCancel: false
						});
						break;
					default:
						if (event.command.startsWith("goToPage-")) {
							var page = event.command.split("-");
							this.getTopicsPerPage(page[1]);
							
							break;
						}
				}
			}

		} catch (e) {
			Mojo.Log.error("handleCommand: ", e);
		}	
};

TopicAssistant.prototype.goToPage = function(choice) {
	Mojo.Log.info(choice);
	this.currentPage = choice;
	this.getTopicsPerPage(this.currentPage);
};

TopicAssistant.prototype.setupWaitingFeedback = function() {
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

TopicAssistant.prototype.setWaitingFeedback = function(activate) {
	try {
		if (activate) {
			if (!this.silentMode) {
				this.scrim.show();
				this.spinnerModel.spinning = true;
				this.controller.modelChanged(this.spinnerModel);
			}
		}
		else {
			this.scrim.hide();
			this.spinnerModel.spinning = false;
			this.controller.modelChanged(this.spinnerModel);
			
			if (this.requestFeedbackTimeout) {
				this.controller.window.clearTimeout(this.requestFeedbackTimeout);
				this.silentMode = true;
			//this.timeout = null;
			}
		}
	//this.timeoutRequesting = null;
	} 
	catch (e) {
		Mojo.Log.info("setWaitingFeedback: ", e);
	}
};

TopicAssistant.prototype.topicMenuTap = function(event) {

	try {
		var place = event.target.id;
		event.stopPropagation();
		
		var subMenuItems = [];

		//subMenuItems.push(MenuData.PopupMenu.separators.topicActions);
		if (!!this.topic.can_subscribe && appSettings.Tapatalk.loggedIn) {
			if (this.topic.is_subscribed) {
				subMenuItems.push(MenuData.PopupMenu.UnsubscribeTopic);
			}
			else 
				if (this.topic.can_subscribe) {
					subMenuItems.push(MenuData.PopupMenu.SubscribeTopic);
				}
		subMenuItems.push({});
		}
		//subMenuItems.push(MenuData.PopupMenu.CopyTopicURL);
		
		//subMenuItems.push(MenuData.PopupMenu.separators.options);
		if (appSettings.Tapatalk.config.mark_forum) {
			//subMenuItems.push(MenuData.PopupMenu.MarkAsRead);
		}
		subMenuItems.push(MenuData.PopupMenu.MarkAllAsRead);
		
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

TopicAssistant.prototype.forumMenuPopupHandler = function(choice) {
	try {
		switch (choice) {
			case 'subscribeTopic':
				var that = this;
				appSettings.Tapatalk.subscription.subscribe_topic(this.topic.topic_id, function(result){
					that.topic.is_subscribed = true;
					that.controller.get('subsbribedFlag').removeClassName("hidden");	
				});
				break;
			case 'unsubscribeTopic':
				var that = this;
				appSettings.Tapatalk.subscription.unsubscribe_topic(this.topic.topic_id, function(result){
					try {
					that.topic.is_subscribed = false;
					that.controller.get('subsbribedFlag').addClassName("hidden");
					} catch(e) {
						Mojo.Log.error("TRYING TO UPDATE TOPIC INFO: ", e);
					}
				});
				break;
			case MenuData.ApplicationMenu.Search.command:
				var args = {
					searchString: '',
					hideCommandMenu: true	
				}
				this.controller.stageController.pushScene("search", args);
				break;
			case MenuData.PopupMenu.MarkAsRead.command:
				var that = this;
				appSettings.Tapatalk.forum.mark_all_as_read(function(result) {
					that.controller.get('topicList').mojo.setLengthAndInvalidate(that.total_post_num);
				});
				break;
		}
	} catch (e) {
		Mojo.Log.error("childForum forumMenuPopupHandler: ", e);
	}
	
};

TopicAssistant.prototype.getThread = function(listWidget,postsOffset,postsLimit) {
	try {
		var last_number = postsOffset + postsLimit;
		//this.topicData = {};
		var that = this;
		
		this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
		
		appSettings.Tapatalk.post.get_thread(this.topic.topic_id, postsOffset, last_number, function(response){
			that.topic.is_subscribed = response.is_subscribed;
			that.topic.can_subscribe = response.can_subscribe;
			
			try {
				that.setWaitingFeedback(false);
				listWidget.mojo.noticeUpdatedItems(postsOffset, response.posts);
				that.cmdMenuModel.items[0].disabled = !response.can_reply;
				that.cmdMenuModel.items[0].disabled = response.is_closed;
				that.controller.modelChanged(that.cmdMenuModel);
				
				if (response.total_post_num != that.total_post_num) {
					listWidget.mojo.setLengthAndInvalidate(response.total_post_num);
				}
				else {
					listWidget.mojo.setLength(response.total_post_num);
				}
				that.total_post_num = response.total_post_num;
				
				if (response.is_subscribed) {
					that.controller.get('subsbribedFlag').removeClassName("hidden");
				}
				else {
					that.controller.get('subsbribedFlag').addClassName("hidden");
				}
				if (response.is_closed) {
					that.controller.get('closedFlag').removeClassName("hidden");
				}
				else {
					that.controller.get('closedFlag').addClassName("hidden");
				}
				if (that.total_post_num) {
					that.controller.get("forum_count").innerHTML = that.total_topic_num;
					that.controller.get('topicCounter').removeClassName('hidden');
				}
				else {
					that.controller.get("forum_count").innerHTML = "0";
					that.controller.get('topicCounter').addClassName('hidden');
				}
				
				
			} 
			catch (e) {
				Mojo.Log.error("getThread ERROR: ", e);
			}
			
		});
	} catch (e) {
		Mojo.Log.error("getThread ERROR: ", e);
	}
};

 
TopicAssistant.prototype.getTopicsPerPage = function(page) {
	var postsOffset;
	var postsLimit = 19;
	var last_number;
	//this.topicData = {};
	//var that = this;
	try {
		this.scrim.show();
		
		this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
		
		if (page != -1) {
			this.currentPage = page;
		}
		else {
			page = Math.ceil((this.topic.reply_number + 1) / 20);
			Mojo.Log.info("GESTIONAR PAGINA: ", this.topic.reply_number, page);
			//Mojo.Log.info(page, " - ");
			if (page == ((this.topic.reply_number + 1) / 20)) {
			//BUG NO PAGE WHEN 20
			//page = page - 1;
			}
			this.currentPage = page;
		}
		postsOffset = (page - 1) * 20;
		last_number = postsOffset + postsLimit;
		
		Mojo.Log.info("topic: ", this.topic.topic_id);
		Mojo.Log.info("offset: ", postsOffset);
		Mojo.Log.info("range: ", last_number);
		
		appSettings.Tapatalk.post.get_thread(this.topic.topic_id, postsOffset, last_number, this.gotTopics.bind(this));
		
	} catch (e) {
		Mojo.Log.error("getTopicsPerPage ERROR: ", e);
	}
	
};

TopicAssistant.prototype.findPostPosition = function() {
/*	var postsOffset;
	var postsLimit = 19;
	var last_number;
*/	

	//copiamos la variable, y eliminamos goToPost
	var goToPost = Object.clone(this.topic.post_id);
	delete this.topic.post_id;
	
	this.scrim.show();

	 this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);

/*	if (page != -1) {
		this.currentPage = page;
	} else {
		page = Math.ceil((this.topic.reply_number + 1) / 20);
		//Mojo.Log.info(page, " - ");
		if (page == ((this.topic.reply_number + 1) / 20)) {
			page = page - 1;
		}
			this.currentPage = page;
	}
	postsOffset = (page-1)*20;
 	last_number = postsOffset + postsLimit;
	
	Mojo.Log.info("topic: ", this.topic.topic_id);
	Mojo.Log.info("offset: ", postsOffset);
	Mojo.Log.info("range: ", last_number);
	*/
	appSettings.Tapatalk.others.get_thread_by_post(this.topic.topic_id, goToPost, 20, this.gotTopics.bind(this));

	
};

TopicAssistant.prototype.gotTopics = function(response){

		try {
		this.topic.is_subscribed = response.is_subscribed;
		this.topic.can_subscribe = response.can_subscribe;

		//this.controller.get("debug").innerHTML=Object.toJSON(response);
		Mojo.Log.info("GOT TOPICS");
		Mojo.Log.info(Object.toJSON(response));
		if (response.topic_title) {
			this.topic.topic_title = response.topic_title;
			this.controller.get("topic_title").innerHTML = this.topic.topic_title;
		}
		this.topic.posts = response.posts;
		this.topic.can_reply = response.can_reply;
		this.topic.is_closed = response.is_closed;
		this.controller.modelChanged(this.topic)
		//this.controller.get("topicsList").removeClassName("hidden");

			this.setWaitingFeedback(false);

			this.cmdMenuModel.items[0].disabled = !response.can_reply;
			if (response.is_closed) {
				this.cmdMenuModel.items[0].disabled = response.is_closed;
			}
			this.controller.modelChanged(this.cmdMenuModel);


			if (response.total_post_num != this.total_post_num) {
				//listWidget.mojo.setLengthAndInvalidate(response.total_post_num);
			} else {
				//listWidget.mojo.setLength(response.total_post_num);
			}
			this.total_post_num = response.total_post_num;
			

/*			if (response.can_post) {
				this.cmdMenuModel.items[0].disabled = !response.can_post;
				this.controller.modelchanged(this.cmdMenuModel);
			}
*/

			if (response.is_subscribed) {
				this.controller.get('subsbribedFlag').removeClassName("hidden");
			} else {
				this.controller.get('subsbribedFlag').addClassName("hidden");
			}
			if (response.is_closed) {
				this.controller.get('closedFlag').removeClassName("hidden");	
			} else {
				this.controller.get('closedFlag').addClassName("hidden");	
			}

			if (this.total_post_num) {
				this.controller.get("forum_count").innerHTML = this.total_post_num;
				this.controller.get('topicCounter').removeClassName('hidden');
			}
			else {
				this.controller.get("forum_count").innerHTML = "0";
				this.controller.get('topicCounter').addClassName('hidden');
			}


				this.controller.get("arrowRight").show();
				this.controller.get("arrowLeft").show();
			if (this.currentPage == this.totalPages()) {
				this.controller.get("arrowRight").hide();
			}
			if (this.currentPage == 1) {
				this.controller.get("arrowLeft").hide();
			}

			if(!this._onChild) {
				this.controller.get('v_scroller').mojo.revealTop();
			} else {
				this._onChild = false;
			}
			this.horizScrollerModel.snapIndex = 1;
			this.controller.modelChanged(this.horizScrollerModel);
			
			var total = this.totalPages();

			this.cmdMenuModel.items[2].label = this.currentPage + "/" + total;
			if(total == 1) {
				this.cmdMenuModel.items[2].disabled = true;
			}

			this.controller.modelChanged(this.cmdMenuModel);
			
			this.pagesArray = [				{
					label: $L('First Page'),
					command:"goToPage-1",
					chosen: (this.currentPage == 1)
				}];
			
			/*if (total > 2) {
				for (var i = 2; i <= total-1; i++) {
					this.pagesArray.push({
						label: i,
						command: "goToPage-" + i,
						chosen: (this.currentPage == i)
					});
				}
			}*/
			
			this.pagesArray.push({
					label: $L('Last Page'),
					command: "goToPage-" + total,
					chosen: (this.currentPage == total)					
				});
				
			this.pagesArray.push({});
			this.pagesArray.push({
				label: $L("Go to Page..."),
				command: "pageViewer"
			})
			this.pageMenuModel.items = this.pagesArray;
			//this.controller.modelChanged(this.pageMenuModel);

		} catch (e) {
			Mojo.Log.error ("getThread ERROR: ",e);
		}
		
	};

TopicAssistant.prototype.topicDivider = function(model){
	//return model.post_id;
	return model.dividerDate;

};

TopicAssistant.prototype.postTap = function(event) {
	try {
		var args = {};
		var item = event.item;
		var originalEvent = event.originalEvent.target;
		event.stopPropagation();

		if (originalEvent.name === "link" || originalEvent.name ==="anchor" || originalEvent.name ==="email") {
			
			event.stopPropagation();
			//event.cancel();
			switch (originalEvent.name) {
				case "link":
			Mojo.Log.info(Object.toJSON(parseUri(originalEvent.href).queryKey));
				if(isEmptyJSON(parseUri(originalEvent.href).queryKey)) {
					Mojo.Log.info("URI VALIDA");
				} else {
					Mojo.Log.info("URI NO VALIDA");
				}

					var menuItem = [{
						label: $L("Open link"),
						command: "openLink"
					}];
					break;
				case "anchor":
					var menuItem = [{
						label: $L("Open File"),
						command: "openFile"
					}];
					break;
				case "email":
					var menuItem = [{
						label: $L("Send email"),
						command: "sendEmail"
					}];
					break;
			}
			
							args = {
								post_id: item.post_id,
								element: originalEvent.href
							};
				Mojo.Log.info(Object.toJSON(args));

				this.popupMenuModel = {
					onChoose: this.postMenuPopupHandler.curry(args),
					placeNear: event.originalEvent.target,
					manualPlacement: false,
					//popupClass: "sub-menu-popup",
					items: menuItem
				};

				if (this.topic.can_reply && !this.topic.is_closed) {
					menuItem.push({});
					menuItem.push({
						label: $L("Quote Post"),
						command: "quotePost"
					});
				}
				if (item.can_edit && !this.topic.is_closed) {
					this.popupMenuModel.items.push({
						label: $L("Edit Post"),
						command: "editPost"
					});
				}
/*
				if (item.can_delete) {
					this.popupMenuModel.items.push({});
					this.popupMenuModel.items.push({
						label: $L("Delete Post"),
						command: "deletePost"
					});
				}

*/
				
		this.controller.popupSubmenu(this.popupMenuModel);
		} else if (originalEvent.name === "image") {
			event.stopPropagation();
			//event.cancel();
			
							args = {
								post_id: item.post_id,
								element: originalEvent.src
							};
				Mojo.Log.info(Object.toJSON(args));
				var menuItem = [{
						label: $L("Open Image in Browser"),
						command: "openLink"
					}];
					
				this.popupMenuModel = {
					onChoose: this.postMenuPopupHandler.curry(args),
					placeNear: event.originalEvent.target,
					manualPlacement: false,
					//popupClass: "forum-menu-popup",
					items: menuItem
				};

				if (this.topic.can_reply && !this.topic.is_closed) {
					menuItem.push({});
					menuItem.push({
						label: $L("Quote Post"),
						command: "quotePost"
					});
				}

				if (item.can_edit && !this.topic.is_closed) {
					this.popupMenuModel.items.push({
						label: $L("Edit Post"),
						command: "editPost"
					});
				}
/*
				if (item.can_delete) {
					this.popupMenuModel.items.push({});
					this.popupMenuModel.items.push({
						label: $L("Delete Post"),
						command: "deletePost"
					});
				}

*/
				this.controller.popupSubmenu(this.popupMenuModel);
			
		}
		else {
			if (item.can_edit && !this.topic.is_closed) {
				
				args = {post_id: item.post_id};
			
				this.popupMenuModel = {
					onChoose: this.postMenuPopupHandler.curry(args),
					placeNear: event.originalEvent.target,
					manualPlacement: false,
					//popupClass: "forum-menu-popup",
					items: [{
						label: $L("Quote Post"),
						command: "quotePost"
					},{
						label: $L("Edit Post"),
						command: "editPost"
					}]
				};

/*
				if (item.can_delete) {
					this.popupMenuModel.items.push({});
					this.popupMenuModel.items.push({
						label: $L("Delete Post"),
						command: "deletePost"
					});
				}

*/				
				this.controller.popupSubmenu(this.popupMenuModel);
				
			}
			else {
			
				if (this.topic.can_reply && !this.topic.is_closed) {
					var args = {
						topicMode: true,
						newTopic: false,
						currentTopic: this.topic,
						editMode: false,
						quote_id: item.post_id
					};
					this._onChild = true;
					this.controller.stageController.pushScene("newPost", args);
				}
			}
		}
		
	} catch (e) {
		Mojo.Log.error("postTap error: ", e);
	}
};

TopicAssistant.prototype.postMenuPopupHandler = function(target,choice) {
	try {
		this._onChild = true;
		switch (choice) {
			case 'editPost':
				var args = {
					topicMode: true,
					newTopic: false,
					currentTopic: this.topic,
					editMode: true,
					post_id: target.post_id
				};
				this.controller.stageController.pushScene("newPost", args);
				break;
			case 'quotePost':
				var args = {
					topicMode: true,
					newTopic: false,
					currentTopic: this.topic,
					editMode: false,
					quote_id: target.post_id
				};
				this.controller.stageController.pushScene("newPost", args);
				break;
			case 'openLink':
			case 'openFile':
			case 'openImage':
			case 'sendEmail':
				this.controller.serviceRequest('palm://com.palm.applicationManager', {
					method: 'open',
					parameters: {
						target: target.element
					}
				});
				break;
		}
	} catch (e) {
		Mojo.Log.error("childForum forumMenuPopupHandler: ", e);
	}
	
};

TopicAssistant.prototype.totalPages = function(){
	var numOfPages = Math.ceil(this.total_post_num / 20);
	Mojo.Log.info("PAGINAS TOTALES: ", numOfPages);
	return numOfPages;
};

TopicAssistant.prototype.propertyChanged = function(event) {
	try {
		var totalPages = this.totalPages();
		if (this.currentPage !== 0) {
		
			switch (event.value) {
				case 2:
					if (this.currentPage != totalPages) {
						//this.controller.get("previous").removeClassName("hidden");
						this.currentPage = parseInt(this.currentPage) + 1;
						if (this.currentPage >= totalPages) {
							this.currentPage = totalPages;
						}
						this.getTopicsPerPage(this.currentPage);
					}
					else {
						this.horizScrollerModel.snapIndex = 1;
						this.controller.modelChanged(this.horizScrollerModel);
						
					}
					break;
				case 0:
					if (this.currentPage != 1) {
						this.currentPage = this.currentPage - 1;
						if (this.currentPage < 1) {
							this.currentPage = 1;
						//this.controller.get("previous").addClassName("hidden");
						}
						this.getTopicsPerPage(this.currentPage);
					}
					else {
						this.horizScrollerModel.snapIndex = 1;
						this.controller.modelChanged(this.horizScrollerModel);
						
					}
					break;
					
			}
		//appSettings.currentCategory = appSettings.data.categories[currentIndex].category_id;
		//appSettings.depot.getData(appSettings.currentCategory, "items", this.recreateListWithHeader.bind(this));
		
		}
		else {
			this.horizScrollerModel.snapIndex = 1;
			this.controller.modelChanged(this.horizScrollerModel);
		}
	} catch (e) {
		Mojo.Log.error("propertyChanged ERROR: ", e);
	}
	};

TopicAssistant.prototype.scrollStarting = function(event) {
/*
			this.controller.stopListening('panelList', Mojo.Event.listTap, this.groupsListTapHandler);
		this.controller.stopListening('panelList', Mojo.Event.listAdd, this.manageGroupsTapHandler);
		this.controller.stopListening('contactsList', Mojo.Event.listTap, this.contactsListTapHandler.bindAsEventListener(this));
		this.controller.stopListening('contactsList', Mojo.Event.listDelete, this.contactsListDeleteHandler.bindAsEventListener(this));
		//this.controller.stopListening('contactsList', Mojo.Event.listReorder, this.contactsListReorderHandler.bindAsEventListener(this));
		//Mojo.Event.listenForHoldEvent(this.controller.get('contactsList'), Mojo.Event.listTap, Mojo.Event.listReorder, this.contactsListOnHoldHandler.bindAsEventListener(this));
		this.controller.stopListening('contactsList', Mojo.Event.hold, this.contactsListOnHoldHandler.bind(this));
		this.controller.stopListening('contactsList', Mojo.Event.holdEnd, this.contactsListOnHoldEndHandler.bind(this));
		this.controller.stopListening('palm-header-toggle-menupanel', Mojo.Event.tap, this.toggleMenuPanel.bindAsEventListener(this));
		this.controller.stopListening(this.scrim, Mojo.Event.tap, this.toggleMenuPanel.bindAsEventListener(this));

*/
		event.scroller.addListener(this);
	};
	
/*
TopicAssistant.prototype.windowResize = function() {
		try {
			var windowWidth = this.controller.window.innerWidth;
			var windowHeight = this.controller.window.innerHeight;
			var scrollerHeight = windowHeight + 15;
			
			this.controller.get('v_scroller').style.height = windowHeight + "px";
			
		} catch (e) {
			Mojo.Log.error("windowResize: ", e);
		}
	};

*/


TopicAssistant.prototype.headerTap = function(event){
	
	this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
};
TopicAssistant.prototype.searchBarAnimationDone = function(){
	this.searchBarState = !this.searchBarState;
};

TopicAssistant.prototype.animateSearchPanel = function(panel, reverse, callback){

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

TopicAssistant.prototype._searchKey = function(event)
	{
		try {
			if (event.originalEvent.type == 'keyup' && event.originalEvent.keyCode == Mojo.Char.enter) {
				if (event.value.length >= 3) {
					var args = {
						searchString: event.value,
						hideCommandMenu: true
					
					}
					this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
					this.controller.stageController.pushScene("search", args);
				}
			}
			else 
				if (event.value.length < 3) {
					//this.controller.get('search-button').style.visibility = 'hidden';
					this.controller.get('search-button').addClassName('disabled');
				}
				else {
					//this.controller.get('search-button').style.visibility = 'visible';
					this.controller.get('search-button').removeClassName('disabled');
					
				}
			
			if (event.value.length > 0 && !this.searchBarState) {
				this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
			}
			if (event.value.length == 0 && Mojo.Char.isDeleteKey(event.originalEvent.keyCode) && this.searchBarState) {
				this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
			}
		} catch (e) {
			Mojo.Log.error ("_searchKey ERROR: ", e);
		}
	};
TopicAssistant.prototype._focusSearch = function(event)
	{
		this.controller = Mojo.Controller.stageController.activeScene();
		this.controller.get('search-field').mojo.focus.defer();
	};

TopicAssistant.prototype.searchButtonPush = function(event) {
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



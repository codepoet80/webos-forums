function TopicAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
  	this.dividerFunc = this.topicDivider.bind(this);
  	this.topicMenuTapHandler = this.topicMenuTap.bindAsEventListener(this);
	this.handleShaking = this.shake.bindAsEventListener(this);
  	this.postTapHandler = this.postTap.bindAsEventListener(this);
	this.postOnHoldHandler = this.postOnHold.bindAsEventListener(this);
	this.postOnHoldEndHandler = this.postOnHoldEnd.bindAsEventListener(this);
  	//this.WindowResizeHandler = this.windowResize.bindAsEventListener(this);
	this.propertyChangedHandler = this.propertyChanged.bindAsEventListener(this);
	//this.scrollStartingHandler = this.scrollStarting.bindAsEventListener(this);
	  this.searchButtonPushHandler = this.searchButtonPush.bindAsEventListener(this);
	this.checkSession = this.checkSession.bind(this);

	if (appSettings.debug.detailedLogging) {
	  Mojo.Log.info("TopicAssistant args: ", Object.toJSON(args));
	}
	if (!args.forum) {
		Mojo.Log.info("!args.forum, loggedIn: " + appSettings.Tapatalk.loggedIn);
		appSettings.subLaunch = false;
		this.topic = args;
	}
	else {
		Mojo.Log.info("args.forum, args.parameters.loggedIn: " + args.parameters.loggedIn + ", appSettings.Tapatalk.loggedIn: " + appSettings.Tapatalk.loggedIn);
		appSettings.subLaunch = true;
		appSettings.currentForum = args.forum;
		appSettings.currentStage = args.stageName;
		appSettings.parentStage = args.parentStageName;
		this.loggedIn = args.parameters.loggedIn;
		this.topic = args.parameters.topic;
		this.session = args.parameters.session;
		//Mojo.Log.info(Object.toJSON(this.topic));
	}

	if (!this.topic.posts) {
		this.topic.posts = [];
		if (!this.topic.reply_number) {
			this.topic.reply_number = 0;
		}
	}
		//DON'T SHOW FEEDBACK
	this.silentMode = false;

/*
	if (this.topic.reply_number != 0) {
		this.currentPage = Math.ceil((this.topic.reply_number + 1) / 20);
	}
	else {
		this.currentPage = 1;
	}

*/
this.currentPage = 0;

	this.pagesArray = [];
	this.postsList = {};
	this.firstLoad = true;
	this.fromNewPost = false;
	this.viewingProfile = false;
	this.horizScrollerModel= {scrollbars: false, mode: "horizontal-snap"};
	this.vScrollerModel= {mode: "vertical"};
	this._onChild =false;

	this._searchKey = this._searchKey.bindAsEventListener(this);
	this._focusSearch = this._focusSearch.bindAsEventListener(this);
	this.searchBarState = false;
	this.headerTapHandler = this.headerTap.bindAsEventListener(this);

	//for metatap handling
	this.metaTapPressed = false;
	this.metaTapHandler = this.metaTap.bindAsEventListener(this);
	this.metaTapReleaseHandler = this.metaTapRelease.bindAsEventListener(this);
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
		}
		//GoBack Added in both conditions by Jon W 11/14/2020

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
					post_content: appSettings.Formatting.formatPostContent.bind(this),
					is_online: appSettings.Formatting.formatIsOnline.bind(this),
					thanks_info: this.getThanksInfo.bind(this),
					likes_info: this.getLikesInfo.bind(this),
					like_count: this.getLikesCount.bind(this) //  "like_count": 1
					//can_reply:  appSettings.Formatting.formatCanReply.bind(this)
				},
				onItemRendered: this.onItemRendered.bind(this)
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
				//itemsCallback: this.getThread.bind(this),
				formatters: {
					post_time: formatting.getNiceDate.bind(this),
					icon_url: formatting.formatTopicImage.bind(this),
					post_content: formatting.formatPostContent.bind(this)
				}
			};

			this.controller.setupWidget('topicsList', this.topicsListAttrs, {});
		}
		this.controller.get("topic_title").innerText = this.topic.topic_title;
		this.controller.get("forum_name").innerHTML = appSettings.currentForum.name;

		this.cmdMenuModel = {
			visible: true,
			items: [{
				iconPath: "images/menu-icon-newchat.png",
				command: "addNewPost",
				disabled: !this.topic.can_reply
			}, {},{},{
				icon: "refresh",
				command: "refresh"
			}, {
				label: this.currentPage + "/" + this.currentPage,
				submenu: "pageSelector",
				visible: appSettings.config.postPagination
			}]
		};

		this.controller.setupWidget(Mojo.Menu.commandMenu, 
			{ menuClass: 'fade-bottom'}, 
			this.cmdMenuModel);

		this.pageMenuModel = {
			label: $L('Sort Options'),
			items: this.pagesArray
		};

		this.controller.setupWidget('pageSelector', {}, this.pageMenuModel);

		this.controller.listen(this.controller.get("topic_title"), Mojo.Event.tap, this.topicMenuTapHandler);

		this.controller.listen(this.controller.get("topicsList"), Mojo.Event.listTap, this.postTapHandler);

		this.controller.listen('topicsList', Mojo.Event.hold, this.postOnHoldHandler);//.bind(this));
		this.controller.listen('topicsList', Mojo.Event.holdEnd, this.postOnHoldEndHandler);//.bind(this));


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
			changeOnKeyPress: true
		}, this._searchModel);
		this.searchBar = this.controller.get("search-bar");

		this.controller.listen('horz_scroller', Mojo.Event.propertyChanged, this.propertyChangedHandler);
		//Mojo.Event.listen(this.controller.window, 'resize', this.WindowResizeHandler.bind(this));
		this.controller.listen(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);
		this.controller.listen(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);
};

TopicAssistant.prototype.forumReady = function (event,response) {
	Mojo.Log.info("TopicAssistent.forumReady()");
 try {
 	if (this.session) {
		appSettings.Tapatalk.headers = this.session;
		appSettings.Tapatalk.loggedIn = this.loggedIn;
	}
		try {
		if (!event) {
			//Mojo.Log.info("No hay evento");
			this.refreshScene();
		}
		else {
			//Mojo.Log.info("Hay evento");
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
		if (Mojo.Environment.DeviceInfo.keyboardAvailable) {
			this.controller.get('search-field').mojo.focus();
		}



		//Mojo.Log.info("preguntando mensajes");

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
		//Mojo.Log.info("REFRESCANDO Scene...", Object.toJSON(this.appMenuModel));
		Object.toJSON("ENTERING REFRESHSCENE");
		this.refreshing = true;
		if (appSettings.Tapatalk.loggedIn) {
			Mojo.Log.info("LOGGED IN");
			//this.commandMenuModel.items[1].items = [MenuData.CommandMenu.Recent, MenuData.CommandMenu.Subscribed, MenuData.CommandMenu.Tree, MenuData.CommandMenu.Messages, MenuData.CommandMenu.Search]
			if (!appSettings.subLaunch) {
				if (this.appMenuModel.items[1] == MenuData.ApplicationMenu.Login) {
					this.appMenuModel.items.splice(1, 1);
					this.controller.modelChanged(this.appMenuModel);
				}
			} else {
				//Mojo.Log.info("ES sublaunch:", Object.toJSON(this.appMenuModel.items[0]));
				if (this.appMenuModel.items[0] == MenuData.ApplicationMenu.Login) {
					this.appMenuModel.items.splice(0, 1);
					this.controller.modelChanged(this.appMenuModel);
				}
			}
		} else {
			Mojo.Log.info("NOT LOGGED IN");
		}

		if(appSettings.config.postPagination == true) {
			if (this.firstLoad) {
				//Mojo.Log.info("FirstLoad");
				this.getTopicsPerPage(-1);
			}
			else {
				//Mojo.Log.info("NO FIRSTLOAD");
				this.getTopicsPerPage(this.currentPage);
			}

		}	else {
			this.controller.get('topicsList').mojo.setLengthAndInvalidate(this.total_post_num);
		}
/*
				if (appSettings.config.postPagination == true && (!this.topic.post_id) ){
					//Mojo.Log.info("NO HAY POST ID");
					if (this.firstLoad) {
						this.firstLoad = false;
						if (this.topic.position) {
							//Mojo.Log.info("Último visto");
						//this.showLastUnread();
						} else {
							//Mojo.Log.info("Cargando Hilo");
							this.getTopicsPerPage(-1);
						}
					} else {
						//Mojo.Log.info("recuperando hilo");
						this.getTopicsPerPage(this.currentPage);
					}
				} else if (appSettings.config.postPagination == true && (this.topic.post_id)) {
					//Mojo.Log.info("HAY POST ID");
					this.firstLoad = false;
					if (this.topic.post_id) {
						//Mojo.Log.info("BUSCANCO POSIDION DEL POST");
						//this.findPostPosition();
					}
				}
				else {
					this.controller.get('topicsList').mojo.setLengthAndInvalidate(this.total_post_num);
				}

*/


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
	Mojo.Log.info("TopicAssistant.aboutToActivate()");
	this.setWaitingFeedback(false);
	//Mojo.Log.info("Forums: topicAssistant aboutToActivate");
	if(this.firstLoad) this.scrim.show();
	//$$('body')[0].addClassName('dark-backdrop');
/*
	if (event) {
		this.resetScroll = event.resetScroll;
	}

*/
};

TopicAssistant.prototype.activate = function(event) {
	Mojo.Log.info("TopicAssistant.activate(), viewingProfile? - " + this.viewingProfile);
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	Mojo.Log.info("Event : ", JSON.stringify(event));
	if (appSettings.config.shakeToRefresh) {
		this.controller.listen(this.controller.document, 'shakestart', this.handleShaking.bindAsEventListener(this));
	}

	if (appSettings.subLaunch && this.firstLoad) {
/*
		var remoteServer = appSettings.currentForum.url.replace(/mobiquo\056php$/i, "") // remove ending "mobiquo.php"
		remoteServer = remoteServer.replace(/mobiquo\057$/i, "") // remove ending "mobiquo/", if any
		remoteServer = remoteServer.replace(/mobiquo$/i, "") // remove ending "mobiquo", if any
		remoteServer = remoteServer.replace(/\057$/i, "") // remove ending "/", if any
		remoteServer = remoteServer + "/" + appSettings.currentForum.mobiquo_dir + "/mobiquo." + appSettings.currentForum.extension;

		//Mojo.Log.info(remoteServer);

*/
		//TODO: decrypt password to pass in..
		appSettings.Tapatalk = new Tapatalk(appSettings.currentForum.url, appSettings.currentForum.user_name, appSettings.currentForum.user_password, this.forumReady.curry(event).bind(this));
	//appSettings.Tapatalk.loggedIn = this.loggedIn;
	}
	else {
		//Mojo.Log.info("Launched from previous");
		if (!event) {
			if (this.viewingProfile) {
				this.viewingProfile=false;
			} 
			else {
				this.forumReady();
			}
		}
		else {
			//I think this is where the autorefresh behavior is..
			if (this.viewingProfile) {
				this.viewingProfile=false;
			} 
			else {
				this.resetScroll = event.resetScroll;
				this.forumReady(event);
			}
		}
	}

	//Make sure session is still active..
//	try {
//		this.checkSession();
//	}
//	catch (ex) {
//		Mojo.Log.error("Ex calling checkSession()" + ex);
//	}

	//metatap support
	this.controller.listen(this.controller.document, Mojo.Event.keydown, this.metaTapHandler, true);
	this.controller.listen(this.controller.document, Mojo.Event.keyup, this.metaTapReleaseHandler, true);

};

TopicAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	this.controller.get('search-field').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
	this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);
	if (appSettings.config.shakeToRefresh) {
		this.controller.stopListening(this.controller.document, 'shakestart', this.handleShaking.bindAsEventListener(this));
	}
	//$$('body')[0].removeClassName('dark-backdrop');

	//metatap support
	this.controller.stopListening(this.controller.document, Mojo.Event.keydown, this.metaTapHandler, true);
	this.controller.stopListening(this.controller.document, Mojo.Event.keyup, this.metaTapReleaseHandler, true);


};

TopicAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
		if(this.requestFeedbackTimeout) {
			this.controller.window.clearTimeout(this.requestFeedbackTimeout);
			this.requestFeedbackTimeout = null;
		}

		this.controller.stopListening(this.controller.get("topic_title"), Mojo.Event.tap, this.topicMenuTapHandler);
		this.controller.stopListening(this.controller.get("topicsList"), Mojo.Event.listTap, this.postTapHandler);

		this.controller.stopListening('topicsList', Mojo.Event.hold, this.postOnHoldHandler.bind(this));
		this.controller.stopListening('topicsList', Mojo.Event.holdEnd, this.postOnHoldEndHandler.bind(this));
		//Mojo.Event.stopListening(this.controller.window, 'resize', this.WindowResizeHandler.bind(this));
	this.controller.stopListening(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);
	this.controller.stopListening(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);
};

TopicAssistant.prototype.handleCommand = function(event) {
		try {
		Mojo.Log.info("TopicAssistant.handleCommand called.");
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
					case "refresh":
						this.refreshScene();
					default:
						if (event.command.startsWith("goToPage-")) {
							var page = event.command.split("-");
							this.resetScroll= true;
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
	//Mojo.Log.info(choice);
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
		Mojo.Log.error("setWaitingFeedback: ", e);
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
		}
		//Mojo.Log.info("^^^^^^^^^ENABLE COPY: ", appSettings.Tapatalk.config.enableCopy);
		if (appSettings.Tapatalk.config.enableCopy) {
			subMenuItems.push(MenuData.PopupMenu.CopyThreadURL);
			if (appSettings.config.twitter.authorized) {
				subMenuItems.push({});
				subMenuItems.push(MenuData.PopupMenu.TweetThis);
			}
		}

		if(subMenuItems.length >0) subMenuItems.push({});

		//subMenuItems.push(MenuData.PopupMenu.separators.options);
		if (appSettings.Tapatalk.config.mark_forum) {
			subMenuItems.push(MenuData.PopupMenu.MarkAsRead);
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
				//Mojo.Log.info("MARK FORUM: ", this.topic.forum_id, this.topic.forum_name);
				appSettings.Tapatalk.forum.mark_as_read(this.topic.forum_id, function(result){
					//that.controller.get('topicList').mojo.setLengthAndInvalidate(that.total_topic_num);
					Mojo.Controller.getAppController().showBanner($L("Current Forum marked as read"), {}, {});
				});
				break;
			case MenuData.PopupMenu.MarkAllAsRead.command:
				var that = this;
				appSettings.Tapatalk.forum.mark_all_as_read(function(result){
					that.controller.get('topicList').mojo.setLengthAndInvalidate(that.total_topic_num);
					Mojo.Controller.getAppController().showBanner($L("All forums marked as read"), {}, {});
				});
				break;
			case MenuData.PopupMenu.CopyThreadURL.command:
				var currentURI = generateURI(this.topic.forum_id, this.topic.topic_id, 0, true);
/*
				var siteRoot = appSettings.currentForum.url.replace(/\057$/i, "");
				var fullURL = siteRoot + "/" + currentURI;

*/				//Mojo.Log.info(currentURI);
				this.controller.stageController.setClipboard(currentURI, true);
				Mojo.Controller.getAppController().showBanner($L("URL Copied to Clipboard"), {}, {});
				break;
			case MenuData.PopupMenu.TweetThis.command:
				var currentURI = generateURI(this.topic.forum_id, this.topic.topic_id, 0, true);
				var arguments = {
					tweet: this.topic.topic_title,
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
	} catch (e) {
		Mojo.Log.error("childForum forumMenuPopupHandler: ", e);
	}

};

TopicAssistant.prototype.getThread = function(listWidget,postsOffset,postsLimit) {
	Mojo.Log.info("TopicAssistant.getThread() called.");
	try {
		var last_number = postsOffset + postsLimit;
		//this.topicData = {};
		this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);

		if (this.topic.post_id && appSettings.Tapatalk.config.goto_post == "1") {
			var goToPost = this.topic.post_id;
			var goToTopic = this.topic.topic_id;

			appSettings.Tapatalk.post.get_thread_by_post(goToPost, postsLimit, true, this.gotThread.bind(this));
		}
		else
			if (appSettings.Tapatalk.config.goto_unread == "1") {
				//Mojo.Log.info("Pidiendo UNREAD");
			appSettings.Tapatalk.post.get_thread_by_unread(goToTopic, postsLimit, true, this.gotThread.bind(this));
			}
			else {
				appSettings.Tapatalk.post.get_thread(goToTopic, postsOffset, last_number, this.gotThread.bind(this));
			}
	} catch (e) {
		Mojo.Log.error("getThread ERROR: ", e);
	}
};

TopicAssistant.prototype.gotThread = function(response) {
	Mojo.Log.info("TopicAssistant.gotThread() called");
				this.topic.is_subscribed = response.is_subscribed;
				this.topic.can_subscribe = response.can_subscribe;

				try {
					this.setWaitingFeedback(false);
					listWidget.mojo.noticeUpdatedItems(postsOffset, response.posts);
					this.cmdMenuModel.items[0].disabled = !response.can_reply;
					this.cmdMenuModel.items[0].disabled = response.is_closed;
					this.controller.modelChanged(this.cmdMenuModel);

					if (response.total_post_num != this.total_post_num) {
						listWidget.mojo.setLengthAndInvalidate(response.total_post_num);
					}
					else {
						listWidget.mojo.setLength(response.total_post_num);
					}
					this.total_post_num = response.total_post_num;

					if (response.is_subscribed) {
						this.controller.get('subsbribedFlag').removeClassName("hidden");
					}
					else {
						this.controller.get('subsbribedFlag').addClassName("hidden");
					}
					if (response.is_closed) {
						this.controller.get('closedFlag').removeClassName("hidden");
					}
					else {
						this.controller.get('closedFlag').addClassName("hidden");
					}
					if (this.total_post_num) {
						this.controller.get("forum_count").innerHTML = this.total_topic_num;
						this.controller.get('topicCounter').removeClassName('hidden');
					}
					else {
						this.controller.get("forum_count").innerHTML = "0";
						this.controller.get('topicCounter').addClassName('hidden');
					}


				}
				catch (e) {
					Mojo.Log.error("getThread ERROR: ", e);
				}

};

TopicAssistant.prototype.getTopicsPerPage = function(page) {
	var postsOffset;
	var postsLimit = 20;
	var last_number;
	
	Mojo.Log.info("TopicAssistant.getTopicsPerPage() called, page param: " + page);
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
			//Mojo.Log.info("GESTIONAR PAGINA: ", this.topic.reply_number, page);
			//Mojo.Log.info(page, " - ");
			if (page == ((this.topic.reply_number + 1) / 20)) {
			//BUG NO PAGE WHEN 20
			//page = page - 1;
			}
			this.currentPage = page;
		}
		postsOffset = (page - 1) * 20;
		last_number = postsOffset + postsLimit -1;

		//Mojo.Log.info("topic: ", this.topic.topic_id);
		//Mojo.Log.info("offset: ", postsOffset);
		//Mojo.Log.info("range: ", last_number);


		var goToPost = this.topic.post_id;
		var goToTopic = this.topic.topic_id;
		if (this.firstLoad) {
			this.firstLoad = false;
			if (this.topic.post_id && appSettings.Tapatalk.config.goto_post == "1") {

				//Mojo.Log.info("get_thread_by_post CALLED");
				appSettings.Tapatalk.post.get_thread_by_post(goToPost, postsLimit, true, this.gotTopics.bind(this));
			}
			else
				//MW - try only calling this if we are logged in. May only do for proboards..
				if (appSettings.Tapatalk.loggedIn && appSettings.Tapatalk.config.goto_unread == "1") {
					//Mojo.Log.info("get_thread_by_unread CALLED");
					appSettings.Tapatalk.post.get_thread_by_unread(goToTopic, postsLimit, true, this.gotTopics.bind(this));
				}
				else {
					//Mojo.Log.info("get_thread CALLED");
					appSettings.Tapatalk.post.get_thread(goToTopic, postsOffset, last_number, this.gotTopics.bind(this));
				}
		//appSettings.Tapatalk.post.get_thread(this.topic.topic_id, postsOffset, last_number, this.gotTopics.bind(this));
		} else {
			//Mojo.Log.info("get_thread CALLED");
			appSettings.Tapatalk.post.get_thread(goToTopic, postsOffset, last_number, this.gotTopics.bind(this));
		}
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
	var goToPost = this.topic.post_id;
	//delete this.topic.post_id;

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
	appSettings.Tapatalk.post.get_thread_by_post(goToPost, 20, true, function(response) {
		//Mojo.Log.info(Object.toJSON(response));
	}); //this.gotTopics.bind(this));


};

TopicAssistant.prototype.gotTopics = function(response){
//Make sure session is still active..  This isn't working well because the session seems to get 
//hosed sometime after the topics are returned.. where to put it?
//		try {
//			this.checkSession();
//		}
//		catch (ex) {
//			Mojo.Log.error("Ex calling checkSession()" + ex);
//		}	

		if (response.posts) {
		Mojo.Log.info("TopicAssistant.gotTopics() topics received: " + response.posts.length);
		}
		try {
		var transition = this.controller.prepareTransition(Mojo.Transition.crossFade, false);

		this.topic.is_subscribed = response.is_subscribed;
		this.topic.can_subscribe = response.can_subscribe;

		if (appSettings.debug.detailedLogging && appSettings.debug.dumpPosts) {
			try {
				logJSON("gotTopics(), response: " + JSON.stringify(response,null,2));
			} catch (ex) {
				Mojo.Log.info("Object too complex to build json string");
			}
		}
		//this.controller.get("debug").innerHTML=Object.toJSON(response);
		//Mojo.Log.info("GOT TOPICS");
		//Mojo.Log.info(Object.toJSON(response));
		if (response.topic_title) {
			this.topic.topic_title = response.topic_title;
//			this.controller.get("topic_title").innerHTML = htmlentities(this.topic.topic_title, 'HTML_SPECIALCHARS');
			this.controller.get("topic_title").innerText = this.topic.topic_title;
		}
		//Mojo.Log.info("RESPUESTAS: ", Object.toJSON(response.posts.length));
		var posts = response.posts;
		this.topic.posts = posts;
		//Mojo.Log.info(Object.toJSON(this.topic.posts));
		this.topic.can_reply = response.can_reply;
		this.topic.is_closed = response.is_closed;

		this.controller.modelChanged(this.topic)
		transition.run();

//Mojo.Log.info("1st part success");
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

//Mojo.Log.info("2nd part success");
				this.controller.get("arrowRight").show();
				this.controller.get("arrowLeft").show();
			if (this.currentPage == this.totalPages()) {
				this.controller.get("arrowRight").hide();
			}
			if (this.currentPage == 1) {
				this.controller.get("arrowLeft").hide();
			}

			if(!this._onChild) {
				if (this.resetScroll) {
					this.controller.get('v_scroller').mojo.revealTop();
					this.resetScroll = false;
				} else {

				}
			} else {
				this._onChild = false;
			}
			this.horizScrollerModel.snapIndex = 1;
			this.controller.modelChanged(this.horizScrollerModel);

			var total = this.totalPages();

			Mojo.Log.info("RESPONSE POSITION: ", response.position);
			if(response.position && response.position != 0) {
				//var final_position = response.position - ((total-1)*20);
				//var floorMasUno = Math.floor(response.position/20) + 1;
				var floor = Math.floor(response.position/20);
				var floorCompleto = response.position/20;
				if (floor == floorCompleto) {
					var final_page = floor;
				} else {
				var final_page = floor + 1;
				}
				var page_position = Math.floor(response.position/20);
				var final_position = response.position - ((page_position)*20);
				//Mojo.Log.info("Total POSTS: ", this.topic.posts.length);
				//Mojo.Log.info("POSICION FINAL: posicion: ", response.position, " - posicion_final: ", final_position, " - pagina_final: ", final_page);

				var postPosition = final_position - 1;
				if (postPosition == -1) postPosition = 0;
				Mojo.Log.info ("posicion: ", postPosition, " longitud: ", this.topic.posts.length);
				if (final_position > this.topic.posts.length) {
				//final_position = this.topic.posts.length;
					this.controller.get('v_scroller').mojo.revealBottom();
				} else if (final_position == 1) {
					this.controller.get('v_scroller').mojo.revealTop();
				}
				else {
					Mojo.Log.info(postPosition);
					this.controller.get('v_scroller').mojo.revealElement(this.topic.posts[postPosition].post_id);
				}
				this.currentPage = final_page;
				if(this.topic.post_id) {
					delete this.topic.post_id;
				}
			} else {

			}


			this.cmdMenuModel.items[4].label = this.currentPage + "/" + total;
			if(total == 1) {
				this.cmdMenuModel.items[4].disabled = true;
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
			this.controller.modelChanged(this.pageMenuModel);
			this.refreshing = false;


			//Mojo.Log.info("3rd part success");
		} catch (e) {
			Mojo.Log.error ("gotTopics ERROR: ",e);
		}

	};

TopicAssistant.prototype.checkSession = function() {
//TODO: call this, make it work :)
	//if (response.error == "reauthenticate" || (appSettings.Tapatalk.loggedIn && response.result == false))
	//If we logged in, but Taptalk says we are not, re-authenticate
	Mojo.Log.info("TopicAssistant.checkSession(): loggedIn: " + appSettings.Tapatalk.loggedIn + "Mobiquo_is_login: " + appSettings.Tapatalk.Mobiquo_is_login);
	if (appSettings.Tapatalk.loggedIn && !appSettings.Tapatalk.Mobiquo_is_login) {
		try 
		{
			appSettings.Tapatalk.loggedIn = false;
			Mojo.Log.info("TopicAssistant.checkSession(): re-authenticating ");
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
							//that.getTopics(listWidget, postsOffset, postsLimit);
							Mojo.Log.info("TopicAssistant.checkSession(), result: " + JSON.stringify(result));
						});
					//}
				}
			}, 2000);
			//this.getTopics(listWidget, postsOffset, postsLimit);
		}
		catch (ex) {
			Mojo.Log.error("Error in TopicAssistant.checkSession()" + ex);
		}
	}
	
}

TopicAssistant.prototype.topicDivider = function(model){
	//return model.post_id;
	return model.dividerDate;

};

TopicAssistant.prototype.postTap = function(event) {
	try {
		var args = {};
		var item = event.item;
		var originalEvent = event.originalEvent.target;
		var thelist = event.target;
		var model = event.item;

		//event.stopPropagation();

		Mojo.Log.info("postTap(): " + originalEvent.name);
		if (originalEvent.title == "attachments") {
/*
			list_element = Mojo.View.findParent(function(node){
				return node.hasClassName('palm-row');
			}, originalEvent, thelist);
			was_closed = !model.open;
			event.stop();
			// this drawer was previously closed or non-existant, now open it
			if (was_closed) {
				this.openDrawer(list_element, model, thelist);
				this.controller.modelChanged(model); // animate open
			}
			else {
				model.open = false;
				this.closeDrawer(list_element, model, thelist);
				this.controller.modelChanged(model); // animate close
			}

*/
		} else if(originalEvent.title == "xauthor_avatar") { //original author_avatar block
			//Mojo.Log.info("Author photo");
			if (appSettings.Tapatalk.config.disable_pm != "1") {
				var menuItem = [	//MenuData.PopupMenu.ViewProfile,
				MenuData.PopupMenu.SendPrivateMessage	//{},
				//MenuData.PopupMenu.FindPostsByUser
				];

				args = {
					author: item.post_author_name
				};
				//Mojo.Log.info(Object.toJSON(args));

				this.popupMenuModel = {
					onChoose: this.posterMenuPopupHandler.curry(args),
					placeNear: event.originalEvent.target,
					manualPlacement: false,
					//popupClass: "sub-menu-popup",
					items: menuItem
				};
				this.controller.popupSubmenu(this.popupMenuModel);
			}
		} else if(originalEvent.title == "author_avatar") { //mw modified author_avatar block with additional options.
			//Mojo.Log.info("Author photo");
			var menuItem = [];
			if (appSettings.Tapatalk.config.disable_pm != "1") {
				menuItem.push(MenuData.PopupMenu.SendPrivateMessage);
			}

			///*
			//if (appSettings.Tapatalk.config.can_profile)
			{
				menuItem.push(MenuData.PopupMenu.ViewProfile);
			}
			//*/
			if (appSettings.debug.detailedLogging) {
				Mojo.Log.info("can_profile: " + appSettings.Tapatalk.config.can_profile);
				logJSON("Topic-author_avatar tap, menuItems: " + JSON.stringify(menuItem));	
			}
			
			args = {
				author: item.post_author_name,
				author_id: item.post_author_id
			};
			//Mojo.Log.info(Object.toJSON(args));

			this.popupMenuModel = {
				onChoose: this.posterMenuPopupHandler.curry(args),
				placeNear: event.originalEvent.target,
				manualPlacement: false,
				//popupClass: "sub-menu-popup",
				items: menuItem
			};
			this.controller.popupSubmenu(this.popupMenuModel);
		} else if(originalEvent.title == "like_info" || originalEvent.title == "thanks_info") { //mw modified author_avatar block with additional options.
			Mojo.Log.info(originalEvent.title);
			logJSON("like/thanks tap, model:" + JSON.stringify(model,null,2));
			
			var menuItem = [];
			var ref = originalEvent.title == "like_info" ? model.likes_info : model.thanks_info;
			if (ref) {
				menuItem.push({ label: (originalEvent.title == "like_info" ? model.like_count + " users liked this post" : model.thanks_info.length + " users thanked this post"), command: "" });
				for (ii=0;ii<ref.length;ii++) {
					//getLikesInfo = function(item, model) {
					menuItem.push(
						{
							label: ref[ii].username,
							command: ref[ii].username //ref[ii].userid //"clicked" + ref[ii].username
						}
					);
				}
				if (originalEvent.title == "like_info" && model.like_count > ref.length) {
					menuItem.push(
							{
								label: ("and " + (model.like_count - ref.length) + " others"),
								command: "clickedOthers"
							}
						);
				}
				logJSON("Topic-author_avatar tap, menuItems: " + JSON.stringify(menuItem));	

				//This is pointless here..
				args = {
					author: item.post_author_name,
					author_id: item.post_author_id
				};
				//Mojo.Log.info(Object.toJSON(args));

				this.popupMenuModel = {
					onChoose: this.userMenuPopupHandler.curry(args),
					placeNear: event.originalEvent.target,
					manualPlacement: false,
					//popupClass: "sub-menu-popup",
					items: menuItem
				};
				this.controller.popupSubmenu(this.popupMenuModel);
			}
		}
		else {
			//Mojo.Log.info("NORMAL TAP: ", event.target.name);

			if (originalEvent.name === "link" || originalEvent.name === "anchor" || originalEvent.name === "email") {

				event.stop();
				//event.cancel();
				switch (originalEvent.name) {
					case "link":
					//Mojo.Log.info("LINK A ABRIR ", originalEvent.href);
						//Mojo.Log.info(Object.toJSON(parseUri(originalEvent.href).queryKey));
						if (isEmptyJSON(parseUri(originalEvent.href).queryKey)) {
							//Mojo.Log.info("VALID URI");
						}
						else {
							//Mojo.Log.info("NOT VALID URI");
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
				//Mojo.Log.info(Object.toJSON(args));

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

				if (item.can_like && !item.is_liked && !this.topic.is_closed) {
					this.popupMenuModel.items.push({
						label: $L("Like"),
						command: "likePost"
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
			else
				if (originalEvent.name === "image") {
					event.stop();
					//event.cancel();

					args = {
						post_id: item.post_id,
						element: originalEvent.src
					};
					//Mojo.Log.info(Object.toJSON(args));
					var menuItem = [{
						label: $L("View Image"),
						command: "openImage"
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

					if (item.can_like && !item.is_liked && !this.topic.is_closed) {
						this.popupMenuModel.items.push({
							label: $L("Like"),
							command: "likePost"
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
					if (!this._onHold) {
					if (item.can_edit && !this.topic.is_closed) {

						args = {
							post_id: item.post_id
						};

						this.popupMenuModel = {
							onChoose: this.postMenuPopupHandler.curry(args),
							placeNear: event.originalEvent.target,
							manualPlacement: false,
							//popupClass: "forum-menu-popup",
							items: [{
								label: $L("Quote Post"),
								command: "quotePost"
							}, {
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

					} else {
						//mw - normal scenario for someone else' post - quote. popup menu might be nice than requiring tap and hold
							/*
							if (this.topic.can_reply && !this.topic.is_closed && !this._onHold) {
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
							*/
							//mw test popup
								var args = {
									post_id: item.post_id
								};

								this.popupMenuModel = {
									onChoose: this.postMenuPopupHandler.curry(args),
									placeNear: event.originalEvent.target,
									items: []
								};

								if (this.topic.can_reply && !this.topic.is_closed) {
									this.popupMenuModel.items.push(MenuData.PopupMenu.QuotePost);
								}

								if (this.topic.can_edit && !this.topic.is_closed) {
									this.popupMenuModel.items.push(MenuData.PopupMenu.EditPost);
								}

								if (appSettings.Tapatalk.config.enableCopy) {
									this.popupMenuModel.items.push({});
									this.popupMenuModel.items.push(MenuData.PopupMenu.CopyPostURL);
									if (appSettings.config.twitter.authorized) {
										this.popupMenuModel.items.push({});
										this.popupMenuModel.items.push(MenuData.PopupMenu.TweetThis);
									}
								}

								//if (this.topic.can_like && !this.topic.is_closed) {
								if (item.can_like && !item.is_liked && !this.topic.is_closed) {
									this.popupMenuModel.items.push(MenuData.PopupMenu.LikePost);
								}

								//if (item.can_like && !this.topic.is_closed) {
								if (item.is_liked && !this.topic.is_closed) {
									this.popupMenuModel.items.push(MenuData.PopupMenu.UnlikePost);
								}

								if (item.can_thank && !this.topic.is_closed) {
									this.popupMenuModel.items.push(MenuData.PopupMenu.ThankPost);
								}

								this.controller.popupSubmenu(this.popupMenuModel);

							//end mw test popup
							}
						}
						else {
							if (!this.currentEvent) {
								this.currentEvent = item;
							}
							this._onHold = false;
						}
/*
						else {
							var args = {
								topicMode: true,
								newTopic: false,
								currentTopic: this.topic,
								editMode: false,
								quote_id: item.post_id
							};

							this.popupMenuModel = {
								onChoose: this.postMenuPopupHandler.curry(args),
								placeNear: event.originalEvent.target,
								manualPlacement: false,
								//popupClass: "forum-menu-popup",
								items: [{
									label: $L("Quote Post"),
									command: "quotePost"
								}, {
									label: $L("Copy Post URL"),
									command: "copyPostUrl"
								}]
							};

						}

*/
				}
		}

	} catch (e) {
		Mojo.Log.error("postTap error: ", e);
	}
};

TopicAssistant.prototype.postOnHold = function(event){

/*
	var target = event.target;
	this.currentElement = event.srcElement.up(".palm-row");
	this._onHold = true;
	var currentEvent = {};
	var listElement = this.controller.get("topicList");
	var rows = listElement.select(".palm-row");
	var modelIndex = rows.indexOf(this.currentElement);
*/
	// Every once in a while (haven't figured out a pattern, but it does it in the Forums patch thread),
	// this method will mis-calculate the modelIndex starting with the 2nd post (could happen later I guess).
	// Need to figure out a better way, and why the event does not have an index, like it does in the fmforums app!
	this.currentElement = event.srcElement.up(".palm-row");
	var dragElem = event.target.up("div.palm-row");
	var listElement = this.controller.get("topicsList");
	var rows = listElement.select(".topic-entry");//(".palm-row"); //mw changed to topic-entry class, because attachments use the palm-row class too, so there are too many elements returned by the selector.
	var modelIndex = rows.indexOf(this.currentElement);
	var item = this.topic.posts[modelIndex];

	if (appSettings.debug.dumpOnHoldItem) {
		try {
		Mojo.Log.info("event: " + event.target );
		Mojo.Log.info("modelIndex (calc'd): " + modelIndex );
		Mojo.Log.info("item (this.topic.posts[modelIndex]):" + Object.toJSON(item));
		Mojo.Log.info("post likes_info: " + JSON.stringify(item.likes_info));
		Mojo.Log.info("post thanks_info: " + JSON.stringify(item.thanks_info));
		} catch (ex) {}
	}
	var args = {
		post_id: item.post_id
	};

	this.popupMenuModel = {
		onChoose: this.postMenuPopupHandler.curry(args),
		placeNear: dragElem,
		items: []
	};

	if (this.topic.can_reply && !this.topic.is_closed) {
		this.popupMenuModel.items.push(MenuData.PopupMenu.QuotePost);
	}

	if (this.topic.can_edit && !this.topic.is_closed) {
		this.popupMenuModel.items.push(MenuData.PopupMenu.EditPost);
	}

	if (appSettings.Tapatalk.config.enableCopy) {
		this.popupMenuModel.items.push({});
		this.popupMenuModel.items.push(MenuData.PopupMenu.CopyPostURL);
		if (appSettings.config.twitter.authorized) {
			this.popupMenuModel.items.push({});
			this.popupMenuModel.items.push(MenuData.PopupMenu.TweetThis);
		}
	}

	//if (this.topic.can_like && !this.topic.is_closed) {
	if (item.can_like && !item.is_liked && !this.topic.is_closed) {
		this.popupMenuModel.items.push(MenuData.PopupMenu.LikePost);
	}

	//if (item.can_like && !this.topic.is_closed) {
	if (item.is_liked && !this.topic.is_closed) {
		this.popupMenuModel.items.push(MenuData.PopupMenu.UnlikePost);
	}

	if (item.can_thank && !this.topic.is_closed) {
		this.popupMenuModel.items.push(MenuData.PopupMenu.ThankPost);
	}

	this.controller.popupSubmenu(this.popupMenuModel);


};

TopicAssistant.prototype.postOnHoldEnd = function(event){
	if (this.currentElement === event.srcElement.up(".palm-row")) {
		this._onHold = true;
	}
	else {
		this._onHold = false;
	}
};

TopicAssistant.prototype.userMenuPopupHandler = function(target,choice) {
	try {
		try {
		Mojo.Log.info("TopicAssistant.userMenuPopupHandler, target:" + JSON.stringify(target));
		Mojo.Log.info("TopicAssistant.userMenuPopupHandler, choice:" + JSON.stringify(choice));
		} catch (ex1) {}
		if (choice == "" || choice == "clickedOthers") 
			return;
		Mojo.Log.info("TopicAssistant.userMenuPopupHandler - viewProfile selected.");
		appSettings.Tapatalk.user.get_user_info(choice, this.gotUserInfo.bind(this));
	} catch (e) {
		Mojo.Log.error("childForum forumMenuPopupHandler: ", e);
	}

};

TopicAssistant.prototype.posterMenuPopupHandler = function(target,choice) {
	try {
		try {
		Mojo.Log.info("TopicAssistant.posterMenuPopupHandler, target:" + JSON.stringify(target));
		Mojo.Log.info("TopicAssistant.posterMenuPopupHandler, choice:" + JSON.stringify(choice));
		} catch (ex1) {}
		//this._onChild = true;
		switch (choice) {
			case MenuData.PopupMenu.ViewProfile.command:
				Mojo.Log.info("TopicAssistant.posterMenuPopupHandler - viewProfile selected.");
				appSettings.Tapatalk.user.get_user_info(target.author, this.gotUserInfo.bind(this));
				break;
			case MenuData.PopupMenu.SendPrivateMessage.command:
				var args = {
					topicMode: false,
					replyMode: false,
					recipients: target.author
				};
				this.controller.stageController.pushScene("newPost", args);
				break;
			case MenuData.PopupMenu.FindPostsByUser.command:
				break;
		}
	} catch (e) {
		Mojo.Log.error("childForum forumMenuPopupHandler: ", e);
	}

};

TopicAssistant.prototype.gotUserInfo = function (response) {
	Mojo.Log.info("gotUserInfo()");
	try { 
		Mojo.Log.info("result: " + JSON.stringify(response));
		var args = {
				userProfile: response
			};
		if (response.user_id) {
			this.viewingProfile=true;
			this.controller.stageController.pushScene("userProfile", response);
		}
	} catch (ex) {
		Mojo.Log.error("Unable to print user info: " + ex);
	}	
}

TopicAssistant.prototype.likePostCallback = function (response){
	Mojo.Log.info("like/unlike/thankPostCallback()");
	try { Mojo.Log.info("result: " + JSON.stringify(response)); } catch (ex) {}
};

TopicAssistant.prototype.postMenuPopupHandler = function(target, choice){
	try {
		this._onChild = true;
		switch (choice) {
			case 'likePost':
				Mojo.Log.info("Like post clicked.");
				appSettings.Tapatalk.post.like_post(target.post_id, this.likePostCallback.bind(this));
				break;
			case 'unlikePost':
				Mojo.Log.info("Unlike post clicked.");
				appSettings.Tapatalk.post.unlike_post(target.post_id, this.likePostCallback.bind(this));
				break;
			case 'thankPost':
				Mojo.Log.info("Thank post clicked.");
				appSettings.Tapatalk.post.thank_post(target.post_id, this.likePostCallback.bind(this));
				break;
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
				//Mojo.Log.info(">>>>>>>>>>>>< URL DESTINO: ", target.element);
				//handleUrl(target.element);
				//Mojo.Log.info("appSettings.Tapatalk.config.get_id_by_url: ", appSettings.Tapatalk.config.get_id_by_url);
				if (appSettings.Tapatalk.config.get_id_by_url == "1") {
					//Mojo.Log.info(Object.toJSON(appSettings.currentForum.url));
					//var link = parseUri(target.element);
					//Mojo.Log.info(Object.toJSON(link));
					//Mojo.Log.info("haciendo amigos...");
					appSettings.Tapatalk.forum.get_id_by_url(target.element, this.handleUrlSucces.curry(target.element).bind(this), this.handleUrlFail.bind(this));
				}
				else {
					//Mojo.Log.info("handling URL locally");
					handleUrl(target.element);
				}

				break;
			case 'openImage':
				var imageItem = {
					url: target.element
				};
				var args = {
					allItems: [imageItem],
					currentItem: imageItem
				};
				this.controller.stageController.pushScene("imageViewer", args);
				break;
			case 'sendEmail':
				this.controller.serviceRequest('palm://com.palm.applicationManager', {
					method: 'open',
					parameters: {
						target: target.element
					}
				});
				break;
			case MenuData.PopupMenu.CopyPostURL.command:
				//Mojo.Log.info("GENERAR URI: ", this.topic.forum_id,this.topic.topic_id, target.post_id);
				var currentURI = generateURI(this.topic.forum_id, this.topic.topic_id, target.post_id, true);
				this.controller.stageController.setClipboard(currentURI, true);
				Mojo.Controller.getAppController().showBanner($L("URL Copied to Clipboard"), {}, {});
				break;
			case MenuData.PopupMenu.TweetThis.command:
				var currentURI = generateURI(this.topic.forum_id, this.topic.topic_id, target.post_id, true);
				var arguments = {
					tweet: "",
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
	}
	catch (e) {
		Mojo.Log.error("Topic  forumMenuPopupHandler: ", e);
	}

};

TopicAssistant.prototype.handleUrlSucces = function(url, response) {
	//Mojo.Log.info(url);
	//Mojo.Log.info(Object.toJSON(response));
	//Mojo.Log.info("entering handleUrlSuccess: ", Object.toJSON(response));
	if(response.forum_id || response.topic_id || response.post_id) {
		if(response.topic_id) {
			if (response.post_id) {
				var args = {topic_id: response.topic_id, post_id: response.post_id};
			} else {
				var args = {topic_id: response.topic_id};
			}
			this.controller.stageController.pushScene("topic", args);
		} else if (response.forum_id) {
			var parsedPath = getForumPath(appSettings.Tapatalk.forum.forums, response.forum_id, []);
			this.controller.stageController.pushScene("childForum", parsedPath);
		}
	} else {
		//Mojo.Log.info("Handling URL locally");
		handleUrl(url);
	}
};

TopicAssistant.prototype.handleUrlFail = function(response) {
	Mojo.Log.error(Object.toJSON(response));
};

TopicAssistant.prototype.totalPages = function(){
	var numOfPages = Math.ceil(this.total_post_num / 20);
	//Mojo.Log.info("PAGINAS TOTALES: ", numOfPages);
	return numOfPages;
};

TopicAssistant.prototype.propertyChanged = function(event) {
	try {
		var totalPages = this.totalPages();
		this.resetScroll = true;
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

TopicAssistant.prototype.getLikesCount = function(item, model) {
	//item is the thing being formatted, model is the entire list item
	try {
           //if (item) Mojo.Log.info("getLikesCount(), item: " + JSON.stringify(item));
	} catch (ex) {}
	if (item) {
		var formatted="";
		try {
			if (item > 0) {
			formatted = "Likes: " + item;
			}
		} catch (ex) {}
		return formatted;
	}
	else
		return "";
};

TopicAssistant.prototype.getLikesInfo = function(item, model) {
	//item is the thing being formatted, model is the entire list item
	try {
		//if (item) Mojo.Log.info("getLikesInfo(), item: " + JSON.stringify(item));
	} catch (ex) {}
	if (item) {
		var formatted="";
		try {
			if (item.length > 0) {
			formatted = "Likes: " + item.length;
			}
		} catch (ex) {}
		return formatted;
	}
	else
		return "";
};

TopicAssistant.prototype.getThanksInfo = function(item, model) {
	//item is the thing being formatted, model is the entire list item
	try {
		//if (item) Mojo.Log.info("getThanksInfo(), item: " + JSON.stringify(item));
	} catch (ex) {}
	if (item) {
		var formatted="";
		try {
			if (item.length > 0) {
			formatted = "Thanks: " + item.length;
			}
		} catch (ex) {}
		return formatted;
	}
	else
		return "";
};

TopicAssistant.prototype.onItemRendered = function(listWidget, itemModel, itemNode){

	//var listNode = itemNode.up('div[name="post"]');
				//listNode.setAttribute("class", "non-favorite");

	try {
//		if (!itemModel.likes_info || itemModel.like_count == 0) { 
		if (itemModel.likes_info && itemModel.likes_info.length > 0) { 
			itemNode.querySelector(".like-count-container").style.display="";
		}
		if (itemModel.thanks_info) { 
			itemNode.querySelector(".thanks-count-container").style.display="";
		}
		if (appSettings.debug.detailedLogging) {
			itemNode.querySelector(".topic-text-unformatted").style.display="";
		}
		else {
			itemNode.querySelector(".topic-text-unformatted").style.display="none";
		}
		
		if (appSettings.debug.dumpPosts && appSettings.debug.detailedLogging) {
			Mojo.Log.info("post_time: " + itemModel.post_time);
			logJSON("post itemModel: " + JSON.stringify(itemModel,null,2));
			if (itemModel.likes_info) {Mojo.Log.info("post likes_info: " + JSON.stringify(itemModel.likes_info));}
			if (itemModel.thanks_info) {Mojo.Log.info("post thanks_info: " + JSON.stringify(itemModel.thanks_info));}
			Mojo.Log.info("like-count-container: " + itemNode.querySelector(".like-count-container").style.display); //.style
			Mojo.Log.info("thanks-count-container: " + itemNode.querySelector(".thanks-count-container").style.display); //.style
		}
	}
	catch (ex) { Mojo.Log.info("Exception: " + ex); }

	//Mojo.Log.info("CAN REPLY", this.topic.can_reply);
	if (!this.topic.can_reply) {
		//listNode.removeAttribute("x-mojo-tap-highlight")
		//itemNode.children[0].childNodes[0].children[0].removeAttribute("x-mojo-tap-highlight");
		itemNode.removeAttribute("x-mojo-tap-highlight");

	}

	if (itemModel.attachments && itemModel.attachments.length > 0) {

		var attachmentImages = [];
		var attachmentFiles = [];
		var attachmentsLen = itemModel.attachments.length;
		//Mojo.Log.info(attachmentsLen);
		var j = 0;
		var k = 0;
		for (var i=0; i < attachmentsLen; i++) {
			//if (appSettings.debug.dumpPosts)
			if (appSettings.debug.detailedLogging) {
			Mojo.Log.info("ATTACHMENT: ", Object.toJSON(itemModel.attachments[i]));
			}
			if(itemModel.attachments[i].content_type == "image") {
				var startingHTML = "";
				var endingHTML = "";
				var positionClass = "";
				switch(j) {
					case 0:
						//startingHTML = "<div class='attachedImagesRow' name='imgButton'>";
						positionClass = "left";
						break;
					case 1:
						positionClass = "center";
						break;
					case 2:
						positionClass = "right";
						endingHTML = "<div class='clear'></div>";
						break;
				}
				itemModel.attachments[i].positionClass = positionClass;
				//itemModel.attachments[i].startingHTML = startingHTML;
				itemModel.attachments[i].endingHTML = endingHTML;
				itemModel.attachments[i].absolutePosition = k;
				attachmentImages.push(itemModel.attachments[i]);
				if (j == 2) {
					j = 0;
				}
				else {
					j++;
				}
				k++;
			} else {
				attachmentFiles.push(itemModel.attachments[i]);
			}
		};

		//Mojo.Log.info("NUMERO DE IMAGENES: ", attachmentImages.length);

		var element = Mojo.View.convertToNode('<div name="attachments" class="attachments-wrapper">' +
			'<div name="attachment-images" style="display: table-cell;"></div><div name="attachment-files">&nbsp;</div></div>', this.controller.window.document);

		itemNode.querySelector(".post-wrapper").appendChild(element);

		var placeholderImages = itemNode.querySelector('div[name="attachment-images"]');
 		var populateImages = function(items){
			//Mojo.Log.info("rendering photos...");

		if (appSettings.Tapatalk.loggedIn) {
			placeholderImages.innerHTML = Mojo.View.render({
				template: 'topic/attachmentImageItem',
				collection: items,
				formatters: {
					thumbnail_url: appSettings.Formatting.chooseThumbnailOrUrl.bind(this)
				}
			});
		} else {
			placeholderImages.innerHTML = Mojo.View.render({
				template: 'topic/attachmentItemNoFeedback',
				collection: items,
				formatters: {
					thumbnail_url: appSettings.Formatting.chooseThumbnailOrUrl.bind(this)
				}
			});

		}
		};

		populateImages(attachmentImages);

		this.controller.listen(placeholderImages, Mojo.Event.tap, this.attachmentImageTapHandler.bindAsEventListener(this, attachmentImages));


		var placeholder = itemNode.querySelector('div[name="attachment-files"]');
		var populate = function(items){
			placeholder.innerHTML = Mojo.View.render({
				template: 'topic/attachmentItem',
				collection: items,
				formatters: {}
			});
		};

		//Mojo.Log.info(Object.toJSON(itemModel.attachments));
		populate(attachmentFiles);

		// event listener
		this.controller.listen(element, Mojo.Event.tap, this.attachmentTapHandler.bindAsEventListener(this, itemModel));

		//this.controller.instantiateChildWidgets(itemNode, itemModel);


	}
};

TopicAssistant.prototype.addDrawerToItem = function(itemNode, itemModel) {
/*
		var len = itemModel.attachments.length;
		for(var i=0; i < len; i++) {
			itemModel.attachments[i].id = Date.now();
		}

*//*
		var element = Mojo.View.convertToNode('<div name="rowdrawer" class="">' + // x-mojo-element="Drawer">' +
		'<div name="attachments_placeholder" ></div>' +
		'</div>', this.controller.window.document);

		itemNode.querySelector(".attachments-wrapper").appendChild(element);

*/
		var element = Mojo.View.convertToNode('<div name="rowdrawer" class="" x-mojo-element="Drawer"> '
											  + '<div name="attachments_placeholder"></div>'
											  + '</div>', this.controller.window.document);

		itemNode.querySelector('div[name="attachments"]').appendChild(element);

		//Mojo.Log.info(Object.toJSON(itemModel.attachments));

		var placeholder = element.querySelector('div[name="attachments_placeholder"]');
		var populate = function(items){
			placeholder.innerHTML = Mojo.View.render({
				template: 'topic/attachmentItem',
				collection: items,
				formatters: {}
			});
		};

		populate(attachmentFiles);

		// event listener
		//this.controller.listen(element, Mojo.Event.tap, this.drawerTapHandler.bindAsEventListener(this, itemModel));

		this.controller.instantiateChildWidgets(itemNode, itemModel);

};

TopicAssistant.prototype.attachmentImageTapHandler = function(event, itemModel) {
		Mojo.Log.info("attachmentImageTapHandler called.");
		if (appSettings.Tapatalk.loggedIn) 
		{			
		var target = event.target, name, is_sms = false;
		//mw 1/5/2017 - when not signed in, a different template is used that does not have an imageItem class.
		var rowElement = appSettings.Tapatalk.loggedIn ? event.srcElement.up(".imageItem") : event.srcElement.up(".palm-row");

		event.stop();
		if (!rowElement) {
			Mojo.Log.error(".imageItem or .palm-row rowElement not found for image.");
		}
		var position = rowElement.getAttribute("position");

	var args = {
		allItems: itemModel,
		currentItem: itemModel[position]
	};
	this.controller.stageController.pushScene("imageViewer", args);

//Mojo.Log.info(this.document.cookie);

/*		var request = new Ajax.Request(url, {
			method: 'get',
			requestHeaders: {Cookie: appSettings.Tapatalk.headers},
			contentType: 'application/binary',
			evalJSON: false,
			onComplete: this.testComplete.bind(this),
			onSuccess: this.testSuccess.bind(this),
			onFailure: this.testFailure.bind(this)
		});

*/
		} else {
			this.attachmentTapHandler(event, itemModel);
		}
	};

TopicAssistant.prototype.attachmentTapHandler = function(event, itemModel) {
		Mojo.Log.info("attachmentTapHandler called.");
		var target = event.target, name, is_sms = false;
		var rowElement = event.srcElement.up(".palm-row");
		var model = event.item;
		var is_sms =false;
		var preventClose = false;

		event.stop();

		if (!rowElement) {
			Mojo.Log.error(".palm-row rowElement not found for attachment.");
		}
		var url = rowElement.getAttribute("value");
		var type = rowElement.getAttribute("type");

		Mojo.Log.info("attachmentTapHandler: URL: " + url );
		Mojo.Log.info("attachmentTapHandler: type: " + type );
		try {
		//logJSON("attachment rowElement: " + JSON.stringify(rowElement,null,2));
		logJSON("attachment itemModel length: " + itemModel.attachments + "\n" + JSON.stringify(itemModel.attachments,null,2));
		} catch (ex) { Mojo.Log.info("Unable to log model.."); }
		var filename = itemModel.filename;
		//get filename..
		Mojo.Log.info("Finding filename..");
		for (ii=0;ii<itemModel.attachments.length;ii++) {
			Mojo.Log.info(itemModel.attachments[ii]);
			if (itemModel.attachments[ii].url == url) {
				filename = itemModel.attachments[ii].filename;
			}
		}
		if (!filename) {
			//need a filename..
			filename="randomefile.dat";
		}
		if (true || type == "pdf" || type == "other") {
			if (true) {
			this.controller.serviceRequest('palm://com.palm.applicationManager', {
				method: 'open',
				parameters: {
					target: url
				}
			});
			}
			else {
			//mw let's try saving attachments instead of opening them
			Mojo.Log.info("Attempting to save " + filename + "(" + url + ")");
			Mojo.Log.info("sending cookieHeader: " + JSON.stringify(appSettings.Tapatalk.headers));
			this.controller.serviceRequest('palm://com.palm.downloadmanager/', {
				method: 'download',
				parameters: {
					target: url,
					//mime: "image/jpg",
					targetDir: "/media/internal/downloads/",
					targetFilename: filename,
					keepFilenameOnRedirect: false,
					cookieHeader: appSettings.Tapatalk.headers,
					//authToken: appSettings.Tapatalk.headers,
					subscribe: true
				},
				onSuccess: function(response){
					if (response.completed) {
						Mojo.Log.info("DOWNLOAD MANAGER target onSuccess: ", JSON.stringify(response));
					}
					else {
						Mojo.Log.info("DOWNLOAD MANAGER target onSuccess, not complete yet: ", JSON.stringify(response));
					}
				},
				onFailure: function(e){
					Mojo.Log.info("Download failed: ", Object.toJSON(e));
				}
			});
			}
			//mw end save attachment code
		}
		//else if (type == "pdf") {
		//}

//Mojo.Log.info(this.document.cookie);

/*		var request = new Ajax.Request(url, {
			method: 'get',
			requestHeaders: {Cookie: appSettings.Tapatalk.headers},
			contentType: 'application/binary',
			evalJSON: false,
			onComplete: this.testComplete.bind(this),
			onSuccess: this.testSuccess.bind(this),
			onFailure: this.testFailure.bind(this)
		});

*/
	};

TopicAssistant.prototype.testComplete = function(response) {
	//Mojo.Log.info("Complete: ", Object.toJSON(response.responseText));
	//Mojo.Log.error("EXITO: ", Object.toJSON(response));
	//Mojo.Log.info(response.getAllResponseHeaders());
	//this.controller.get("debug").innerHTML = response.getAllHeaders();
	var arrHeader = response.getAllResponseHeaders().split("\n");
	// Iterate through the collection of returned headers
	for (i = 0; i < arrHeader.length; i++) {
		//Mojo.Log.info(arrHeader[i]);
	}
	this.controller.get("remote_image").setAttribute("src","data:image/jpeg;base64," + makeBinaryContent(response.responseText));
	//Mojo.Log.info ("done", makeBinaryContent(response.responseText) );
};

TopicAssistant.prototype.testSuccess = function(response) {
	//Mojo.Log.info("Success: ", Object.toJSON(response.responseText));
	var arrHeader = response.getAllResponseHeaders().split("\n");
	// Iterate through the collection of returned headers
	for (i = 0; i < arrHeader.length; i++) {
		//Mojo.Log.info(arrHeader[i]);
	}

	//var img = new Image();
//img.src = response.responseText;

};

TopicAssistant.prototype.testFailure = function(response) {
	Mojo.Log.error("FALLO: ", Object.toJSON(response));
	//Mojo.Log.info(response.getAllHeaders().split("^M"));
	this.controller.get("debug").innerHTML = response.getAllResponseHeaders();



};
		// opens drawer
TopicAssistant.prototype.openDrawer = function( row_element, model, list_element ) {

	var drawerElement = row_element.querySelector('div[name="rowdrawer"]');
if (!(drawerElement != null)) {
	this.addDrawerToItem(row_element, model);
}
	model.open = true;
	row_element.addClassName('open');

/*
		this.currentlyOpenDrawer = {
			model: model,
			element: row_element,
			list: list_element
		};

*/
		//row_element._ignoreSwipeToDelete = true;
		//row_element._ignoreReorderable = true;
	};

	// closes currently open drawer
TopicAssistant.prototype.closeDrawer = function( row_element, model, list_element ) {
		// a drawer is open, now close it
		if ( model.open ) {
			model.open = false;

			var widgetAssistant = row_element.querySelector('div[name="rowdrawer"]')._mojoController.assistant;
			var originalScrollIntoView = widgetAssistant.scrollIntoView;
			widgetAssistant.scrollIntoView = Mojo.doNothing;
			this.controller.modelChanged(model);
			widgetAssistant.scrollIntoView = originalScrollIntoView;

			//this.currentlyOpenDrawer.element.removeClassName('open');

			//this.currentlyOpenDrawer.element._ignoreSwipeToDelete = false;

			//this.currentlyOpenDrawer = undefined;
		}
	};


TopicAssistant.prototype.shake = function(event){
	Mojo.Log.error("Shaking with magnitude: ", event.magnitude);
	//Mojo.Controller.getAppController().showBanner(event.magnitude, "", "");
	this.scrim.show();
	if (!this.refreshing) {
		this.refreshScene();
	}
};

TopicAssistant.prototype.metaTap = function(event){
	Mojo.Log.info("Key pressed;  meta:", (event.originalEvent.metaKey === true), " - ", event.originalEvent.keyCode);
	if (event.originalEvent.metaKey === true) {
		//Mojo.Log.info("METATAP PRESSED");
		this.metaTapPressed = true;

		if (event.originalEvent.keyCode == 84) {
			//this.controller.getSceneScroller().mojo.scrollTo(0, 0, false);
			//Another possible method:
			//list.mojo.revealItem(0, false);
			this.controller.get('topicsList').mojo.revealItem(0, true);
		}

		if (event.originalEvent.keyCode == 66) {
			//Mojo.Log.info("Scroller size: " + Object.toJSON(this.controller.getSceneScroller().mojo.scrollerSize()));
			//Mojo.Log.info("Scroller height: " + this.controller.getSceneScroller().mojo.scrollerSize().height);
			//Mojo.Log.info("Scroller position: " + Object.toJSON(this.controller.getSceneScroller().mojo.getScrollPosition()));
			//this.controller.getSceneScroller().mojo.revealBottom();
			//this.controller.getSceneScroller().mojo.scrollTo(200, 200, true);

			///*
			var lengthList;
			lengthList = this.controller.get('topicsList').mojo.getLength();

			//Mojo.Log.info("topicList length: " + this.controller.get('topicList').mojo.length);
			Mojo.Log.info("topicList length: " + this.controller.get('topicsList').mojo.getLength());
			//Mojo.Log.info("topicList length: " + JSON.stringify(this.controller.get('topicList').mojo));
			this.controller.get('topicsList').mojo.revealItem(lengthList, true);
			//*/

		}
		//Key pressed;  meta: true  -  66 (B)
		//Key pressed;  meta: true  -  84 (T)

	};
};

TopicAssistant.prototype.metaTapRelease = function(event){
	Mojo.Log.info("Key released;  meta:", (event.originalEvent.metaKey === true), " - ", event.originalEvent.keyCode);
	if (event.originalEvent.metaKey === true) {
		//Mojo.Log.info("METATAP RELEASED");
		this.metaTapPressed = false;
	}
	else if (!this.searchBarState) {
		Mojo.Log.info("Key released;  meta:", (event.originalEvent.metaKey === true), " - ", event.originalEvent.keyCode);
		if (event.originalEvent.keyCode == 8) {
			//this.controller.getSceneScroller().mojo.scrollTo(0, 0, false);
			//Another possible method:
			//list.mojo.revealItem(0, false);
			this.controller.get('topicsList').mojo.revealItem(0, true);
		}

		if (event.originalEvent.keyCode == 13) {
			//Mojo.Log.info("Scroller size: " + Object.toJSON(this.controller.getSceneScroller().mojo.scrollerSize()));
			//Mojo.Log.info("Scroller height: " + this.controller.getSceneScroller().mojo.scrollerSize().height);
			//Mojo.Log.info("Scroller position: " + Object.toJSON(this.controller.getSceneScroller().mojo.getScrollPosition()));
			//this.controller.getSceneScroller().mojo.revealBottom();
			//this.controller.getSceneScroller().mojo.scrollTo(200, 200, true);

			///*
			var lengthList;
			lengthList = this.controller.get('topicsList').mojo.getLength();

			//Mojo.Log.info("topicList length: " + this.controller.get('topicList').mojo.length);
			Mojo.Log.info("topicList length: " + this.controller.get('topicsList').mojo.getLength());
			//Mojo.Log.info("topicList length: " + JSON.stringify(this.controller.get('topicList').mojo));
			this.controller.get('topicsList').mojo.revealItem(lengthList, true);
			//*/

		}
	}
};

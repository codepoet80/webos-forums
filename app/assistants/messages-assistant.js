function MessagesAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  //this.parentForum = args;

	  this.messagesListTapHandler = this.messagesListTap.bindAsEventListener(this);
	  this.forumMenuTapHandler = this.forumMenuTap.bindAsEventListener(this);
	  this.messageDeleteHandler = this.deleteMessage.bindAsEventListener(this);
	  this.total_unread_num = 0;
	  this.total_messages_num = 0;
	  this.total_boxes_size = 0;
	  this.firstLoad = true;
	  this.canSendMessages = true;
	  this.messagesList = {};
	  this.messagesList.items = [];
	  this.folders = {};
	  if (appSettings.Tapatalk.config.version.toLowerCase().startsWith("sm")) {
	  	this.currentFolder = "inbox";
	  }
	  else {
	  	this.currentFolder = 0;
	  }
	  this.currentFolderType ="";
	  //this.mode = "recent";
	  //this.recentNumber = 20;

	  //this.currentForum = {};
	this._searchKey = this._searchKey.bindAsEventListener(this);
	this._focusSearch = this._focusSearch.bindAsEventListener(this);
	this.searchBarState = false;
	this.headerTapHandler = this.headerTap.bindAsEventListener(this);

	//for metatap handling
	this.metaTapPressed = false;
	this.metaTapHandler = this.metaTap.bindAsEventListener(this);
	this.metaTapReleaseHandler = this.metaTapRelease.bindAsEventListener(this);

};

MessagesAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */

	/* setup widgets here */

	/* add event handlers to listen to events from widgets */
	appSettings.unreadMessagesCount = 0;
	appSettings.currentScene = "messages";
		//Mojo.Log.info("RecentPosts SETUP");

		this.controller.get("scrim-minimized").hide();
		this.controller.get("forum-image-small").src = appSettings.currentForum.logo;

	this.appMenuModel = formatMainAppMenus();

	this.controller.setupWidget(Mojo.Menu.appMenu, {
		omitDefaultItems: true
	}, this.appMenuModel);


	this.commandMenuModel = formatMainCommandMenus();
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'fade-bottom'}, this.commandMenuModel);

	this.setupWaitingFeedback();

	this.controller.get("header_button").innerHTML = $L("Inbox");
	this.controller.get("forum_name").innerHTML = appSettings.currentForum.name;


	this.messagesListAttrs = {
		listTemplate: 'forums/forumContainer',
		itemTemplate: 'messages/messageItem',
		dividerFunction: this.messageDivider,
		dividerTemplate: 'messages/date_separator',
		emptyTemplate: 'messages/emptyFolder',
		onItemRendered: this.renderItem.bind(this),
		lookahead: 15,
		renderLimit: 25,
		uniquenessProperty: 'msg_id',
		itemsCallback: this.getMessages.bind(this),
		hasNoWidgets: true,
		swipeToDelete: true,
		formatters: {
			msg_state: appSettings.Formatting.formatMessageStatus.bind(this),
			sent_date: appSettings.Formatting.formatMessageDate.bind(this),
			msg_to: appSettings.Formatting.formatMessageRecipients.bind(this)
		}

	};


	this.controller.setupWidget('messagesList', this.messagesListAttrs, this.messagesList);

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

	this.controller.listen('messagesList', Mojo.Event.listTap, this.messagesListTapHandler);
	this.controller.listen(this.controller.get("header_button"), Mojo.Event.tap, this.forumMenuTapHandler);
	this.controller.listen('messagesList', Mojo.Event.listDelete, this.messageDeleteHandler);
	this.controller.listen(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);


};

MessagesAssistant.prototype.refreshScene = function() {
	Mojo.Log.info("MessagesAssistant.refreshScene() called... logged in? " + appSettings.Tapatalk.loggedIn);
	var that = this;
	//Prob shouldn't do this unless we are logged in
	appSettings.Tapatalk.privateMessage.get_box_info(this.got_box_info.bind(this));

/*
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

*/
};

MessagesAssistant.prototype.got_box_info = function(response) {

	try { logJSON("MessagesAssistant.get_box_info SUCCESS: " + JSON.stringify(response,null,2)); }
	catch (ex) { 
		Mojo.Log.info("Caught exception logging response: " + ex);
		Mojo.Log.info("MessagesAssistant.get_box_info SUCCESS: " + JSON.stringify(response,null,2));
	}

	/** {"message_room_count": 380, "list":
	 * [{"box_id": "0", "box_name": "", "msg_count": 70, "unread_count": 0, "box_type": "INBOX"},
	 * {"box_id": "-1", "box_name": "", "msg_count": 50, "unread_count": 0, "box_type": "SENT"},
	 * {"box_id": "1", "box_name": "", "msg_count": 0, "unread_count": 0, "box_type": ""}]}
	 *
	 */

	Mojo.Log.info("got_box_info, response.result: [" + response.result + "]");
	if ( (response.result && response.result == true) || (response.list && response.list.length > 0) ) {
		Mojo.Log.info("Processing folder list...");
		var messagesUsed = 0;
		var that = this;
		if (response.list)
		{
			response.list.each(function(folder) {
				messagesUsed = messagesUsed + folder.msg_count;
				if (that.currentFolder == folder.box_id) {
					that.total_messages_num = folder.msg_count;
					if (folder.box_name) {
						that.controller.get("header_button").innerHTML = folder.box_name;
					} else {
						if(folder.box_type == "INBOX") {
							that.controller.get("header_button").innerHTML = $L("Inbox");
						} else if (folder.box_type == "SENT") {
							that.controller.get("header_button").innerHTML = $L("Sent Items");
						}
					}
				}
			});
		}
		if (response.message_room_count) { 
			messagesUsed = messagesUsed + response.message_room_count;
		}
		this.total_boxes_size = messagesUsed;
		//Mojo.Log.info("MENSAJES TOTALES: ", that.total_messages_num);
		this.folders = response;

		this.controller.get('messagesList').mojo.setLengthAndInvalidate(this.total_messages_num);
	}
	else {
		Mojo.Log.warn("got_box_info: result=false, msg=" + response.result_text);
		logJSON("MessagesAssistant.get_gox_info, response: " + JSON.stringify(response,null,2));
	};
};

MessagesAssistant.prototype.aboutToActivate = function () {
	//$$('body')[0].addClassName('dark-backdrop');

	try {
	//Mojo.Log.info("REACTIVANDO...", this.total_topic_num);
	//Mojo.Log.info("Forums: RecentPosts aboutToActivate");
/*
	if (!this.firstLoad) {
		this.controller.get('messagesList').mojo.setLengthAndInvalidate(this.recentNumber);
	}
	var that = this;
	appSettings.Tapatalk.privateMessage.get_box_info(function(response) {
		Mojo.Log.info(Object.toJSON(response));
		that.folders = response;

	});
	this.firstLoad = false;

*/

	//Mojo.Log.info("FORO POR RECONSTRUCCION: ", current.forum_name);
/*	var that = this;
	tapatalk.forum.get_forum(function(returned){
		//Mojo.Log.info("Tapatalk GET_FORUM: ", Object.toJSON(returned));
		//that.controller.modelChanged(tapatalk.forum);
		that.parentForum.child = that.composeForums();
		that.controller.modelChanged(that.parentForum);

	//Mojo.Controller.stageController.pushScene("forums");
	});
*/


	} catch (e) {
		Mojo.Log.error("MessagesAssistant aboutToActivate ERROR", e);
	}
};


MessagesAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

	//this.controller.get("topicCounter").hide();

/*
	if (!this.parentForum.sub_only) {
		//this.controller.get('forum_name_noButton').hide();
		this.controller.get("forums").hide();
		if (!!this.total_topic_num) {
			this.controller.get("forum_count").innerHTML = this.total_topic_num;
			//this.controller.get("topicCounter").show();
			//this.controller.get('messagesList').mojo.setLengthAndInvalidate(0);
		}
	}
	else {
		//this.controller.get('forum_name').hide();
		//this.controller.get("topics").hide();
	}
	//Mojo.Log.info(Object.toJSON(this.parentForum));

*/

this.refreshScene();
//this.scrim.hide();
//this.currentFolder = 0;
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


MessagesAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
		this.controller.get('search-field').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
		this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);

	//metatap support
	this.controller.stopListening(this.controller.document, Mojo.Event.keydown, this.metaTapHandler, true);
	this.controller.stopListening(this.controller.document, Mojo.Event.keyup, this.metaTapReleaseHandler, true);

	//$$('body')[0].removeClassName('dark-backdrop');
};

MessagesAssistant.prototype.metaTap = function(event){
	Mojo.Log.info("Key pressed;  meta:", (event.originalEvent.metaKey === true), " - ", event.originalEvent.keyCode);
	if (event.originalEvent.metaKey === true) {
		//Mojo.Log.info("METATAP PRESSED");
		this.metaTapPressed = true;

		if (event.originalEvent.keyCode == 84) {
			//this.controller.getSceneScroller().mojo.scrollTo(0, 0, true);
			//Another possible method:
			this.controller.get('messagesList').mojo.revealItem(0, true);
		}

		if (event.originalEvent.keyCode == 66) {
			//Mojo.Log.info("Scroller size: " + Object.toJSON(this.controller.getSceneScroller().mojo.scrollerSize()));
			//Mojo.Log.info("Scroller height: " + this.controller.getSceneScroller().mojo.scrollerSize().height);
			//Mojo.Log.info("Scroller position: " + Object.toJSON(this.controller.getSceneScroller().mojo.getScrollPosition()));
			//this.controller.getSceneScroller().mojo.revealBottom();
			//this.controller.getSceneScroller().mojo.scrollTo(200, 200, true);

			///*
			var lengthList;
			lengthList = this.controller.get('messagesList').mojo.getLength();

			//Mojo.Log.info("messagesList length: " + this.controller.get('messagesList').mojo.length);
			Mojo.Log.info("messagesList length: " + this.controller.get('messagesList').mojo.getLength());
			//Mojo.Log.info("messagesList length: " + JSON.stringify(this.controller.get('messagesList').mojo));
			this.controller.get('messagesList').mojo.revealItem(lengthList, true);
			//*/

		}
		//Key pressed;  meta: true  -  66 (B)
		//Key pressed;  meta: true  -  84 (T)

	};
};

MessagesAssistant.prototype.metaTapRelease = function(event){
	//Mojo.Log.info("Key released;  meta:", (event.originalEvent.metaKey === true), " - ", event.originalEvent.keyCode);
	if (event.originalEvent.metaKey === true) {
		//Mojo.Log.info("METATAP RELEASED");
		this.metaTapPressed = false;
	};
};


MessagesAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
	this.controller.stopListening('messagesList', Mojo.Event.listTap, this.messagesListTapHandler);
	this.controller.stopListening(this.controller.get("header_button"), Mojo.Event.tap, this.forumMenuTapHandler);
	this.controller.stopListening(this.controller.get("header"), Mojo.Event.tap, this.headerTapHandler);

};
MessagesAssistant.prototype.doForumClose = function() {
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


MessagesAssistant.prototype.handleCommand = function(event) {

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
			Mojo.Log.error("handleCommand ERROR: ", e);
		}
};

MessagesAssistant.prototype.setupWaitingFeedback = function() {
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

MessagesAssistant.prototype.setWaitingFeedback = function(activate) {
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
			//this.timeout = null;
		}
	}
	//this.timeoutRequesting = null;

};

MessagesAssistant.prototype.forumMenuTap = function(event) {

	try {
		var place = event.target.id;
		event.stopPropagation();
		//Mojo.Log.info("MessagesAssistant.forumMenuTap, event:" + event);
		//Mojo.Log.info("Folders: " + JSON.stringify(this.folders));
		if (appSettings.debug.detailedLogging) {
			logJSON("forumMenuTap, Folders: " + JSON.stringify(this.folders,null,2));
		}

		var subMenuItems = [];

		subMenuItems.push({label:$L("New message"), command: "new-message", disabled: !this.canSendMessages});
		subMenuItems.push({label:$L("Folders")});

		var that = this;
		if (this.folders && this.folders.list) {
		this.folders.list.each(function(folder) {
			var selected = false;
			if (folder.box_id == that.currentFolder) selected = true;
			if (folder.box_type == "INBOX") {
				if (!folder.box_name) {
					subMenuItems.push({
						label: $L("Inbox"),
						command: folder.box_id,
						chosen: selected
					});
				} else {
					subMenuItems.push({
						label: folder.box_name,
						command: folder.box_id,
						chosen: selected
					});
				}
			}
			else
				if (!folder.box_name) {
				if (folder.box_type == "SENT") {
					subMenuItems.push({
						label: $L("Sent Items"),
						command: folder.box_id,
						chosen: selected
					});
					}
				} else {
					subMenuItems.push({
						label: folder.box_name,
						command: folder.box_id,
						chosen: selected
					});
				}
		});
		}
		else {
			Mojo.Log.warn("Messages.forumMenuTap had no folders to iterate through.");
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
		Mojo.Log.error("MessagesAssistant.forumMenuTap ERROR: ", e);
		logJSON("Stack: " + e.stack);
		
	}
};

MessagesAssistant.prototype.forumMenuPopupHandler = function(choice) {
	try {

	//this.scrim.show();

		if (choice) {
			switch (choice) {
				case 'new-message':
						var args = {
							topicMode: false,
							replyMode: false
						};
						this.controller.stageController.pushScene("newPost", args);
					break;
				default:
					this.currentFolder = choice;

					var that = this;
					this.folders.list.each(function(folder){
						if (folder.box_id == choice) {
							if (!folder.box_name) {
								if (folder.box_type == "INBOX") {
									that.controller.get("header_button").innerHTML = $L("Inbox");
								}
								else
									if (folder.box_type == "SENT") {
										that.controller.get("header_button").innerHTML = $L("Sent Items");
									}
							}
							else {
								that.controller.get("header_button").innerHTML = folder.box_name;
							}
							that.currentFolderType = folder.box_type;
						}
					});

					//this.controller.modelChanged(this.messagesListAttrs);
					//this.controller.setupWidget('messagesList', this.messagesListAttrs, this.messagesList);

					this.controller.get('messagesList').mojo.setLengthAndInvalidate(this.total_messages_num);
					this.controller.getSceneScroller().mojo.revealTop();
			}
		}
	} catch (e) {
		Mojo.Log.error("forumMenuPopupHandler ERROR: ", e);
	}

};

MessagesAssistant.prototype.messagesListTap = function(event) {
	var item = event.item;
	var index = event.index;

	var args = {box_id: this.currentFolder,
				message_id: item.msg_id};

	this.controller.stageController.pushScene("messageDetail", args);


};

MessagesAssistant.prototype.getMessages = function(listWidget,postsOffset,postsLimit) {
	var last_number = postsOffset + postsLimit;
	//var that = this;

	try {

 		//this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
  		if (!this.requestFeedbackTimeout) this.setWaitingFeedback(true);
		this.controller.get('topicCounter').addClassName('hidden');

			appSettings.Tapatalk.privateMessage.get_box(this.currentFolder, postsOffset, last_number, this.gotMessages.curry(listWidget, postsOffset, postsLimit).bind(this));
	}
	catch (e) {
		Mojo.Log.error("getMessages ERROR: ", e);
	}

};

MessagesAssistant.prototype.gotMessages = function(listWidget, postsOffset, postsLimit, response) {

	try {

		//Mojo.Log.info("get_box SUCCESS: ", Object.toJSON(response));

		if (!response.error) {

			if (response.result == false) {
					var alertMessage = $L(response.result_text);
					Mojo.Controller.errorDialog(alertMessage);
					this.canSendMessages = false;

			} else {
				listWidget.mojo.noticeUpdatedItems(postsOffset, response.list);
				if (response.total_message_count != this.total_message_count && this.total_message_count != 0) {
					listWidget.mojo.setLengthAndInvalidate(response.total_message_count);
				}
				else {
					listWidget.mojo.setLength(response.total_message_count);
				}

				this.total_message_count = response.total_message_count;

				if (this.total_message_count != "0") {
					this.controller.get("forum_count").innerHTML = this.total_message_count;
					this.controller.get('topicCounter').removeClassName('hidden');
				}
				else {
					this.controller.get('topicCounter').addClassName('hidden');

				}

				/*
	 var that = this;
	 this.folders.list.each(function(folder){
	 if (folder.box_id == this.currentFolder) {
	 that.controller.get("forum_name").innerHTML = folder.box_name;
	 }
	 });
	 */
				//clearTimeout(this.requestFeedbackTimeout);
				/*
	 if (this.mode == "subscribed") {
	 appSettings.Tapatalk.subscription.get_subscribed_forum(this.gotForums.bind(this));
	 }
	 */
			}
			this.setWaitingFeedback(false);
		} else {
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
								that.getMessages(listWidget, postsOffset, postsLimit);
							});
						//}
					}
				}, 2000);
				//this.getMessages(listWidget, postsOffset, postsLimit);
			}
		}
		//this.setWaitingFeedback(false);

	}
	catch (e) {
		Mojo.Log.error(e);
	}
};

MessagesAssistant.prototype.messageDivider = function(model){
	//Mojo.Log.info(itemModel.niceDate);
	//return itemModel.niceDate;
	return model.niceDate;

};

/*
MessagesAssistant.prototype.startRequestTimer = function () {
this.start_date = new Date();
this.timer = this.controller.window.setInterval(this.setWaitingFeedback(true), 1000);
};

*/
MessagesAssistant.prototype.deleteMessage = function(event) {

		//appSettings.forums.splice(event.index,1);
		var item = event.item;
		var index = event.index;

		var that = this;
		appSettings.Tapatalk.privateMessage.delete_message(item.msg_id, this.currentFolder, function(response) {

			if (response.result || response == true) {
				that.messagesList.items.splice(index, 1);
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
								that.getMessages(listWidget, postsOffset, postsLimit);
							});
						//}
					}
				}, 2000);
				//this.getMessages(listWidget, postsOffset, postsLimit);
				} else {
					Mojo.Controller.errorDialog(response.result_text);
				}
			}
		});


		//appSettings.Database.saveData("storedForums", appSettings.forums);
};

MessagesAssistant.prototype.headerTap = function(event){

	this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
};
MessagesAssistant.prototype.searchBarAnimationDone = function(){
	this.searchBarState = !this.searchBarState;
};

MessagesAssistant.prototype.animateSearchPanel = function(panel, reverse, callback){

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

MessagesAssistant.prototype._searchKey = function(event)
	{
		if (event.originalEvent.type == 'keyup' && event.originalEvent.keyCode == Mojo.Char.enter)
		{
			if (event.value.length >= 3) {
				var args = {
					searchString: event.value

				}
				appSettings.changingScene = true;
				this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
				this.controller.stageController.swapScene("search", args);
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
MessagesAssistant.prototype._focusSearch = function(event)
	{
		this.controller = Mojo.Controller.stageController.activeScene();
		this.controller.get('search-field').mojo.focus.defer();
	};

MessagesAssistant.prototype.renderItem = function(listWidget, item, dom){
	if (this.currentFolderType == "SENT") {
		var content = dom.querySelector('div[name="sender"]');
		content.addClassName("hidden");
		var content = dom.querySelector('div[name="recipients"]');
		content.removeClassName("hidden");
	} else if (this.currentFolderType == "INBOX"){
		var content = dom.querySelector('div[name="recipients"]');
		content.addClassName("hidden");
		var content = dom.querySelector('div[name="sender"]');
		content.removeClassName("hidden");
	}
};
function SearchAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
		this._searchKey = this._searchKey.bindAsEventListener(this);
		this._focusSearch = this._focusSearch.bindAsEventListener(this);
	  	this.listTapHandler = this.listTap.bindAsEventListener(this);
		this.searchTypeChangeHandler = this.searchTypeChange.bindAsEventListener(this);
		this.searchButtonTapHandler = this._searchButtonTap.bindAsEventListener(this);
		this.searchResult = {};
		this.searchResult.topics = [];
		this._search_id ="";
		this._total_topic_num = 0;
		this.searchMode = {
			mode: "topics"
		};
		this._currentSearch = "";

		if (args) {
			this._searchModel = { value: args.searchString };
			this._subScene = args.hideCommandMenu || true;
		} else {
			this._searchModel = { value: '' };
			this._subScene = false;
		}
		Mojo.Log.info("HIDECOMMANDMENU: ", this._subScene);

		//for metatap handling
		this.metaTapPressed = false;
		this.metaTapHandler = this.metaTap.bindAsEventListener(this);
		this.metaTapReleaseHandler = this.metaTapRelease.bindAsEventListener(this);
		this.listOnHoldHandler = this.listOnHold.bindAsEventListener(this);
		this.listOnHoldEndHandler = this.listOnHoldEnd.bindAsEventListener(this);


}

SearchAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */

	/* setup widgets here */

	/* add event handlers to listen to events from widgets */
	appSettings.currentScene = "search";

	this.controller.get("searchList").hide();

	this.appMenuModel = formatMainAppMenus();

	this.controller.setupWidget(Mojo.Menu.appMenu, {
		omitDefaultItems: true
	}, this.appMenuModel);


	this.commandMenuModel = formatMainCommandMenus();

		if (!this._subScene) {
			this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass: 'fade-bottom'}, this.commandMenuModel);
		}

	this.setupWaitingFeedback();
	this.scrim.hide();

		this.controller.get("scrim-minimized").hide();
		//this.controller.get("forum-image").src = appSettings.currentForum.logo;
		//this.controller.get("forum-name").innerHTML = appSettings.currentForum.name;
		this.controller.get("forum-image-small").src = appSettings.currentForum.logo;

	    this.controller.setupWidget(
			'in-fa-ma-search-text',
			{
				hintText: $L('Search') + " " + appSettings.currentForum.name,
				focus: false,
				enterSubmits: false,
				multiline: false,
				modifierState: Mojo.Widget.sentenceCase,
				focusMode: Mojo.Widget.focusInsertMode,
				requiresEnterKey: true,
				changeOnKeyPress: true
			},
			this._searchModel
		);
		this.idListAttrs = {
			listTemplate: 'search/searchContainer',
			itemTemplate: 'search/searchItem',
			dividerTemplate: 'search/searchDivider',
			emptyTemplate: 'search/emptySearch',
			dividerFunction: this.dividerFunc,
			lookahead: 15,
			renderLimit: 25,
			uniquenessProperty: 'topic_id',
			hasNoWidgets: true,
			itemsProperty: 'topics',
			itemsCallback: this.performSearch.bind(this),
			uniquenessProperty: 'topic_id',
			formatters: {
				post_time: appSettings.Formatting.getNiceDate.bind(this),
				icon_url: appSettings.Formatting.formatTopicImage.bind(this),
				new_post: appSettings.Formatting.formatIfNewPosts.bind(this),
				is_subscribed: appSettings.Formatting.formatForumSubscribed.bind(this),
				is_closed: appSettings.Formatting.formatForumClosed.bind(this)
			}
		};

		this.controller.setupWidget('searchList', this.idListAttrs, this.searchResult);
		this.controller.listen('searchList', Mojo.Event.listTap, this.listTapHandler);

    this.controller.setupWidget("searchTypeSelector",
        {
            label: $L("Look for"),
            choices: [
                {label: $L("Topics"), value: "topics"},
                {label: $L("Posts"), value: "posts"}
            ],
			modelProperty: "mode"
        },
        this.searchMode);

	this.controller.listen('searchTypeSelector', Mojo.Event.propertyChange, this.searchTypeChangeHandler);
	this.controller.listen('search-button', Mojo.Event.tap, this.searchButtonTapHandler);


	this.controller.listen('searchList', Mojo.Event.hold, this.listOnHoldHandler.bind(this));
	this.controller.listen('searchList', Mojo.Event.holdEnd, this.listOnHoldEndHandler.bind(this));


};

SearchAssistant.prototype.refreshScene = function() {
	Mojo.Log.info("SearchAssistant.refreshScene()...");
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

SearchAssistant.prototype.aboutToActivate = function() {
	//$$('body')[0].addClassName('dark-backdrop');

	this.refreshScene();

};

SearchAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
		this.controller.get('in-fa-ma-search-text').addEventListener(Mojo.Event.propertyChange, this._searchKey);
		//this._searchModel.value = '';
		this.controller.modelChanged(this._searchModel);
		//this.controller.get('search-button').style.visibility = 'hidden'; // Because changing the model doesnt fire any propertyChange events
		this.controller.document.addEventListener(Mojo.Event.tap, this._focusSearch);
		this.controller.get('in-fa-ma-search-text').mojo.focus();
		//appSettings.asyncModules.checkSync();
		if (this._searchModel.value.length < 3)
		{
			this.controller.get('search-button').style.visibility = 'hidden';
		}
		else
		{
			this.controller.get('search-button').style.visibility = 'visible';
		}


		//metatap support
		this.controller.listen(this.controller.document, Mojo.Event.keydown, this.metaTapHandler, true);
		this.controller.listen(this.controller.document, Mojo.Event.keyup, this.metaTapReleaseHandler, true);

	if (appSettings.Tapatalk.loggedIn) {
		appSettings.Tapatalk.privateMessage.get_inbox_stat(this.controller.stageController.assistant.gotMessagesCount.bind(this));
	}

};

SearchAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
		this.controller.get('in-fa-ma-search-text').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
		this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);
		//$$('body')[0].removeClassName('dark-backdrop');

		//metatap support
		this.controller.stopListening(this.controller.document, Mojo.Event.keydown, this.metaTapHandler, true);
		this.controller.stopListening(this.controller.document, Mojo.Event.keyup, this.metaTapReleaseHandler, true);


};

SearchAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
	this.controller.stopListening('searchList', Mojo.Event.listTap, this.listTapHandler);
	this.controller.stopListening('searchTypeSelector', Mojo.Event.propertyChange, this.searchTypeChangeHandler);
	this.controller.listen('search-button', Mojo.Event.tap, this.searchButtonTapHandler);

	this.controller.stopListening('searchList', Mojo.Event.hold, this.listOnHoldHandler.bind(this));
	this.controller.stopListening('searchList', Mojo.Event.holdEnd, this.listOnHoldEndHandler.bind(this));

};

SearchAssistant.prototype.doForumClose = function() {
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

SearchAssistant.prototype.setupWaitingFeedback = function() {
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

SearchAssistant.prototype.setWaitingFeedback = function(activate) {
	if (activate) {
		this.scrim.show();
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel);

	} else {
		this.scrim.hide();
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);

		if(this.requestFeedbackTimeout) {
			Mojo.Log.info("Limpiando Timeout");
			this.controller.window.clearTimeout(this.requestFeedbackTimeout);
		}
	}

};

SearchAssistant.prototype._searchKey = function(event)
	{
		if (event.originalEvent.type == 'keyup' && event.originalEvent.keyCode == Mojo.Char.enter)
		{
			if (event.value.length >= 3) {
				this.controller.get("searchList").mojo.setLengthAndInvalidate(15);
			} else {
				this.controller.get('in-fa-ma-search-text').mojo.focus();
			}
		}
		else if (event.value.length < 3)
		{
			this.controller.get('search-button').style.visibility = 'hidden';
		}
		else
		{
			this.controller.get('search-button').style.visibility = 'visible';
		}
	};
SearchAssistant.prototype._focusSearch = function(event)
	{
		this.controller.get('in-fa-ma-search-text').mojo.focus.defer();
	};

SearchAssistant.prototype._searchButtonTap = function(event) {
				this.controller.get("searchList").mojo.setLengthAndInvalidate(15);
};

SearchAssistant.prototype.dividerFunc = function(itemModel) {
		//return itemModel.category;
	return itemModel.niceDate;
};
/*
SearchAssistant.prototype.listTap = function(event) {
	var item = event.item;
	var index = event.index;

	if (this.searchMode.mode == "posts") {
		//item.position = item.post_id;
	}

	Mojo.Log.info(Object.toJSON(item));
this.controller.stageController.pushScene({
	name: "topic",
	disableSceneScroller: true
}, item);

};
*/
SearchAssistant.prototype.listTap = function(event) {
	var item = event.item;
	var index = event.index;

if (!this.metaTapPressed && !this._onHold) {
	this.controller.stageController.pushScene({
		name: "topic",
		disableSceneScroller: true
	}, item);

} else if (this.metaTapPressed && !this._onHold) {
				//var currentSession = appSettings.Tapatalk.headers;
				Mojo.Log.info("SESSION: ", appSettings.Tapatalk.headers);
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

SearchAssistant.prototype.listOnHold = function(event) {

		//Mojo.Log.info(Object.toJSON(event));
		Mojo.Log.info("onHold");
		var target = event.target;
		this.currentElement = event.srcElement.up(".palm-row");
		this._onHold = true;

			//Deactivating Horizontal Scroller
			//this.horizScrollerModel.mode = "none";
			//this.controller.modelChanged(this.horizScrollerModel);


			var currentEvent = {};
			var listElement = this.controller.get("searchList");
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

SearchAssistant.prototype.holdPopupHandler = function(command){
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
		}
		delete this.currentEvent;
	}
	else {
		Mojo.Log.info("NO HAY CURRENT EVENT");
	}
};

SearchAssistant.prototype.listOnHoldEnd = function(event) {
		if (this.currentElement === event.srcElement.up(".palm-row")) {
			this._onHold = true;
		} else {
			this._onHold = false;
		}
		Mojo.Log.info("ONHOLD: ", this._onHold);
	};

SearchAssistant.prototype.metaTap = function(event){
	Mojo.Log.info("Key pressed;  meta:", (event.originalEvent.metaKey === true), " - ", event.originalEvent.keyCode);
	if (event.originalEvent.metaKey === true) {
		Mojo.Log.info("METATAP PRESSED");
		this.metaTapPressed = true;
	};
};

SearchAssistant.prototype.metaTapRelease = function(event){
	Mojo.Log.info("Key released;  meta:", (event.originalEvent.metaKey === true), " - ", event.originalEvent.keyCode);
	if (event.originalEvent.metaKey === true) {
		Mojo.Log.info("METATAP RELEASED");
		this.metaTapPressed = false;
	};
};

SearchAssistant.prototype.handleCommand = function(event) {
	try {
		switch (event.type) {
			case Mojo.Event.back:
				if(!this._subScene) {
					event.stop();
				if(!this.closingSession) this.doForumClose();
				}
		}
	}
	catch (e) {
		Mojo.Log.error("handleCommand: ", e);
	}

};

SearchAssistant.prototype.performSearch = function(listWidget,postsOffset,postsLimit) {

	try {
		if (this._searchModel.value.length < 3) {
			listWidget.mojo.noticeUpdatedItems(postsOffset, []);
		}
		else {

			if (this._currentSearch !== this._searchModel.value) {
				//NUEVA BUSQUEDA
				this._currentSearch = this._searchModel.value;
				this._search_id = "";
			}

			var last_number = postsOffset + postsLimit;
	this.controller.get("startSearchHolder").hide();
			this.scrim.show();
			this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);

			Mojo.Log.info(postsOffset, " - ", postsLimit);
			var that = this;
			if (this.searchMode.mode === "topics") {
				appSettings.Tapatalk.search.search_topic(this._searchModel.value, postsOffset, last_number, this._search_id, function(response){

					that.setWaitingFeedback(false);

					Mojo.Log.info("REQUEST TOPICS: ", postsOffset, " - ", last_number);
					listWidget.mojo.noticeUpdatedItems(postsOffset, response.topics);
					that.controller.get("searchList").show();

					if (response.total_topic_num != that._total_topic_num && that._total_topic_num != 0) {
						listWidget.mojo.setLengthAndInvalidate(response.total_topic_num);
					}
					else {
						listWidget.mojo.setLength(response.total_topic_num);
					}
					if (that._search_id == "") {
						that.controller.getSceneScroller().mojo.revealTop();
					}
					that._search_id = response.search_id;
					that._total_topic_num = response.total_topic_num;
					Mojo.Log.info(response.search_id, " - ", response.total_topic_num);

					/*
				 if (that.total_unread_num != "0") {
				 that.controller.get("forum_count").innerHTML = that.total_unread_num;
				 that.controller.get('topicCounter').removeClassName('hidden');
				 }
				 else {
				 that.controller.get("forum_count").innerHTML = "0";
				 that.controller.get('topicCounter').addClassName('hidden');
				 }
				 */
					that.controller.get('in-fa-ma-search-text').mojo.focus();


				});

			}
			else {
				appSettings.Tapatalk.search.search_post(this._searchModel.value, postsOffset, last_number, this._search_id, function(response){

					that.setWaitingFeedback(false);

					Mojo.Log.info("REQUEST TOPICS: ", postsOffset, " - ", last_number);
					Mojo.Log.info(Object.toJSON(response));


			if (response.total_topic_num == 0) {
				listWidget.mojo.noticeUpdatedItems(postsOffset, []);
			}
			else {
				listWidget.mojo.noticeUpdatedItems(postsOffset, response.topics);
			}

			if (response._total_topic_num != that.total_topic_num && that.total_topic_num != 0) {
				listWidget.mojo.setLengthAndInvalidate(response.total_topic_num);
				this.firstLoad = false;
			} else {
				listWidget.mojo.setLength(response.total_topic_num);
			}
			that._total_topic_num = response.total_topic_num;
			Mojo.Log.info(response.search_id, " - ", response.total_topic_num);
			if (response.search_id) {
				that._search_id = response.search_id;
			}

			if (response.total_topic_num == 0 ) {
				that.controller.get("emptyHolder").show();
				that.controller.get("startSearchHolder").hide();
			}
					/*
				 if (that.total_unread_num != "0") {
				 that.controller.get("forum_count").innerHTML = that.total_unread_num;
				 that.controller.get('topicCounter').removeClassName('hidden');
				 }
				 else {
				 that.controller.get("forum_count").innerHTML = "0";
				 that.controller.get('topicCounter').addClassName('hidden');
				 }
				 */
					that.controller.get('in-fa-ma-search-text').mojo.focus();


				});

			}

		}
	} catch (e) {
		Mojo.Log.error("performSearch ERROR: ", e);
	}
};

SearchAssistant.prototype.searchTypeChange = function(event) {
	this._search_id = "";
	if (this._searchModel.value.length >= 3) {
			this.controller.get("searchList").mojo.setLengthAndInvalidate(15);
	}

};

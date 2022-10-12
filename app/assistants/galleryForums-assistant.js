function GalleryForumsAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  	this.listTapHandler = this.listTap.bindAsEventListener(this);
		this._searchKey = this._searchKey.bindAsEventListener(this);
		this._focusSearch = this._focusSearch.bindAsEventListener(this);
		this.dividerFunc = this.dividerFunc.bind(this);
		this.propertyChangedHandler = this.propertyChanged.bindAsEventListener(this);
		this.horizScrollerModel= {scrollbars: false, mode: "horizontal-snap"};
		this.vScrollerModel= {mode: "vertical"};

		this.firstLoad = true;
		if (args) {
			this.parentForum = args;
			//Mojo.Log.info(Object.toJSON(this.parentForum));
		}
		this.forums = {}
		this.forums.list = [];
		this.currentPage = 1;
		this.totalPages = 1;

		//Add to preferences..
		this.disableGallery = true;
}

GalleryForumsAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */

	/* setup widgets here */

	/* add event handlers to listen to events from widgets */
	//if (this.forum != appSettings.currentForum) appSettings.currentForum = this.forum;
	this.setupWaitingFeedback();
	this.scrim.show();



	this.commandMenuModel = {
		visible: true,
		items: [{},{
			items:[
			MenuData.CommandMenu.Gallery,
			MenuData.CommandMenu.New,
			MenuData.CommandMenu.Accounts,
			MenuData.CommandMenu.History,
			MenuData.ViewMenu.Search
			],
			toggleCmd: "go-gallery"
		},{}]
	}
		//this.controller.setupWidget(Mojo.Menu.commandMenu, {},this.commandMenuModel);

		this.appMenuModel = {
		visible: true,
		items: [
			MenuData.ApplicationMenu.GoBack, 	//Added by Jon W 11/14/2020
			MenuData.ApplicationMenu.NewCard,
			MenuData.ApplicationMenu.Preferences,
			MenuData.ApplicationMenu.Support,
			MenuData.ApplicationMenu.Help]
	};

		this.controller.setupWidget(Mojo.Menu.appMenu, {
			omitDefaultItems: true
		}, this.appMenuModel);

		this._searchModel = { value: '' };
	    this.controller.setupWidget(
			'in-fa-ma-search-text',
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

		this.idListAttrs = {
			listTemplate: 'galleryHome/forumContainer',
			itemTemplate: 'galleryForums/forumItem',
			dividerTemplate: 'galleryHome/sectionDivider',
			//dividerFunction: this.dividerFunc,
			lookahead: 15,
			renderLimit: 25,
			uniquenessProperty: 'category_id',
			hasNoWidgets: true,
			itemsProperty: 'list',
			formatters: {
				new_post: appSettings.Formatting.formatIfNewPosts.bind(this),
				logo_url: appSettings.Formatting.formatForumImage.bind(this),
				is_subscribed: appSettings.Formatting.formatForumSubscribed.bind(this),
				is_closed: appSettings.Formatting.formatForumClosed.bind(this)
			}
		};

			this.controller.setupWidget('forumList', this.idListAttrs, this.forums);

		this.controller.listen('forumList', Mojo.Event.listTap, this.listTapHandler);

		var elements = this.controller.select('.snap');
		this.horizScrollerModel.snapElements = {x: elements, y: []};
		this.horizScrollerModel.snapIndex = 1;
		this.horizontalScroller = this.controller.get('horz_scroller');
		this.controller.setupWidget('horz_scroller', {}, this.horizScrollerModel);

		//Ajustamos altura de scroller vertical al tama�o de pantalla
		var windowHeight = this.controller.window.innerHeight;
		this.controller.get('v_scroller').style.height = (windowHeight - 60) + "px";

		this.controller.setupWidget('v_scroller', {mode:"vertical"}, {});

		this.controller.listen('horz_scroller', Mojo.Event.propertyChanged, this.propertyChangedHandler);

};

GalleryForumsAssistant.prototype.dividerFunc = function(itemModel) {
		//return itemModel.main_category_name;
};

GalleryForumsAssistant.prototype.aboutToActivate = function() {

if (this.firstLoad) {
	this.scrim.show();
	//this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
	this.getForums();
	//this.controller.modelChanged(appSettings.visual.defaultCommandMenu);
} else {
	this.firstLoad = false;
}
	this.refreshScene();
};

GalleryForumsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  if (event) {
	  	Mojo.Controller.errorDialog($L("Can't reach the server."));

	  }
		this.controller.get('in-fa-ma-search-text').addEventListener(Mojo.Event.propertyChange, this._searchKey);
		this._searchModel.value = '';
		this.controller.modelChanged(this._searchModel);
		//this.controller.get('search-button').style.visibility = 'hidden'; // Because changing the model doesnt fire any propertyChange events
		this.controller.document.addEventListener(Mojo.Event.tap, this._focusSearch);
		this.controller.get('in-fa-ma-search-text').mojo.focus();
		//appSettings.Beta.checkBeta();
};

GalleryForumsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
		this.controller.get('in-fa-ma-search-text').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
		this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);
};

GalleryForumsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
	this.controller.stopListening('forumList', Mojo.Event.listTap, this.listTapHandler);
};

GalleryForumsAssistant.prototype.handleCommand = function(event) {
	try {
		switch (event.type) {
			case Mojo.Event.command:
				switch (event.command) {
					case "go-recent":
						this.controller.stageController.swapScene({
							name: "recentPosts",
							transition: Mojo.Transition.crossFade
						});
						break;
					case "go-subscribed":
						this.controller.stageController.swapScene({
							name: "subscribedPosts",
							transition: Mojo.Transition.crossFade
						});
						break;
					case "go-search":
						this.controller.stageController.swapScene({
							name: "search",
							transition: Mojo.Transition.crossFade
						});
						break;
					/*case MenuData.ApplicationMenu.Login.command:
						event.stopPropagation();
						this._showLoginDialog();
						break;
						*/
				}
		}
	}
	catch (e) {
		Mojo.Log.error("handleCommand: ", e);
	}

};

GalleryForumsAssistant.prototype.getForums = function() {
	if (this.disableGallery) return;
		var that = this;
	this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
	appSettings.Gallery.get_directory(this.currentPage, 20, this.parentForum.category_id, false, "DATE", this.gotDirectory.bind(this));

};

GalleryForumsAssistant.prototype.gotDirectory = function(returned){

	try {

		this.setWaitingFeedback(false);
		this.horizScrollerModel.snapIndex = 1;
		this.controller.modelChanged(this.horizScrollerModel);
		this.totalPages = Math.ceil(returned.total_forums_num / 20);
		if (this.totalPages == 1) {
			this.controller.get("arrowLeft").addClassName("hidden");
			this.controller.get("arrowRight").addClassName("hidden");
		}
		if (this.currentPage == 1) {
			this.controller.get("arrowLeft").addClassName("hidden");
		}
		this.forums.list = returned.list;
		this.controller.modelChanged(this.forums);
	} catch (e) {
		Mojo.Log.error ("gotDirectory: ", e);
	}
};

GalleryForumsAssistant.prototype.listTap = function(event) {
	var item = event.index;

	Mojo.Log.info("Gallery list tap event: " + Object.toJSON(event.item));
	var args = {forum: event.item};

	args.forum.user_name ="";
	args.forum.user_password = "";
	this.controller.stageController.pushScene("forumLoader", args);

};

GalleryForumsAssistant.prototype.refreshScene = function() {
/*
	Mojo.Log.info("REFRESCANDO Scene...");
	if (appSettings.Tapatalk.loggedIn) {
		this.commandMenuModel.items[1].items = [MenuData.CommandMenu.Recent, MenuData.CommandMenu.Subscribed, MenuData.CommandMenu.Tree, MenuData.CommandMenu.Messages, MenuData.CommandMenu.Search]
		if (this.appMenuModel.items[1] == MenuData.ApplicationMenu.Login) {
			this.appMenuModel.items.splice(1,1);
		}
	}
	else {
		this.commandMenuModel.items[1].items = [MenuData.CommandMenu.Recent, MenuData.CommandMenu.Tree, MenuData.CommandMenu.Search]
	}
		this.controller.modelChanged(this.commandMenuModel);
		this.controller.modelChanged(this.appMenuModel);
		this.controller.get('in-fa-ma-search-text').mojo.focus();

*/

};

GalleryForumsAssistant.prototype.setupWaitingFeedback = function() {
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

GalleryForumsAssistant.prototype.setWaitingFeedback = function(activate) {
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

GalleryForumsAssistant.prototype._searchKey = function(event)
	{
		if (event.originalEvent.type == 'keyup' && event.originalEvent.keyCode == Mojo.Char.enter)
		{
			if (event.value.length >= 3) {
				var args = {
					searchString: event.value,
					hideCommandMenu: true

				}
				//this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
				this.controller.stageController.pushScene("gallerySearch", args);
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
				//this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
		}
		if (event.value.length == 0 && Mojo.Char.isDeleteKey(event.originalEvent.keyCode) && this.searchBarState) {
				//this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
		}
	};
GalleryForumsAssistant.prototype._focusSearch = function(event)
	{
		this.controller.get('in-fa-ma-search-text').mojo.focus.defer();
	};


GalleryForumsAssistant.prototype.propertyChanged = function(event) {
		//var totalPages = this.totalPages();
		if (this.currentPage !== 0) {

			switch (event.value) {
				case 2:
					if (this.totalPages != 1) {
						this.controller.get("arrowLeft").removeClassName("hidden");
					}
					if (this.currentPage != this.totalPages) {
						//this.controller.get("previous").removeClassName("hidden");
						this.currentPage = parseInt(this.currentPage) + 1;
						if (this.currentPage >= this.totalPages) {
							this.currentPage = this.totalPages;
						}
						if (this.currentPage == this.totalPages) {
							this.controller.get("arrowRight").addClassName("hidden");
						}
						this.getForums();
					}
					else {
						this.horizScrollerModel.snapIndex = 1;
						this.controller.modelChanged(this.horizScrollerModel);

					}
					break;
				case 0:
					if (this.totalPages != 1) {
						this.controller.get("arrowRight").removeClassName("hidden");
					}

					if (this.currentPage != 1) {
						this.currentPage = this.currentPage - 1;
						if (this.currentPage < 1) {
							this.currentPage = 1;
						}
						if (this.currentPage == 1) {
							this.controller.get("arrowLeft").addClassName("hidden");
						}
						//this.controller.get("previous").addClassName("hidden");
						this.getForums();
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


	};

GalleryForumsAssistant.prototype.scrollStarting = function(event) {
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

GalleryForumsAssistant.prototype.windowResize = function() {
		try {
			var windowWidth = this.controller.window.innerWidth;
			var windowHeight = this.controller.window.innerHeight;
			var scrollerHeight = windowHeight + 15;

			this.controller.get('v_scroller').style.height = windowHeight + "px";

		} catch (e) {
			Mojo.Log.error("windowResize: ", e);
		}
	};


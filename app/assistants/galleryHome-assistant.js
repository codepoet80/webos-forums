function GalleryHomeAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  	this.listTapHandler = this.listTap.bindAsEventListener(this);
		this._searchKey = this._searchKey.bindAsEventListener(this);
		this._focusSearch = this._focusSearch.bindAsEventListener(this);
		this.dividerFunc = this.dividerFunc.bind(this);

		this.firstLoad = true;
		if (args) {
			this.parentForum = args;
		}
}

GalleryHomeAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
	//if (this.forum != appSettings.currentForum) appSettings.currentForum = this.forum;
	//this.controller.get("search-bar").addClassName("hidden");
	//this.controller.get("search-bar-spacer").addClassName("hidden");

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

	this.setupWaitingFeedback();
	this.scrim.show();

	appSettings.currentScene = "gallery";
	//appSettings.visual.defaultCommandMenu.items[1].toggleCmd = 'go-tree';
	
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
				changeOnKeyPress: true
			}, 
			this._searchModel
		);

		this.idListAttrs = {
			listTemplate: 'galleryHome/forumContainer',
			itemTemplate: 'galleryHome/galleryForumItem',
			dividerTemplate: 'galleryHome/sectionDivider',
			dividerFunction: this.dividerFunc, 
			lookahead: 15,
			renderLimit: 25,
			uniquenessProperty: 'category_id',
			hasNoWidgets: true,
			itemsProperty: 'categories'
		};
		
		if (!this.parentForum) {
			this.controller.setupWidget('forumList', this.idListAttrs, appSettings.Gallery);
		} else {
			//Mojo.Log.info("CHILD");
			this.idListAttrs.itemsProperty = "child_list";
			this.controller.setupWidget('forumList', this.idListAttrs, this.parentForum);
		}
		this.controller.listen('forumList', Mojo.Event.listTap, this.listTapHandler);

};

GalleryHomeAssistant.prototype.dividerFunc = function(itemModel) {
		return itemModel.main_category_name;
};

GalleryHomeAssistant.prototype.aboutToActivate = function() {
	
if (!this.firstLoad) {
	this.scrim.show();
	this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
	var that = this;
/*
	appSettings.Gallery.get_nested_category(function(returned){
		that.setWaitingFeedback(false);
		that.controller.modelChanged(appSettings.Gallery.categories);
	});

*/	
	//this.controller.modelChanged(appSettings.visual.defaultCommandMenu);
} else {
	this.firstLoad = false;
}
	this.refreshScene();
};

GalleryHomeAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
		this.controller.get('in-fa-ma-search-text').addEventListener(Mojo.Event.propertyChange, this._searchKey);
		this._searchModel.value = '';
		this.controller.modelChanged(this._searchModel);
		this.controller.document.addEventListener(Mojo.Event.tap, this._focusSearch);
		this.controller.get('in-fa-ma-search-text').mojo.focus();
		
		//appSettings.Beta.checkBeta();
};

GalleryHomeAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
		this.controller.get('in-fa-ma-search-text').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
		this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);
};

GalleryHomeAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	this.controller.stopListening('forumList', Mojo.Event.listTap, this.listTapHandler);
};

GalleryHomeAssistant.prototype.handleCommand = function(event) {
	try {
		switch (event.type) {
			case Mojo.Event.command:
				switch (event.command) {
					case "go-recent":
						appSettings.changingScene = true;
						this.controller.stageController.swapScene({
							name: "recentPosts",
							transition: Mojo.Transition.crossFade
						});
						break;
					case "go-subscribed":
						appSettings.changingScene = true;
						this.controller.stageController.swapScene({
							name: "subscribedPosts",
							transition: Mojo.Transition.crossFade
						});
						break;
					case "go-search":
						appSettings.changingScene = true;
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

GalleryHomeAssistant.prototype.listTap = function(event) {
	var item = event.index;
	
		this.controller.stageController.pushScene("galleryChild", appSettings.Gallery.categories[item]);
	
};

GalleryHomeAssistant.prototype.refreshScene = function() {
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

*/	var that = this;
	appSettings.Gallery.get_nested_category(function(returned){
		that.setWaitingFeedback(false);
		that.controller.modelChanged(appSettings.Gallery);
	});

};

GalleryHomeAssistant.prototype.setupWaitingFeedback = function() {
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

GalleryHomeAssistant.prototype.setWaitingFeedback = function(activate) {
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

GalleryHomeAssistant.prototype._searchKey = function(event)
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
GalleryHomeAssistant.prototype._focusSearch = function(event)
	{
		this.controller.get('in-fa-ma-search-text').mojo.focus.defer();
	};


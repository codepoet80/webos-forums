function GallerySearchAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  	this.listTapHandler = this.listTap.bindAsEventListener(this);
		this._searchKey = this._searchKey.bindAsEventListener(this);
		this._focusSearch = this._focusSearch.bindAsEventListener(this);
		//this.dividerFunc = this.dividerFunc.bind(this);

		this.firstLoad = true;
		this.newForums = {};
		this.newForums.list = [];
		
		if (args) {
			this._searchModel = { value: args.searchString };
		} else {
			this._searchModel = { value: '' };

		}
}

GallerySearchAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */

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
			toggleCmd: "view-search"
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
	this.scrim.hide();

	appSettings.currentScene = "forums";
	//appSettings.visual.defaultCommandMenu.items[1].toggleCmd = 'go-tree';
	
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
			itemTemplate: 'gallerySearch/forumItem',
			lookahead: 15,
			renderLimit: 25,
			uniquenessProperty: 'id',
			hasNoWidgets: true,
			itemsProperty: 'list'
		};
		
		this.controller.setupWidget('forumList', this.idListAttrs, this.newForums);

		this.controller.listen('forumList', Mojo.Event.listTap, this.listTapHandler);
		
		this.controller.get("emptyHolder").hide();
		if(this._searchModel.value !== '') {
			this.controller.get("startSearchHolder").hide();
		} else {
			this.controller.get("startSearchHolder").show();
		}
};

GallerySearchAssistant.prototype.aboutToActivate = function() {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  if (this._searchModel.value !== '') {
	  	this.getForums();
	  }
	  
};
GallerySearchAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
		this.controller.get('in-fa-ma-search-text').addEventListener(Mojo.Event.propertyChange, this._searchKey);
		//this._searchModel.value = '';
		//this.controller.modelChanged(this._searchModel);
		//this.controller.get('search-button').style.visibility = 'hidden'; // Because changing the model doesnt fire any propertyChange events
		this.controller.document.addEventListener(Mojo.Event.tap, this._focusSearch);
		this.controller.get('in-fa-ma-search-text').mojo.focus();
		if (this._searchModel.value.length < 3)
		{
			this.controller.get('search-button').addClassName('disabled');
		}
		else
		{
			this.controller.get('search-button').removeClassName('disabled');
		}
	  
};

GallerySearchAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
		this.controller.get('in-fa-ma-search-text').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
		this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);
};

GallerySearchAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

GallerySearchAssistant.prototype.getForums = function() {
	var that = this;
	//Mojo.Log.info(this._searchModel.value);
	that.controller.get("startSearchHolder").hide();
	this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
	appSettings.Gallery.search(this._searchModel.value, this.gotForums.bind(this));
};

GallerySearchAssistant.prototype.gotForums = function(result){
	try {
		this.setWaitingFeedback(false);
		//this.controller=Mojo.Controller.stageController.activeScene();
		
		if (result.list.length == 0) {
			//Mojo.Log.info("Lista vacía");
			this.controller.get("emptyHolder").show();
		}
		else {
			this.controller.get("emptyHolder").hide();
		}
		//this.controller.get("emptyHolder").hide();
		this.newForums.list = result.list;
		this.controller.modelChanged(this.newForums);
	} catch (e) {
		Mojo.Log.error("gotForums: ", e);		
	}	
};

GallerySearchAssistant.prototype.listTap = function(event) {
	var item = event.item;
	
	//Mojo.Log.info("TAPPED ON: ", Object.toJSON(event.item));	

	var args = {forum: event.item};
	
	args.forum.user_name = "";
	args.forum.user_password = "";
	
	this.controller.stageController.pushScene("forumLoader", args);
	
};

GallerySearchAssistant.prototype.setupWaitingFeedback = function() {
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

GallerySearchAssistant.prototype.setWaitingFeedback = function(activate) {
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

GallerySearchAssistant.prototype._searchKey = function(event)
	{
		if (event.originalEvent.type == 'keyup' && event.originalEvent.keyCode == Mojo.Char.enter) 
		{
			if (event.value.length >= 3) {
				/*var args = {
					searchString: event.value
					
				}
				this.controller.stageController.pushScene("gallerySearch", args);*/
				this.getForums();
			}
		}
		else if (event.value.length < 3)
		{
			this.controller.get('search-button').addClassName('disabled');
		}
		else
		{
			this.controller.get('search-button').removeClassName('disabled');
			//Mojo.Log.info("visible");
		}
		this.controller.get('in-fa-ma-search-text').mojo.focus();

	};
GallerySearchAssistant.prototype._focusSearch = function(event)
	{
		this.controller.get('in-fa-ma-search-text').mojo.focus.defer();
	};



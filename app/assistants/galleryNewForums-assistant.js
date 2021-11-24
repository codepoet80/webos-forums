function GalleryNewForumsAssistant() {
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

		//Add to preferences..
		//this.disableGallery = true;
}

GalleryNewForumsAssistant.prototype.setup = function() {
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
			toggleCmd: "go-new"
		},{}]
	}
		this.controller.setupWidget(Mojo.Menu.commandMenu, {},this.commandMenuModel);

		this.appMenuModel = {
		visible: true,
		items: [
			MenuData.ApplicationMenu.GoBack, 	//Added by Jonathan Wise 11/14/2020
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

		this._searchModel = { value: '' };
	    this.controller.setupWidget(
			'in-fa-ma-search-text',
			{
				hintText: $L('Search Forums Gallery'),
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
			itemTemplate: 'galleryForums/forumItem',
			lookahead: 15,
			renderLimit: 25,
			uniquenessProperty: 'id',
			hasNoWidgets: true,
			itemsProperty: 'list'
		};

		this.controller.setupWidget('forumList', this.idListAttrs, this.newForums);

		this.controller.listen('forumList', Mojo.Event.listTap, this.listTapHandler);
};

GalleryNewForumsAssistant.prototype.aboutToActivate = function() {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  this.getForums();

};
GalleryNewForumsAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */

};

GalleryNewForumsAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

GalleryNewForumsAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
};

GalleryNewForumsAssistant.prototype.getForums = function() {

	if (!appSettings.config.enableGallery) return;

	var that = this;
	appSettings.Gallery.get_new(function(result) {
		that.newForums.list = result.list;
		that.controller.modelChanged(that.newForums);
	});
};

GalleryNewForumsAssistant.prototype.listTap = function(event) {
	var item = event.index;

	//Mojo.Log.info(Object.toJSON(event.item));

	this.controller.stageController.pushScene("forumLoader", {galleryForum: event.item});

};

GalleryNewForumsAssistant.prototype.setupWaitingFeedback = function() {
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

GalleryNewForumsAssistant.prototype.setWaitingFeedback = function(activate) {
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

GalleryNewForumsAssistant.prototype._searchKey = function(event)
	{
		if (event.originalEvent.type == 'keyup' && event.originalEvent.keyCode == Mojo.Char.enter)
		{
			if (event.value.length >= 3) {
				var args = {
					searchString: event.value

				}
				this.controller.stageController.pushScene("search", args);
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
GalleryNewForumsAssistant.prototype._focusSearch = function(event)
	{
		this.controller.get('in-fa-ma-search-text').mojo.focus.defer();
	};



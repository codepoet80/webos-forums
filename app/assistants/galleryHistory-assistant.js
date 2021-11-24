function GalleryHistoryAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  this.listTapHandler = this.openForum.bindAsEventListener(this);
	  this.forumDeleteHandler = this.deleteForum.bindAsEventListener(this);
	  this.forumReorderHandler = this.forumsListReorder.bindAsEventListener(this);
		this._searchKey = this._searchKey.bindAsEventListener(this);
		this._focusSearch = this._focusSearch.bindAsEventListener(this);
	  this.searchButtonPushHandler = this.searchButtonPush.bindAsEventListener(this);

	  
	  this.userForums = {};
	  this.userForums.items = [];
	  
	  
	  this.addNewForum = this.addNewForum.bind(this);
}

GalleryHistoryAssistant.prototype.setup = function() {
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
			toggleCmd: "go-history"
		},{}]
	}
		//this.controller.setupWidget(Mojo.Menu.commandMenu, {},this.commandMenuModel);

		
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

	//this.controller.get("debug").innerHTML = appSettings.headers;
	this.idListAttrs = {
		listTemplate: 'main/userForumContainer',
		itemTemplate: 'main/userForumItem',
		uniquenessProperty: 'forum_id',
		hasNoWidgets: true,
		swipeToDelete:true,
		reorderable: true,
		itemsProperty: 'forumsHistory'
	};
		
	this.controller.setupWidget('userForumsList', this.idListAttrs, appSettings);
	this.controller.listen('userForumsList', Mojo.Event.listTap, this.listTapHandler);
	this.controller.listen('userForumsList', Mojo.Event.listDelete, this.forumDeleteHandler);
	this.controller.listen('userForumsList', Mojo.Event.listReorder, this.forumReorderHandler);

	this.controller.listen(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);

/*
	this.cmdMenuModel = {
		visible: true,
		items: [{
			icon: "new",
			command: "addNewForum",
			disabled: false
		}, {}, {}]
	};

	this.controller.setupWidget(Mojo.Menu.commandMenu, {}, this.cmdMenuModel);

*/	
};

GalleryHistoryAssistant.prototype.aboutToActivate = function () {
/*
	var that = this;
	appSettings.Database.getData("storedForums",'', function(response) {
		that.userForums.items = response;
		that.controller.modelChanged(that.userForums)});
*/

	var that = this;
	appSettings.Database.getData("forumsHistory",'', function(response) {
		response.sort(that.sortByLastVisitASC);
		appSettings.forumsHistory = response;
		//Mojo.Log.info(Object.toJSON(response));
		//appSettings.forumsHistory.sort(this.sortByLastVisitASC);
		//this.controller=Mojo.Controller.stageController.activeScene();
		that.controller.modelChanged(appSettings);
	});

};

GalleryHistoryAssistant.prototype.sortByLastVisitASC = function(a, b){

		var result;
    
		if (a.last_visit > b.last_visit) {
			result = -1;
		} else if (a.last_visit < b.last_visit) {
			result = 1;
		} else {
			result = 0;
		}
    
		return result;

};

GalleryHistoryAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  //this.openForum();
	  //this.controller.stageController.pushScene("userForumSettings");
	//appSettings.visual.defaultCommandMenu.items[1].items[1].disabled = true;
	//appStings.visual.defaultCommandMenu.items[1].items[3].disabled = true;
	//appSettings.headers ="";
		this.controller.get('in-fa-ma-search-text').addEventListener(Mojo.Event.propertyChange, this._searchKey);
		this._searchModel.value = '';
		this.controller.modelChanged(this._searchModel);
		//this.controller.get('search-button').style.visibility = 'hidden'; // Because changing the model doesnt fire any propertyChange events
		this.controller.document.addEventListener(Mojo.Event.tap, this._focusSearch);
		this.controller.get('in-fa-ma-search-text').mojo.focus();

	  if (event) {
	  	Mojo.Controller.errorDialog($L("Can't reach the server."));

	  }

//appSettings.asyncModules.checkSync();	
	//this.testGallery();
};

GalleryHistoryAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
		this.controller.get('in-fa-ma-search-text').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
		this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);
		appSettings.cookie.storeCookie();
};

GalleryHistoryAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
	//appSettings.Tapatalk.user.logout_user(this.controller.stageController.popScene());
	this.controller.stopListening('userForumsList', Mojo.Event.listTap, this.listTapHandler);
	this.controller.stopListening('userForumsList', Mojo.Event.listDelete, this.forumDeleteHandler);
	this.controller.stopListening('userForumsList', Mojo.Event.listReorder, this.forumReorderHandler);
	this.controller.stopListening(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);

};

GalleryHistoryAssistant.prototype.handleCommand = function(event) {
/*		if(event.type == Mojo.Event.commandEnable && (event.command == 'share-forum-cmd' || event.command == 'add-launch-icon-cmd')) {
			event.stopPropagation();
		}
*/
	try {
		//Mojo.Log.info(event.command, " ", Mojo.Menu.helpCmd);
		switch (event.type) {
			case Mojo.Event.command:
				switch (event.command) {
					case 'addNewForum':
						
/*
						this.controller.showDialog({
							template: 'main/userForumSetup-scene',
							assistant: new UserForumSetupDialogAssistant(this, this.userForumIsValid.bind(this)),
							preventCancel: false
						});

*/						

this.controller.stageController.pushScene("galleryHome");						
						
						//this.openForum();
						break;
				}
			case Mojo.Event.commandEnable:
				

				// Standard Application Menu commands.

				
				// Application specific Applicaiton Menu commands.
				if (event.command === MenuData.ApplicationMenu.ShareForum.command) {
				
					event.preventDefault();
					return;
				}
				
				if (event.command === MenuData.ApplicationMenu.AddToLauncher.command) {
				
					event.preventDefault();
					return;
				}
				if (event.command === MenuData.ApplicationMenu.ForumTree.command) {
				
					event.preventDefault();
					return;
				}
				if (event.command === MenuData.ApplicationMenu.Subscribed.command) {
				
					event.preventDefault();
					return;
				}
				if (event.command === MenuData.ApplicationMenu.Lastest.command) {
				
					event.preventDefault();
					return;
				}
				break;

				
		}
		
	} 
	catch (e) {
		Mojo.Log.error("handleCommand: ", e);
	}	
};

GalleryHistoryAssistant.prototype.openForum = function(event) {
	try {
		var item = event.item;
		
		//Mojo.Log.info("FORO SELECCIONADO: ", Object.toJSON(item));
		
		var args = {};	
		
		appSettings.forums.each(function(forum) {
			
			if (forum.forum_id == item.forum_id) {
				args = {
					forum: item
				};		
			}
		});

		args.forum.user_name = "";
		args.forum.user_password = "";
					
		this.controller.stageController.pushScene("forumLoader", args);
		
	} catch (e) {
		Mojo.Log.error("Forums openForum: ", e);
	}
};

GalleryHistoryAssistant.prototype.forumsListReorder = function(event) {
		try {
			var fromIndex = event.fromIndex;
			var toIndex = event.toIndex;
			
			appSettings.forumsHistory.splice(fromIndex, 1);
			appSettings.forumsHistory.splice(toIndex, 0, event.item);
			
			appSettings.Database.saveData("forumsHistory", appSettings.forums);
			this.modified = true;
		} catch (e) {
			Mojo.Log.error("forumsListReorder:",e);
		}

};
GalleryHistoryAssistant.prototype.deleteForum = function(event) {
//Mojo.Log.info("BORRANDO...");
		appSettings.forumsHistory.splice(event.index,1);
		
		appSettings.Database.saveData("forumsHistory", appSettings.forumsHistory);
};

GalleryHistoryAssistant.prototype.addNewForum = function() {
	this.controller.showDialog({
			template: 'main/userForumSetup-scene',
			assistant: new UserForumSetupDialogAssistant(this, this.callback.bind(this)),
			preventCancel: true
		});
	
};

GalleryHistoryAssistant.prototype.userForumIsValid = function (result) {

	if (result) {
		var args = {mode: "addForum", forumData: result};
		if (result.guest_okay) {
			this.controller.showDialog({
				template: 'main/userForumSetupCredentials-scene',
				assistant: new UserForumSetupCredentialsDialogAssistant(this, this.gotCredentials.bind(this), args),
				preventCancel: false
			});
			
		} else {
			this.controller.showDialog({
				template: 'main/userForumSetupCredentials-scene',
				assistant: new UserForumSetupCredentialsDialogAssistant(this, this.gotCredentials.bind(this), args),
				preventCancel: false
			});
			
		}
	}

};

GalleryHistoryAssistant.prototype.gotCredentials = function(result){

	this.controller.getSceneScroller().mojo.adjustBy(0, -100);
	//Mojo.Log.info(Object.toJSON(result));
	
	var remoteServer = result.forum_url.replace(/mobiquo\056php$/i, "") // remove ending "mobiquo.php"
    remoteServer = remoteServer.replace(/mobiquo\057$/i, "") // remove ending "mobiquo/", if any
    remoteServer = remoteServer.replace(/mobiquo$/i, "") // remove ending "mobiquo", if any

	if (!result.logo_url) {
		result.logo_url = Mojo.appPath + "images/bundledforums/default.png";
	} else {
		//Mojo.Log.info(result.logo_url);
	}
	var item = {
		//forum_id: hex_md5(trim(result.forum_url + d.toString())),
		_id: Date.now().toString(),
		forum_id: Date.now().toString(),
		forum_url: result.forum_url,
		logo_url: result.logo_url,
		site_url: remoteServer,
		forum_name: result.forum_name,
		forum_description: result.forum_description,
		user_name: result.user_name,
		user_password: result.user_password
	};
	
	//Mojo.Log.info(Object.toJSON(item));
	
	appSettings.forumsHistory.push(item);
	this.controller.modelChanged(appSettings);
	appSettings.Database.saveData("forumsHistory", appSettings.forums);

};

GalleryHistoryAssistant.prototype._searchKey = function(event)
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
GalleryHistoryAssistant.prototype._focusSearch = function(event)
	{
		this.controller.get('in-fa-ma-search-text').mojo.focus.defer();
	};

GalleryHistoryAssistant.prototype.searchButtonPush = function(event) {
	//Mojo.Log.info("Pulsado Botón: ", this._searchModel.value);
	if (this._searchModel.value.length >= 3) {
		var args = {
			searchString: this._searchModel.value,
			hideCommandMenu: true
		
		}
		//this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
		this.controller.stageController.pushScene("gallerySearch", args);
	}
	
};


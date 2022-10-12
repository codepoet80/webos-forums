function MainAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the
	 additional parameters (after the scene name) that were passed to pushScene. The reference
	 to the scene controller (this.controller) has not be established yet, so any initialization
	 that needs the scene controller should be done in the setup function below. */
	this.listTapHandler = this.openForum.bindAsEventListener(this);
	this.forumDeleteHandler = this.deleteForum.bindAsEventListener(this);
	this.forumReorderHandler = this.forumsListReorder.bindAsEventListener(this);
//	this.openGalleryHandler = this.openGallery.bindAsEventListener(this);
	this.openHistoryHandler = this.openHistory.bindAsEventListener(this);
	this.searchButtonPushHandler = this.searchButtonPush.bindAsEventListener(this);
	//	  this.openNewForumHandler = this.openNewForum.bindAsEventListener(this);

	this.userForums = {};
	this.userForums.items = [];
	this.newForumsGallery = [];
	this.firstLoad = true;

	this.updaterModel = new UpdaterModel();

	Mojo.Log.info("MainAssistant constructor called.");
	try {
		Mojo.Log.info("MainAssistant constructor, args: " + JSON.stringify(args));
	} catch (ex) {}
	if(args) {
		if(args.forum || args.forum_id) {
			this.params = args;
		} else if(args.stageName) {
			appSettings.currentStage = args.stageName;
		}
	}

	this.gotCredentials = this.gotCredentials.bind(this);
	this.addNewForum = this.addNewForum.bind(this);
	this.importForums = this.importForums.bind(this);
	this.exportForums = this.exportForums.bind(this);
	this.gotForumsData = this.gotForumsData.bind(this);
	
//	this._searchKey = this._searchKey.bindAsEventListener(this);
//	this._focusSearch = this._focusSearch.bindAsEventListener(this);
	this.searchBarState = false;

}

MainAssistant.prototype.setup = function() {
	this.horizScrollerModel = {
		scrollbars : false,
		mode : "horizontal-snap"
	};
	this.horizontalScroller = this.controller.get('hScroller');
	this.controller.setupWidget('hScroller', {}, this.horizScrollerModel);

	this.spinnerAttrs = {
		spinnerSize : Mojo.Widget.spinnerSmall
	};
	this.spinnerModel = {
		spinning : true
	}
	this.controller.setupWidget('activity-spinner', this.spinnerAttrs, this.spinnerModel);

	//Random exception on this, so add check
	if (this.controller.get("forumsCounter"))
		this.controller.get("forumsCounter").hide();
	/* this function is for setup tasks that have to happen when the scene is first created */

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */

	/* setup widgets here */

	/* add event handlers to listen to events from widgets */
	this.commandMenuModel = {
		visible : true,
		items : [{}, {
			items : [MenuData.CommandMenu.Gallery, MenuData.CommandMenu.New, MenuData.CommandMenu.Accounts, MenuData.CommandMenu.History, MenuData.ViewMenu.Search],
			toggleCmd : "go-accounts"
		}, {}]
	}
	//this.controller.setupWidget(Mojo.Menu.commandMenu, {},this.commandMenuModel);

	this.appMenuModel = {
		visible : true,
		items : [MenuData.ApplicationMenu.GoBack, MenuData.ApplicationMenu.NewCard, MenuData.ApplicationMenu.Preferences, MenuData.ApplicationMenu.Support, MenuData.ApplicationMenu.Help]
	};//GoBack Added by Jon W 11/14/2020, 

	this.controller.setupWidget(Mojo.Menu.appMenu, {
		omitDefaultItems : true
	}, this.appMenuModel);

	//this.controller.get("debug").innerHTML = appSettings.headers;
	this.idListAttrs = {
		listTemplate : 'main/userForumContainer',
		itemTemplate : 'main/userForumItem',
		addItemLabel : 'Add new forum...',
		uniquenessProperty : 'forum_id',
		hasNoWidgets : true,
		swipeToDelete : true,
		reorderable : true,
		itemsProperty : 'forums'
	};

	this._searchModel = {
		value : ''
	};
	/*
	this.controller.setupWidget('search-field', {
		hintText : $L('Search Forums...'),
		focus : false,
		enterSubmits : true,
		multiline : false,
		modifierState : Mojo.Widget.sentenceCase,
		focusMode : Mojo.Widget.focusInsertMode,
		requiresEnterKey : true,
		changeOnKeyPress : true
	}, this._searchModel);
	this.searchBar = this.controller.get("search-bar");
	*/

	this.controller.setupWidget('userForumsList', this.idListAttrs, appSettings);
	this.controller.listen('userForumsList', Mojo.Event.listTap, this.listTapHandler);
	this.controller.listen('userForumsList', Mojo.Event.listDelete, this.forumDeleteHandler);
	this.controller.listen('userForumsList', Mojo.Event.listReorder, this.forumReorderHandler);
	this.controller.listen('userForumsList', Mojo.Event.listAdd, this.addNewForum);
	//this.controller.listen("galleryButton", Mojo.Event.tap, this.openGalleryHandler);
//	this.controller.listen("historyButton", Mojo.Event.tap, this.openHistoryHandler);
	//this.controller.listen("search-button", Mojo.Event.tap, this.searchButtonPushHandler);
//	this.controller.listen(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);
	//this.controller.listen(this.controller.get("gallery-error"), Mojo.Event.tap, this.getNewForums.bind(this));

	//this.controller.listen(this.controller.get("galleryScrollerContainer"), Mojo.Event.tap, this.openNewForum.bindAsEventListener(this));

	//mw re-enable user forum button
	//Comment out to disable
	this.cmdMenuModel = {
	visible: true,
	items: [{
	icon: "file", //new
	command: "importForums",
	disabled: false
	}, {}, {}]
	};
	this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass:'no-fade'}, this.cmdMenuModel);

//	try {
//		this.controller.serviceRequest('palm://ca.canucksoftware.filemgr', { 
//			 method: 'version', 
//	//		 parameters: { 
//	//		 from: "/media/internal/downloads/random-file.doc", 
//	//		 to: "/media/internal/documents/random-file.doc" 
//	//		 }, 
//			 onSuccess: function(payload) { 
//			 //yay! service request was successful 
//				 Mojo.Log.warn("FileMgrService version: " + JSON.stringify(payload,null,2));
//				 if (payload.version > 2) {
//					 Mojo.Log.warn("FileMgr version > 2, we're good to go!");
//				 }
//				 appSettings.config.filemgr = true;
//				if (appSettings.config.filemgr && appSettings.forums.length > 0) { //This may fail if forums data is not returned before this runs.. 
//					Mojo.Log.info("FileMgr found, enabling export function.");
//					this.cmdMenuModel.items.push({icon: "save", command: "exportForums"});
//					this.controller.modelChanged(this.cmdMenuModel);
//					logJSON("this.cmdMenuModel:" + JSON.stringify(this.cmdMenuModel.items,null,2));
//				}
////				this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass:'no-fade'}, this.cmdMenuModel);
//			 }.bind(this), 
//			 onFailure: function(err) {
//				 Mojo.Log.error(err.errorText); 
//				this.controller.setupWidget(Mojo.Menu.commandMenu, {menuClass:'no-fade'}, this.cmdMenuModel);
//			 }.bind(this)
//		 });
//	} catch (ex) {
//		Mojo.Log.error("Error checking for FileMgr service:", ex);
//	}

	if (appSettings.config.filemgr) { // && appSettings.forums.length > 0) { //This may fail if forums data is not returned before this runs.. 
		Mojo.Log.info("FileMgr found, enabling export function.");
		this.cmdMenuModel.items.push({icon: "save", command: "exportForums"});
		this.controller.modelChanged(this.cmdMenuModel);
		logJSON("this.cmdMenuModel:" + JSON.stringify(this.cmdMenuModel.items,null,2));
	}
	
	//End comment out to disable

	try {
	var theme=appSettings.config.darkTheme ? "palm-dark" : "palm-default";
	switch (theme) {
	case "palm-dark":
		this.controller.document.getElementsByTagName("body")[0].removeClassName('palm-default');
		this.controller.document.getElementsByTagName("body")[0].addClassName('palm-dark');
		break;
	default:
		this.controller.document.getElementsByTagName("body")[0].removeClassName('palm-dark');
		this.controller.document.getElementsByTagName("body")[0].addClassName('palm-default');
	}
	} catch (ex) {}
	
	//Facebook Setup
	//Mojo.loadScriptWithCallback("http://connect.facebook.net/en_US/all.js", this.FBConnectLoaded.bind(this));
	//Mojo.Log.info("Starting Twitter session");
	//social.xAccessToken("newnessdevs", "651857");

	//Check for updates
    this.updaterModel.CheckForUpdate("Forums (Revised)", this.handleUpdateResponse.bind(this));
};

MainAssistant.prototype.handleUpdateResponse = function(responseObj) {
    if (responseObj && responseObj.updateFound) {
        this.updaterModel.PromptUserForUpdate(function(response) {
            if (response)
				this.updaterModel.InstallUpdate();
        }.bind(this));
    }
}

MainAssistant.prototype.FBConnectLoaded = function(response) {
	//Mojo.Log.info(">>>>>>>>>>>>>>>>>> FACEBOOK: ", Object.toJSON(response));
	FB.init({
		appId : '186809254695630',
		status : true,
		cookie : false,
		xfbml : false
	});
};

MainAssistant.prototype.aboutToActivate = function() {
	Mojo.Log.info("MainAssistant.aboutToActivate()");
	/*
	var that = this;
	appSettings.Database.getData("storedForums",'', function(response) {
	that.userForums.items = response;
	that.controller.modelChanged(that.userForums)});
	*/

	//$$('body')[0].addClassName('dark-backdrop');

	appSettings.Database.getData("storedForums", '', this.gotData.bind(this));

};

MainAssistant.prototype.gotData = function(response) {
	logJSON("MainAssistant.gotData() - received storedForums object.");
	appSettings.forums = response;
	var needSave = false;
	try {
		for(var i = 0; i < appSettings.forums.length; i++) {
			var tmppwd = null;
			//If loaded forums are not encrypted, do it now.
			var item = appSettings.forums[i];
			//Convert old data from initial effort of manual forum add in Forums app..
			if ( item.forum_id && !item._id ) {
				item._id = item.forum_id;
			} else if ( item.id && !item._id ) {
				item._id = item.id;
			}
			if (appSettings.forums[i].user_password && !appSettings.forums[i].encrypted) {
				var userPwd = appSettings.forums[i].user_password;
				Mojo.Log.info("Stored password was not encrypted, encrypting now");
				//Mojo.Log.info("Unencrypted password:" + userPwd);
				userPwd = Mojo.Model.encrypt("com.newnessdevelopments.forums",userPwd);
				//Mojo.Log.info("Encrypted password:" + userPwd);
				needSave = true;
				appSettings.forums[i].user_password=
					Mojo.Model.encrypt("com.newnessdevelopments.forums",appSettings.forums[i].user_password);
				appSettings.forums[i].encrypted=true;
				//Mojo.Log.info("Encrypted password:" + appSettings.forums[i].user_password);
			}
			else {
				var userPwd = appSettings.forums[i].user_password;
				//Mojo.Log.info("Stored password was encrypted: Encrypted password:" + userPwd);
			}
			if (appSettings.debug.detailedLogging) {
				logJSON("MainAssistant.gotData(): Forum entry " + i + ": " + JSON.stringify(appSettings.forums[i],null,2));
			}
	 		if (tmppwd) {
	 			appSettings.forums[i].user_password = tmppwd;
			}
		}
		if (needSave) {
			appSettings.Database.saveData("storedForums", appSettings.forums);
		}
	} catch (ex) {}

//	if (appSettings.config.filemgr && appSettings.forums.length > 0) { //This may fail if forums data is not returned before this runs.. 
//		Mojo.Log.info("FileMgr found, enabling export function.");
//		this.cmdMenuModel.items.push({icon: "save", command: "exportForums"});
//		this.controller.modelChanged(this.cmdMenuModel);
//		logJSON("this.cmdMenuModel:" + JSON.stringify(this.cmdMenuModel.items,null,2));
//	}

	this.controller.modelChanged(appSettings);
	if(this.params) {
		var currentForum = {};
		if(this.params.forum_id) {
			for(var i = 0; i < appSettings.forums.length; i++) {
				if(appSettings.forums[i].id == this.params.forum_id) {
					currentForum = appSettings.forums[i];
					break;
				}
			}
		} else if(this.params.forum) {
			/*
			 can_moderate: false,
			 footprint: false,
			 iad_support: false,
			 admob_iphone: "",
			 admob_android: "",
			 admob_webos: "",

			 */
			currentForum = this.params.forum;
			//Mojo.Log.info("CURRENT FORUM: !", currentForum);
		}
		if(currentForum != {}) {
			//this.params.forum = currentForum;
			//Mojo.Log.info("PARAMETROS PARA OPENFORUM: ", Object.toJSON(this.params));
			var openForum = this.params;
			delete this.params;
			this.controller.stageController.pushScene("forumLoader", openForum);
		} else {
			delete this.params;
		}
	} else {
		//this.getNewForums();
	}

};

MainAssistant.prototype.importForums = function() {
	Mojo.Log.info("MainAssistant.importForums()");
	//Ajax call to load forums.json
	var targeturl = "file:///media/internal/forums-export.json"; //forums-export //communities
	var request = new Ajax.Request(targeturl, {
		method: 'get',
		evalJSON: 'force',
		evalJS: 'false',
//		postBody: postbody,
		onSuccess: this.gotForumsData,
		onFailure: function(event) {
			Mojo.Log.error("Error reading forum data: " + Object.toJSON(event));
		}.bind(this)
	});
}

MainAssistant.prototype.gotForumsData = function(response) {
	Mojo.Log.info("MainAssistant.gotForumsData()");
	if (appSettings.debug.detailedLogging) {
		logJSON("MainAssistant.gotForumsData()" + JSON.stringify(response.responseJSON,null,2));
	} else {
		Mojo.Log.info("MainAssistant.gotForumsData()"); 
	}
	if (response.responseJSON) {
		var imported = response.responseJSON;
		if (imported.items) {
			imported = imported.items;
			Mojo.Log.info("MainAssistant.gotForumsData(): Loaded " + imported.length + " records.");
		}
		else {
			Mojo.Log.info("MainAssistant.gotForumsData(): No records were loaded!");
		}
		//appSettings.forums = response;
		try {
			var importedCount=0;
			for(var ii = 0; ii < imported.length; ii++) {
				var item = imported[ii];
				delete item.forumTree;
				if (appSettings.debug.detailedLogging) {
					logJSON("MainAssistant.gotImportForumsData(), item: " + JSON.stringify(item,null,2));
				}
				var founditem=false;
				if ( item.forum_id && !item._id ) {
					item._id = item.forum_id;
				} else if ( item.id && !item._id ) {
					item._id = item.id;
				}
				//copied from Communities import function
				for(var i=0; i< appSettings.forums.length; i++) {
					if((appSettings.forums[i]._id && appSettings.forums[i]._id == item._id) ||
						(appSettings.forums[i].forum_id && appSettings.forums[i].forum_id == item.forum_id)	) {
						Mojo.Log.info("Community id " + item._id + " already exists, skipping.  _id:" + appSettings.forums[i]._id);
						founditem=true;
						break;
					}
				}
				if (!founditem) {
					Mojo.Log.error("Adding " + item.name);
					if (item.user_password && !item.encrypted) {
						item.user_password=
							Mojo.Model.encrypt("com.newnessdevelopments.forums",item.user_password);
						item.encrypted=true;
					}
					appSettings.forums.push(item);
					importedCount++;
				}
			}
			if (importedCount > 0) {
				this.controller.modelChanged(appSettings);
				appSettings.Database.saveData("storedForums", appSettings.forums);
				this.controller.showAlertDialog({
					onChoose: function(value){
						//Do nothing
					},
					title: $L("Export Forums"),
					message: $L(importedCount + " forums imported."),
					choices: [{
						label: $L('Ok'),
						value: 'OK',
						type: 'standard'
					}]
				});
//				enyo.windows.addBannerMessage($L("Communities imported..."), "{}");
			} else {
//				enyo.windows.addBannerMessage($L("Nothing imported"), "{}");
			}
			
		} catch (ex) {
			Mojo.Log.error("Error importing forums: ", ex);
		}
	}
	else {
		Mojo.Log.warn("Import received no json data!");
	}
}

//TODO: started playing with encrypt/decrypt.. need to finish or undo before making any more changes.
MainAssistant.prototype.exportForums = function() {
	//Ajax call to load forums.json
//	var targeturl = "file:///media/internal/communities.json";
	Mojo.Log.info("exportForums called");
	if (appSettings.forums.length == 0) {
		//nothing to export!
		this.controller.showAlertDialog({
			onChoose: function(value){
				//Do nothing
			},
			title: $L("Export Forums"),
			message: $L("There was nothing to export!"),
			choices: [{
				label: $L('Ok'),
				value: 'OK',
				type: 'standard'
			}]
		});		
	}
	
	try {
		//Encrypt passwords..
		try {
			for(var i = 0; i < appSettings.forums.length; i++) {
				if (appSettings.forums[i].user_password && !appSettings.forums[i].encrypted) {
					Mojo.Log.info("exportForums, record not encrypted.  Encrypting for export.");
					appSettings.forums[i].user_password=
						Mojo.Model.encrypt("com.newnessdevelopments.forums",appSettings.forums[i].user_password);
					appSettings.forums[i].encrypted=true;
				}
			}
		} catch (ex) {}

		var exported = {
				app: "Forums",
				dateExported: Date.now(),
				items: appSettings.forums };
		this.controller.serviceRequest('palm://ca.canucksoftware.filemgr', { 
			 method: 'write', 
			 parameters: { 
			 file: "/media/internal/forums-export.json", 
			 text: JSON.stringify(exported,null,2) 
			 }, 
			 onSuccess: function(payload) { 
			 //yay! service request was successful 
				 Mojo.Log.warn("exportForums result: " + JSON.stringify(payload,null,2));
				this.controller.showAlertDialog({
					onChoose: function(value){
						//Do nothing
					},
					title: $L("Export Forums"),
					message: $L("Forums exported to /media/internal/forums-export.json"),
					choices: [{
						label: $L('Ok'),
						value: 'OK',
						type: 'standard'
					}]
				});
				 //End onSuccess export
			 }.bind(this), 
			 onFailure: function(err) {
				 Mojo.Log.error("Error exporting forums: " + err.errorText); 

			 }.bind(this)
		 });
	} catch (ex) {
		Mojo.Log.error("Error exporting forums:", ex);
	}
}


MainAssistant.prototype.activate = function(event) {
	Mojo.Log.info("MainAssistant.activate()");
	/* put in event handlers here that should only be in effect when this scene is active. For
	example, key handlers that are observing the document */
	//this.openForum();
	//this.controller.stageController.pushScene("userForumSettings");
	//appSettings.visual.defaultCommandMenu.items[1].items[1].disabled = true;
	//appStings.visual.defaultCommandMenu.items[1].items[3].disabled = true;
	//appSettings.headers ="";
//	this.controller.get('search-field').addEventListener(Mojo.Event.propertyChange, this._searchKey);
	if (this._searchModel) {
		this._searchModel.value = '';
//		this.controller.modelChanged(this._searchModel);
	//	this.controller.get('search-button').style.visibility = 'hidden'; // Because changing the model doesnt fire any propertyChange events
//		this.controller.get("search-button").addClassName('disabled');
//		this.controller.document.addEventListener(Mojo.Event.tap, this._focusSearch);
//		this.controller.get('search-field').mojo.focus();
	}
	if(event) {
		Mojo.Controller.errorDialog($L("Can't reach the server."));

	}

	//appSettings.asyncModules.checkSync();
	/*
	 xmlrpc_gallery.storeKey(function() {
	 this.testGallery();
	 }.bind(this));
	 */

};

MainAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	 this scene is popped or another scene is pushed on top */
//	this.controller.get('search-field').removeEventListener(Mojo.Event.propertyChange, this._searchKey);
//	this.controller.document.removeEventListener(Mojo.Event.tap, this._focusSearch);

	//$$('body')[0].removeClassName('dark-backdrop');

	appSettings.cookie.storeCookie();
};

MainAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	a result of being popped off the scene stack */
	//appSettings.Tapatalk.user.logout_user(this.controller.stageController.popScene());
	this.controller.stopListening('userForumsList', Mojo.Event.listTap, this.listTapHandler);
	this.controller.stopListening('userForumsList', Mojo.Event.listDelete, this.forumDeleteHandler);
	this.controller.stopListening('userForumsList', Mojo.Event.listReorder, this.forumReorderHandler);
//	this.controller.stopListening("galleryButton", Mojo.Event.tap, this.openGalleryHandler);
//	this.controller.stopListening("historyButton", Mojo.Event.tap, this.openHistoryHandler);
//	this.controller.stopListening(this.controller.get("search-button"), Mojo.Event.tap, this.searchButtonPushHandler);
//	this.controller.stopListening(this.controller.get("gallery-error"), Mojo.Event.tap, this.getNewForums.bind(this));

//	this.controller.stopListening(this.controller.get("galleryScrollerContainer"), Mojo.Event.tap, this.openNewForum.bindAsEventListener(this));

};

MainAssistant.prototype.handleCommand = function(event) {
	/*		if(event.type == Mojo.Event.commandEnable && (event.command == 'share-forum-cmd' || event.command == 'add-launch-icon-cmd')) {
	 event.stopPropagation();
	 }
	 */
	try {
		Mojo.Log.info("MainAssistant.handleCommand(), command: " + event.command);//, " ", Mojo.Menu.helpCmd);
		switch (event.type) {
			case Mojo.Event.command:
				switch (event.command) {
					case 'addNewForum': //Command menu.. same as addNewForum function linked to list add button

						//mw re-enable user forum setup
	//Comment out to disable
						 Mojo.Log.info("MainAssistant.handleCommand(), displaying userForumSetup scene.");

						 this.controller.showDialog({
						 template: 'main/userForumSetup-scene',
						 assistant: new UserForumSetupDialogAssistant(this, this.userForumIsValid.bind(this)),
						 preventCancel: false
						 });

	//End Comment out to disable

						//mw re-enable user forum dialog
						//this.controller.stageController.pushScene("galleryHome");

						//this.openForum();
						break;
					case 'importForums':
						this.importForums();
						break;

					case 'exportForums':
						this.exportForums();
						break;
				}
			case Mojo.Event.commandEnable:

				// Standard Application Menu commands.

				// Application specific Applicaiton Menu commands.
				if(event.command === MenuData.ApplicationMenu.ShareForum.command) {

					event.preventDefault();
					return;
				}

				if(event.command === MenuData.ApplicationMenu.AddToLauncher.command) {

					event.preventDefault();
					return;
				}
				if(event.command === MenuData.ApplicationMenu.ForumTree.command) {

					event.preventDefault();
					return;
				}
				if(event.command === MenuData.ApplicationMenu.Subscribed.command) {

					event.preventDefault();
					return;
				}
				if(event.command === MenuData.ApplicationMenu.Lastest.command) {

					event.preventDefault();
					return;
				}
				break;

		}

	} catch (e) {
		Mojo.Log.error("handleCommand: ", e);
	}
};

MainAssistant.prototype.openForum = function(event) {
	Mojo.Log.info("MainAssistant.openForum called for list tap event.");
	logJSON("Mainassistant, event.item: " + JSON.stringify(event.item,null,2));
	try {
		var item = event.item;

		//var args = {forum: item.forum_id};
		var args = {
			forum : item
		};
		this.controller.stageController.pushScene("forumLoader", args);

	} catch (e) {
		Mojo.Log.error("Forums openForum: ", e);
	}
};

MainAssistant.prototype.forumsListReorder = function(event) {
	try {
		var fromIndex = event.fromIndex;
		var toIndex = event.toIndex;

		appSettings.forums.splice(fromIndex, 1);
		appSettings.forums.splice(toIndex, 0, event.item);

		appSettings.Database.saveData("storedForums", appSettings.forums);
		this.modified = true;
	} catch (e) {
		Mojo.Log.error("forumsListReorder:", e);
	}

};
MainAssistant.prototype.deleteForum = function(event) {

	appSettings.forums.splice(event.index, 1);

	appSettings.Database.saveData("storedForums", appSettings.forums);
};

MainAssistant.prototype.addNewForum = function() {
	Mojo.Log.info("MainAssistant.addNewForum() called.");
//	this.controller.showDialog({
//		template : 'main/userForumSetup-scene',
//		assistant : new UserForumSetupDialogAssistant(this, this.callback.bind(this)),
//		preventCancel : true
//	});
	 this.controller.showDialog({
		 template: 'main/userForumSetup-scene',
		 assistant: new UserForumSetupDialogAssistant(this, this.userForumIsValid.bind(this)),
		 preventCancel: false
	});

};

MainAssistant.prototype.userForumIsValid = function(result) {

	if(result) {
		var args = {
			mode : "addForum",
			forumData : result
		};
		Mojo.Log.info("MainAssistant.userForumIsValid() called. mode: " + mode);
		if(result.guest_okay) {
			/* mw allow saving as guest, login later.
			this.controller.showDialog({
				template : 'main/userForumSetupCredentials-scene',
				assistant : new UserForumSetupCredentialsDialogAssistant(this, this.gotCredentials, args),
				preventCancel : false
			});
			*/
			//this.gotCredentials;
			Mojo.Log.info("MainAssistant.userForumIsValid(), guest okay, calling gotCredentials function directly.");
			this.gotCredentials(result);
		} else {
			Mojo.Log.info("MainAssistant.userForumIsValid(), guest not okay, pushing userForumSetupCredentials scene..");
			this.controller.showDialog({
				template : 'main/userForumSetupCredentials-scene',
				assistant : new UserForumSetupCredentialsDialogAssistant(this, this.gotCredentials, args),
				preventCancel : false
			});

		}
	}

};

MainAssistant.prototype.gotCredentials = function(result) {
	Mojo.Log.info("MainAssistant: Got credentials, adding item to forums list: " + result.forum_url);

	this.controller.getSceneScroller().mojo.adjustBy(0, -100);

	if (appSettings.debug.detailedLogging) {
		logJSON("MainAssistant.gotCredentials(), incoming result object: " + Object.toJSON(result,null,2));
		logJSON("MainAssistant.gotCredentials(), appSettings.currentForum: " + Object.toJSON(appSettings.currentForum,null,2));
		
		Mojo.Log.info("forum_name: " + result.forum_name);
		Mojo.Log.info("forum_description: " + result.forum_description);
		//try {
		//	Mojo.Log.info("forum data: " + JSON.stringify(result)); }
		//catch (logerr)
		//{ Mojo.Log.error("Unable to log forum data.", logerr);}
	}
	var remoteServer = result.forum_url.replace(/mobiquo\056php$/i, "")// remove ending "mobiquo.php"
	remoteServer = remoteServer.replace(/mobiquo\057$/i, "")// remove ending "mobiquo/", if any
	remoteServer = remoteServer.replace(/mobiquo$/i, "")// remove ending "mobiquo", if any

	if(!result.forum_name) {
		Mojo.Log.info("Overriding name and desc");
		result.forum_name=result.forum_url;
		result.forum_description=result.forum_url;
	}
	if(!result.logo_url) {
		result.logo_url = Mojo.appPath + "images/bundledforums/default.png";
	} else {
		//Mojo.Log.info(result.logo_url);
	}

if (appSettings.debug.detailedLogging) { 
	logJSON("currentForum object: \n" + JSON.stringify(appSettings.currentForum,null,2)); 
}

	//mw added "url" property, as Taptalk class strips the trailing stuff when it is called anyway.
	//mw added mobiquo_dir and extension properties, as added forums need them (normally received from gallery object)
	//TODO: some forums return forum_id from get_config, some don't.. use if it is returned.
	//also, some return name, 
	var item = {
		//forum_id: hex_md5(trim(result.forum_url + d.toString())),
		forum_id : Date.now().toString(),
		forum_url : result.forum_url,
		url : remoteServer, //result.forum_url,
		mobiquo_dir : "mobiquo",
		extension : "php",
		//logo_url : result.logo_url,
		logo : result.logo_url,
		site_url : remoteServer, //seems to be redundant and unnecessary
		//forum_name : result.forum_name,
		//name : remoteServer,
		name : appSettings.currentForum.name,
		//forum_description : remoteServer,
		//description : remoteServer,
		description : appSettings.currentForum.description,
		user_name : result.user_name,
		user_password : result.user_password
	};
	if (!result.user_name) {
			item.user_name = "";
			item.user_password = "";
	}
	if (appSettings.debug.detailedLogging) { logJSON("MainAssistant: adding item to forums list: " + JSON.stringify(item,null,2)); }

	appSettings.forums.push(item);
	this.controller.modelChanged(appSettings);
	appSettings.Database.saveData("storedForums", appSettings.forums);
	Mojo.Log.info("MainAssistant: called saveData to save updated forum list.");

};

MainAssistant.prototype._searchKey = function(event) {
	if(event.originalEvent.type == 'keyup' && event.originalEvent.keyCode == Mojo.Char.enter) {
		if(event.value.length >= 3) {
			var args = {
				searchString : event.value,
				hideCommandMenu : true

			}
			//this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
			this.controller.stageController.pushScene("gallerySearch", args);
		}
	} else if(event.value.length < 3) {
		//this.controller.get('search-button').style.visibility = 'hidden';
		this.controller.get('search-button').addClassName('disabled');
	} else {
		//this.controller.get('search-button').style.visibility = 'visible';
		this.controller.get('search-button').removeClassName('disabled');

	}
	if(event.value.length > 0 && !this.searchBarState) {
		//this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
	}
	if(event.value.length == 0 && Mojo.Char.isDeleteKey(event.originalEvent.keyCode) && this.searchBarState) {
		//this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
	}

};

MainAssistant.prototype.searchButtonPush = function(event) {
	//Mojo.Log.info("Pulsado Botón: ", this._searchModel.value);
	if(this._searchModel.value.length >= 3) {
		var args = {
			searchString : this._searchModel.value,
			hideCommandMenu : true

		}
		//this.animateSearchPanel(this.searchBar, this.searchBarState, this.searchBarAnimationDone.bind(this));
		this.controller.stageController.pushScene("gallerySearch", args);
	}

};

MainAssistant.prototype._focusSearch = function(event) {
	this.controller = Mojo.Controller.stageController.activeScene();
//	this.controller.get('search-field').mojo.focus.defer();
};

MainAssistant.prototype.testGallery = function() {
	try {
		//this.parent.checkConnection(function(testResult) {
		//Mojo.Log.info("CHECK CONNECTION: ", testResult);
		var callbackOk = function(response) {
			try {
				//Mojo.Log.info("GET_CONFIG: ", Object.toJSON(response));
				//this.parent.config = response;

				//callback(response);

			} catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: testgallery.ok - ", e);
			}
		};
		var callbackFail = function(err) {
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: testgallery.fail - ", err);
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				callback(false);
				//this.parent.errorHandler(e);
			} catch (e) {
				//this.parent.errorHandler(e);
			}

		};
		var callbackDone = function() {

		};

		callbackOk = callbackOk.bind(this);
		callbackFail = callbackFail.bind(this);
		callbackDone = callbackDone.bind(this);

		xmlrpc_gallery("get_nested_category", [], {
			done : callbackOk,
			error : callbackFail,
			close : callbackDone
		});

	} catch(e) {
		Mojo.Log.error("TEST GALLERY: ", e);
	}
}

MainAssistant.prototype.getNewForums = function() {
	Mojo.Log.info("MainAssistant.getNewForums()");
	//var that = this;
	if(this.firstLoad || this.galleryOnError) {

		this.firstLoad = false;
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel);
		//mw added because this suddenly threw an exception in the emulator
		try { 
			this.controller.get("gallery-error").addClassName("hidden");
			this.controller.get("galleryButton-error-icon").addClassName("hidden");
			this.controller.get("gallery-new-forums").addClassName("hidden");
			this.controller.get("gallery-loading").removeClassName("hidden");
	
//			this.controller.stopListening("galleryButton", Mojo.Event.tap, this.openGalleryHandler);
		} catch (ex) { Mojo.Log.error("Error adding class to gallery-error:" + ex); }
	}
	if (appSettings.config.enableGallery) {
	appSettings.Gallery.get_new(this.gotNewForums.bind(this), this.galleryFailure.bind(this));
	}
};

MainAssistant.prototype.gotNewForums = function(result) {
	Mojo.Log.info("MainAssistant.gotNewForums()");
	try {

		this.newForumsGallery = result.list;

		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);
		this.controller.get("gallery-loading").addClassName("hidden");
		this.controller.get("gallery-new-forums").removeClassName("hidden");
		this.controller.get("gallery-new-forums").removeClassName("hidden");
		this.controller.get("gallery-error").addClassName("hidden");
		this.controller.get("galleryButton-error-icon").addClassName("hidden");

		//	that.newForums.list = result.list;
		//		that.controller.modelChanged(that.newForums);

		var newForumsObject = this.controller.get("galleryScrollerContainer");
		var content = Mojo.View.render({
			collection : this.newForumsGallery,
			template : 'main/newForumItem'
		});
		newForumsObject.update(content);

		//this.controller.listen(newForumsObject, Mojo.Event.tap, this.openNewForum.bindAsEventListener(this, result.list));
		//this.controller.get('new-forum-item').addEventListener( Mojo.Event.tap, this.openNewForumHandler);
		appSettings.Gallery.get_nested_category(this.gotNestedCategory.bind(this), this.galleryFailure.bind(this));

	} catch (e) {
		Mojo.Log.error("gotNewForums: ", e);
	}
};

MainAssistant.prototype.gotNestedCategory = function(response) {
	Mojo.Log.info("MainAssistant.gotNestedCategory()");
	//that.setWaitingFeedback(false);
	//that.controller.modelChanged(appSettings.Gallery.categories);
	var forumsTotal = response.total_public_num + response.total_private_num;
	//this.controller = Mojo.Controller.stageController.activeScene();
	this.controller.get("forum_count").innerHTML = forumsTotal;
	this.controller.get("forumsCounter").show();

	this.controller.listen("galleryButton", Mojo.Event.tap, this.openGalleryHandler);
	this.galleryOnError = false;

};

MainAssistant.prototype.galleryFailure = function(error) {
	Mojo.Log.info("MainAssistant.galleryFailure()");
	this.spinnerModel.spinning = false;
	this.controller.modelChanged(this.spinnerModel);
	try {
	this.controller.get("gallery-loading").addClassName("hidden");
	this.controller.get("gallery-new-forums").addClassName("hidden");
	this.controller.get("gallery-error").removeClassName("hidden");
	this.controller.get("galleryButton-error-icon").removeClassName("hidden");
	this.galleryOnError = true;
	this.controller.listen("galleryButton", Mojo.Event.tap, this.openGalleryHandler);
	} catch (ex) {}
};

MainAssistant.prototype.openGallery = function(event) {
	Mojo.Log.info("MainAssistant.openGallery()");
	try {
		if(this.galleryOnError) {
			this.getNewForums();
		} else {
			this.controller.stageController.pushScene("galleryHome");
		}
	} catch (e) {
		Mojo.Log.error(e);
	}
};

MainAssistant.prototype.openHistory = function(event) {
	Mojo.Log.info("MainAssistant.openHistory()");
	try {
		this.controller.stageController.pushScene("galleryHistory");
	} catch (e) {
		Mojo.Log.error(e);
	}
};

MainAssistant.prototype.openNewForum = function(event) {
	Mojo.Log.info("MainAssistant.openNewForum()");
	try {
		//Mojo.Log.info(Object.toJSON(event));
		var itemElement = event.srcElement.up(".scrollerItem");
		var itemId = itemElement.getAttribute("id");
		var itemModel;

		event.stop();
		for(var i = 0; i < this.newForumsGallery.length; i++) {
			if(this.newForumsGallery[i].id == itemId)
				itemModel = {
					forum : this.newForumsGallery[i]
				};
		}

		itemModel.forum.user_name = "";
		itemModel.forum.user_password = "";
		//Mojo.Log.info(Object.toJSON(itemModel));
		this.controller.stageController.pushScene("forumLoader", itemModel);

	} catch (e) {
		Mojo.Log.error("openNewForum: ", e);
	}
}

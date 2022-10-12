
function StageAssistant() {
	/* this is the creator function for your stage assistant object */
	//Mojo.Log.info("PARAMETROS RECIBIDOS EN STAGE ASSISTANT: ", Object.toJSON(params));


}

StageAssistant.prototype.setup = function() {

var message = $L("-- Sent from my Palm ") + Mojo.Environment.DeviceInfo.modelNameAscii + $L(" using") + " [url=http://developer.palm.com/appredirect/?packageid=com.newnessdevelopments.forums]" + $L("Forums") + "[/url]";
var messagePlain = $L("-- Sent from my Palm ") + Mojo.Environment.DeviceInfo.modelNameAscii + $L(" using") + " [i]" + $L("Forums") + "[/i]";
appSettings.postingMessage = messagePlain; //.replace(new RegExp("%u0113", "gi"), "e");
appSettings.postingMessagePlain = messagePlain;
/*	appSettings.Database.getData("storedForums",'', function(response) {
		//Mojo.Log.info(Object.toJSON(response));
		appSettings.forums = response;
		//this.controller=Mojo.Controller.stageController.activeScene();
	});
*/
	appSettings.cookie = new Cookie();
//	logJSON("appSettings:" + JSON.stringify(appSettings,null,2));
	$$('body')[0].addClassName(appSettings.config.fontSize);
	
	this._startConnectionWatch();

	window.document.addEventListener(Mojo.Event.activate, this.onAppActivate.bind(this));
	window.document.addEventListener(Mojo.Event.deactivate, this.onAppDeactivate.bind(this));

	try {
		Mojo.Log.warn("Checking for FileMgrService in stage assistant");
		this.fmrequest = new Mojo.Service.Request('palm://ca.canucksoftware.filemgr', { 
			 method: 'version', 
			 onSuccess: function(payload) { 
			 //yay! service request was successful 
				 Mojo.Log.warn("FileMgrService version: " + JSON.stringify(payload,null,2));
				 appSettings.config.filemgr = true;
			 }.bind(this), 
			 onFailure: function(err) {
				 Mojo.Log.error(err.errorText); 
			 }.bind(this)
		 });
	} catch (ex) {
		Mojo.Log.error("Error checking for FileMgr service in stage assistant:", ex);
	}
	

};

StageAssistant.prototype.cleanup = function () {
	Mojo.Log.info("Forums: StageAssistant CLEANUP");


	this.closeChildWindows();

 	this._cleanupConnectionWatch();
	//appSettings.Tapatalk.user.logout_user();
	window.document.removeEventListener(Mojo.Event.activate, this.onAppActivate.bind(this));
	window.document.removeEventListener(Mojo.Event.deactivate, this.onAppDeactivate.bind(this));

};

StageAssistant.prototype.activate = function (event) {
	if (event) {
		Mojo.Log.info("ACTIVADO CON EVENTO");
	} else {
		Mojo.Log.info("ACTIVADO SIN EVENTO");
	}
};

StageAssistant.prototype._startConnectionWatch =function(){

    this.connectionInfoRequest = new Mojo.Service.Request('palm://com.palm.connectionmanager', {
        method: 'getstatus',
        parameters: {
            subscribe: true
        },
        onSuccess: this.internetConnectionUpdate.bind(this)
    });

};

StageAssistant.prototype._cleanupConnectionWatch = function() {
 	Mojo.Log.info("Forums: _cleanupConnectionWatch");
	if (this.connectionInfoRequest) {
		this.connectionInfoRequest.cancel();
		this.connectionInfoRequest = null;
	}

};

StageAssistant.prototype.internetConnectionUpdate = function(response){
	var sceneStack = Mojo.Controller.stageController.getScenes();
	if (appSettings.debug.dumpConnectionInfo) {
		Mojo.Log.info("StageAssistant.internetConnectionUpdate(): " + Object.toJSON(response));
		Mojo.Log.info("StageAssistant.internetConnectionUpdate(): scene stack size: ",  sceneStack.size());
	}
	if (response.isInternetConnectionAvailable) {
		//mw disable noconnection scene
		/*
		if (sceneStack && sceneStack.size() > 1 && Mojo.Controller.stageController.topScene().sceneName == "noConnection") {
			Mojo.Controller.stageController.popScene();
		}
		else if (sceneStack && sceneStack.size() == 1 && Mojo.Controller.stageController.topScene().sceneName == "noConnection") {
			if (appSettings.currentForum) {
				Mojo.Controller.stageController.swapScene("main");
			} else {
				Mojo.Controller.stageController.swapScene("forums");

			}
		}
		else if (sceneStack && sceneStack.size() == 0){
				//Mojo.Controller.stageController.swapScene("main");
		}
		else */
		//mw end disable noconnection scene
		{
				//CHECKS IF THE PHONE CONNECTION IS VALID. IF GPRS, SHOW MESSAGE
			if (response.wan.state == "connected") {
				switch (response.wan.network) {
					case 'unusable':
						break;
					case 'gprs':
					case '1x':
						//showErrorDialog()
						break;

				}
			}
			else
				if (response.wifi.state == "connected" || response.btpan.state =="connected") {
					//CHECKS IF IT'S A VALID IP
					//Mojo.Controller.getAppController().showBanner(response.wifi.ipAddress, "", "");

				} else {
					//Not valid internet connection available
				}
		}

	} else {
		//mw disable noconnection scene
		/*
		if (sceneStack && sceneStack.size() == 0){
				Mojo.Controller.stageController.swapScene("noConnection");
		}
		else if (sceneStack && sceneStack.size() >= 1 && Mojo.Controller.stageController.topScene().sceneName != "noConnection") {
				Mojo.Controller.stageController.pushScene("noConnection");
		}
		*///end disable noconnection scene

		//Mojo.Controller.stageController.pushScene("noConnection");
	}
};

StageAssistant.prototype.onAppActivate = function() {
	//Mojo.Log.info("Forums: onAppActivate");
	this._startConnectionWatch();

		var activeScene = Mojo.Controller.stageController.activeScene();
		try {
			//activeScene.get("scrim-minimized").hide();
			if (appSettings.Tapatalk.loggedIn) {

				var currentTime = new Date();
				var minutes = 5;
				var logoutTime = minutes * 60 * 1000;
				var difference = currentTime.getTime() - appSettings.Tapatalk.lastActionTime().getTime();

				//If app has been inactive and user has not had any activity in a while, reauthenticate
				if (logoutTime < difference) {

					activeScene.get('scrim').show();



					appSettings.Tapatalk.authenticate(function(result){
						Mojo.Log.info(Object.toJSON(result));
						//this.controller = Mojo.Controller.stageController.activeScene()
						activeScene.get('scrim').hide();

					});
				}

			}
		} catch (e){
			//Mojo.Log.error("There is not scrim to deactivate");
		}
};

StageAssistant.prototype.onAppDeactivate = function() {
	Mojo.Log.info("Forums: onAppDeactivate");
	this._cleanupConnectionWatch();

		var activeScene = Mojo.Controller.stageController.activeScene();
		try {
			//activeScene.get("scrim-minimized").show();
			//appSettings.lastActionTime = new Date();
			//Mojo.Log.info(appSettings.Tapatalk.lastActionTime().toString());
			this.populateSessionStatus();
		} catch (e){
			//Mojo.Log.error("There is not scrim to deactivate");
		}
/*
		if (appSettings.Beta.isBeta) {
			window.close();
		}

*//*	if (appSettings.Tapatalk.loggedIn) {
		appSettings.Tapatalk.user.logout_user();
	}
*/

};

StageAssistant.prototype.handleCommand = function(event) {
	try {
		//Mojo.Log.info(Object.toJSON(event));
		switch (event.type) {
			case Mojo.Event.command:
				Mojo.Log.info("StageAsst.handleCommand(), event type,command: ", event.type + "," + event.command);
				switch (event.command) {
					//Added by Jon W 11/14/2020
					case "doGoBack":
						Mojo.Controller.stageController.popScene();
						break;
					case "new-page-cmd":
						this._openNewCard();
						break;
					case "add-launch-icon-cmd":
						this._createLaunchPoint();
						break;
					case Mojo.Menu.helpCmd:
						//Mojo.Controller.stageController.pushAppSupportInfoScene();
						var arguments = {
							pageTitle: $L("Forums Help"),
							pageName: Mojo.Controller.stageController.topScene().sceneName
						};
						Mojo.Controller.stageController.pushScene("helpPage", arguments	);

						break;
					case Mojo.Menu.prefsItem.command:
						Mojo.Controller.stageController.pushScene('preferences');
						break;
					case 'go-full':
						demo.redirectToAppCatalog();
						break;
					case MenuData.CommandMenu.Gallery.command:
						appSettings.changingScene = true;
						//Mojo.Controller.stageController.popScenesTo(appSettings.currentScene);
						Mojo.Controller.stageController.swapScene({
							name: "galleryHome",
							transition: Mojo.Transition.crossFade
						});
						break;
					case MenuData.CommandMenu.Accounts.command:
						appSettings.changingScene = true;
						//Mojo.Controller.stageController.popScenesTo(appSettings.currentScene);
						Mojo.Controller.stageController.popScenesTo("galleryHome");
						Mojo.Controller.stageController.swapScene({
							name: "main",
							transition: Mojo.Transition.crossFade
						});
						break;
					case MenuData.CommandMenu.New.command:
						appSettings.changingScene = true;
						//Mojo.Controller.stageController.popScenesTo(appSettings.currentScene);
						Mojo.Controller.stageController.popScenesTo("galleryHome");
						Mojo.Controller.stageController.swapScene({
							name: "galleryNewForums",
							transition: Mojo.Transition.crossFade
						});
						break;
					case MenuData.ViewMenu.Search.command:
						appSettings.changingScene = true;
						//Mojo.Controller.stageController.popScenesTo(appSettings.currentScene);
						Mojo.Controller.stageController.popScenesTo("galleryHome");
						Mojo.Controller.stageController.swapScene({
							name: "gallerySearch",
							transition: Mojo.Transition.crossFade
						});
						break;
					case MenuData.CommandMenu.History.command:
						Mojo.Controller.stageController.popScenesTo("galleryHome");
						appSettings.changingScene = true;
						//Mojo.Controller.stageController.popScenesTo(appSettings.currentScene);
						Mojo.Controller.stageController.swapScene({
							name: "galleryHistory",
							transition: Mojo.Transition.crossFade
						});
						break;
					case MenuData.ApplicationMenu.Support.command:
						Mojo.Controller.stageController.pushAppSupportInfoScene();
						break;
					case MenuData.ApplicationMenu.ForumTree.command:
						appSettings.changingScene = true;
						Mojo.Controller.stageController.popScenesTo(appSettings.currentScene);
						Mojo.Controller.stageController.swapScene("forums");
						break;
					case MenuData.ApplicationMenu.Lastest.command:
						appSettings.changingScene = true;
						Mojo.Controller.stageController.popScenesTo(appSettings.currentScene);
						Mojo.Controller.stageController.swapScene("recentPosts");
						break;
					case MenuData.ApplicationMenu.Subscribed.command:
						appSettings.changingScene = true;
						Mojo.Controller.stageController.popScenesTo(appSettings.currentScene);
						Mojo.Controller.stageController.swapScene("subscribedPosts");
						break;
					case MenuData.ApplicationMenu.PrivateMessages.command:
						appSettings.changingScene = true;
						Mojo.Controller.stageController.popScenesTo(appSettings.currentScene);
						Mojo.Controller.stageController.swapScene("messages");
						break;
					case MenuData.ApplicationMenu.Search.command:
						appSettings.changingScene = true;
						Mojo.Controller.stageController.popScenesTo(appSettings.currentScene);
						Mojo.Controller.stageController.swapScene("search");
						break;
					case MenuData.ApplicationMenu.Login.command:
						this._showLoginDialog();
						break;

					case MenuData.ApplicationMenu.Logout.command:
						Mojo.Log.info("Forum logout selected..");
						//clear user name/pwd and save forums list, then call doForumClose to log out properly
						appSettings.currentForum.user_name="";
						appSettings.currentForum.user_password="";
						appSettings.currentForum.encrypted=false;
						appSettings.Database.saveData("storedForums", appSettings.forums);

						var activeController = Mojo.Controller.stageController.activeScene();
						Mojo.Log.info("active scene " + activeController.sceneName + "," + Mojo.Controller.stageController.topScene().sceneName);
						try {
							Mojo.Log.info("Attempting to call doForumClose() function...");
							//activeController.doForumClose();
							//Mojo.Controller.StageController.delegateToSceneAssistant
							Mojo.Controller.stageController.delegateToSceneAssistant("doForumClose");
						}
						catch (ex) {
							Mojo.Log.info("Exception: " + ex);
							Mojo.Log.info("controller has no doForumClose() function, popping scene.");
							//activeController.popScene();
							Mojo.Controller.stageController.popScene();
						}
						//activeController.assistant.refreshScene();
						//Mojo.Controller.stageController.popScene();
						break;


					case "go-tree":
						appSettings.changingScene = true;
						Mojo.Controller.stageController.swapScene({
							name: "forums",
							transition: Mojo.Transition.crossFade
						});
						break;
					//Added by Jon W, 11/14/2020
					case "go-back":
						this.controller.stageController.popScene();
						break;
					case "go-recent":
						appSettings.changingScene = true;
						Mojo.Controller.stageController.swapScene({
							name: "recentPosts",
							transition: Mojo.Transition.crossFade
						});
						break;
					case "go-mail":
						appSettings.changingScene = true;
						Mojo.Controller.stageController.swapScene({
							name: "messages",
							transition: Mojo.Transition.crossFade
						});
						break;
					case "go-subscribed":
						appSettings.changingScene = true;
						Mojo.Controller.stageController.swapScene({
							name: "subscribedPosts",
							transition: Mojo.Transition.crossFade
						});
						break;
					case "go-search":
						appSettings.changingScene = true;
						Mojo.Controller.stageController.swapScene({
							name: "search",
							transition: Mojo.Transition.crossFade
						});
						break;

				}
			case Mojo.Event.commandEnable:

				// Standard Application Menu commands.
				if (event.command === Mojo.Menu.helpCmd) {

					event.stopPropagation(); // Enable the chosen menuitems
					return;
				}
				if (event.command === Mojo.Menu.prefsItem.command) {

					//Mojo.Controller.stageController.pushScene('preferences');
					event.stopPropagation(); // Enable the chosen menuitems
					return;
				}

				// Application specific Application Menu commands.
				if (event.command === MenuData.ApplicationMenu.ForumTree.command && appSettings.currentScene === "forums") {

					event.preventDefault();
					return;
				}
				if (event.command === MenuData.ApplicationMenu.Lastest.command && (appSettings.currentScene === "recentPosts" || appSettings.Tapatalk.config.disable_lastest == "1" || !appSettings.Tapatalk.config.api_level)) {

						event.preventDefault();
					return;
				}
				if (event.command === MenuData.ApplicationMenu.Subscribed.command && (appSettings.currentScene === "subscribedPosts" || !appSettings.Tapatalk.loggedIn)) {

					event.preventDefault();
					return;
				}
				if (event.command === MenuData.ApplicationMenu.PrivateMessages.command && (appSettings.currentScene === "messages" || !appSettings.Tapatalk.loggedIn)) {

					event.preventDefault();
					return;
				}
				if (event.command === MenuData.ApplicationMenu.Search.command && (appSettings.currentScene === "search" || appSettings.Tapatalk.config.disable_search == "1" || !appSettings.Tapatalk.config.api_level)) {

					event.preventDefault();
					return;
				}
				if (event.command === MenuData.ApplicationMenu.Login.command && !appSettings.Tapatalk.config.api_level) {

					event.preventDefault();
					return;
				}
				break;
			case Mojo.Event.back:
				appSettings.changingScene = false;
				break;

			case "custom":
				Mojo.Log.info("CUSTOM EVENT RECIBIDO EN ", appSettings.currentStage, ": ", event.command);
				if (event.command == "updateConnectionData") {
					this.updateConnectionData(event.parameters)
				}
		}

	}
	catch (e) {
		Mojo.Log.error("handleCommand: ", e);
	}
};

StageAssistant.prototype._openNewCard = function() {

	try {
		this.controller = Mojo.Controller.stageController.activeScene();

		var params = {method: false};
		this.controller.serviceRequest('palm://com.palm.applicationManager', {
			method: 'open',
			parameters: {
				'id': Mojo.Controller.appInfo.id,
				'params': params
			}
		});
	} catch (e) {
		Mojo.Log.error("Error launching new card");
	}
};

StageAssistant.prototype._createLaunchPoint = function() {

 /* params= {
  * 	forum_url: result.forum_url,
  *		forum_name: result.forum_name,
  *		forum_description: result.forum_description,
  *		user_name: result.user_name,
  *		user_password: result.user_password
  }
  */

   	this.controller = Mojo.Controller.stageController.activeScene();
	var that = this;

     var appParams = {
            method: 'openForum',
            forum: appSettings.currentForum
        };
Mojo.Log.info(Mojo.appPath);
Mojo.Log.info(Object.toJSON(appSettings.currentForum));

        var title = appSettings.currentForum.name;

	//Descargamos el icono
	if (appSettings.currentForum.logo.startsWith("file://")) {
		Mojo.Log.info("comienzapor");
		//Eliminamos el file:///
		 formattedPath = appSettings.currentForum.logo.replace(/file:\057\057/gi, ""); // remove starting 'http://', if any
			Mojo.Log.info("formatted icon path for launchpoint: " + formattedPath);
		var callParams = {
						id: Mojo.Controller.appInfo.id,
						//'icon': "/var/luna/data/extractfs" + formattedPath + ":0:0:64:64:3", //Mojo.appPath + 'images/default_64.png',
						'icon': formattedPath,
						'title': title,
						'params': appParams
					};
					that.controller.serviceRequest('palm://com.palm.applicationManager/addLaunchPoint', {
						parameters: callParams,
						onSuccess: function(result){
							Mojo.Controller.getAppController().showBanner($L("Shortcut created successfully"), "", "");
						},
						onFailure: function(failure){
						}
					});
	}
	else {

		this.controller.serviceRequest('palm://com.palm.downloadmanager/', {
			method: 'download',
			parameters: {
/*
				target: "/var/luna/data/extractfs" +
				appSettings.currentForum.logo_url +
				":0:0:64:64:3",

*/
				target: appSettings.currentForum.logo,
				mime: "image/jpg",
				targetDir: "/media/internal/forums/",
				targetFilename: (appSettings.currentForum.id ? appSettings.currentForum.id : appSettings.currentForum.forum_id) + ".jpg", //".png", //why is mime image/jpg and file extension set to .png??
				keepFilenameOnRedirect: false,
				subscribe: true
			},
			onSuccess: function(response){
				if (response.completed) {
				Mojo.Log.info("formatted icon path for launchpoint: " + "DOWNLOAD MANAGER target: ", response.target);
					var callParams = {
						id: Mojo.Controller.appInfo.id,
						'icon': response.target, //Mojo.appPath + 'images/bundledforums/default.png',
						'title': title,
						'params': appParams
					};
					that.controller.serviceRequest('palm://com.palm.applicationManager/addLaunchPoint', {
						parameters: callParams,
						onSuccess: function(result){
							Mojo.Controller.getAppController().showBanner($L("Shortcut created successfully"), "", "");
						},
						onFailure: function(failure){
						}
					});
				}
			},
			onFailure: function(e){
				Mojo.Log.info("DOWNLOAD FALLO: ", Object.toJSON(e));
			}
		});
	}

};
StageAssistant.prototype._showLoginDialog = function(callback) {
 Mojo.Log.info("StageAssistant: entering _showLoginDialog");
 	if (!appSettings.currentForum.user_name || !appSettings.currentForum.user_password) {
		var args = {
			mode: "login"
		};
		this.controller = Mojo.Controller.stageController.activeScene();
		this.controller.showDialog({
			template: 'main/userForumSetupCredentials-scene',
			assistant: new UserForumSetupCredentialsDialogAssistant(this, this.gotCredentials.curry(callback).bind(this), args),
			preventCancel: false
		});
	} else {
		//var that = this;
		appSettings.Tapatalk.user.login(function(result) {
			if (result) {
				if (callback) {
					callback(result);
				}
				else {
					var activeController = Mojo.Controller.stageController.activeScene();
					appSettings.Tapatalk.forum.get_forum(function(returned){
						activeController.modelChanged(appSettings.Tapatalk.forum);
						activeController.assistant.refreshScene();
					});
				}
				if (appSettings.subLaunch) {
					Mojo.Log.info("POPULATING SESSION");
					Mojo.Controller.stageController.assistant.populateSessionStatus();
				}
			}
		});
	}
};

StageAssistant.prototype.gotCredentials = function(callback, result) {

	Mojo.Log.info("StageAssistant: entering gotCredentials: ", result, Object.toJSON(result));
	var doLogin = function(gotForums){
		appSettings.forums = gotForums;

		var newForum = true;

		//Mojo.Log.info("StageAssistant.gotCredentials(): currentForum: " + Object.toJSON(appSettings.currentForum));
		if (result) {
			Mojo.Log.info("Checking to see if currentForum has already been saved, and we are setting credentials.");
			//Mojo.Log.info("Saved forums, before:");
			//appSettings.forums.each(function(item){
			//		Mojo.Log.info(Object.toJSON(item));
			//});
			appSettings.forums.each(function(item){
				if ((item.id && appSettings.currentForum.id) && (item.id == appSettings.currentForum.id)
				  ||(item.forum_id && appSettings.currentForum.forum_id) && (item.forum_id == appSettings.currentForum.forum_id))
				{
					//Mojo.Log.info("Updating credentials for forum: " + Object.toJSON(item));
					Mojo.Log.info("Updating credentials for forum: " + appSettings.currentForum.name);
					item.user_name = appSettings.currentForum.user_name;
					item.user_password = appSettings.currentForum.user_password;
					if (appSettings.currentForum.logo && appSettings.currentForum.logo.length > 0) {
						//mw We really need an avatar property
						item.logo = appSettings.currentForum.logo;
						item.logo_url = appSettings.currentForum.logo;
					}
					newForum = false;
				}
			});
			//Mojo.Log.info("Saved forums, after:");
			//appSettings.forums.each(function(item){
			//		Mojo.Log.info(Object.toJSON(item));
			//});

			if (newForum) {
				appSettings.forums.push(appSettings.currentForum);
				Mojo.Controller.getAppController().showBanner(appSettings.currentForum.name + $L(" saved"), "", "");
			}
			else {
				Mojo.Controller.getAppController().showBanner($L("Credentials saved"), "", "");
			}
			appSettings.Database.saveData("storedForums", appSettings.forums);
			Mojo.Log.info("StageAssistant.gotCredentials() saved forum, now calling forum login");

			appSettings.Tapatalk.user.login(function(result){
				if (result) {
					if (callback) {
						callback(result);
					}
					else {
						var activeController = Mojo.Controller.stageController.activeScene();
						appSettings.Tapatalk.forum.get_forum(function(returned){
							activeController.modelChanged(appSettings.Tapatalk.forum);
							activeController.assistant.refreshScene();
						});
					}
					if (appSettings.subLaunch) {
						Mojo.Log.info("POPULATING SESSION");
						Mojo.Controller.stageController.assistant.populateSessionStatus();
					}
				}
			});


		}
		else {
			Mojo.Log.info("CANCELADO LOGIN");
		}

	};

	Mojo.Log.info("DOING LOGIN");
	appSettings.Database.getData("storedForums", '', doLogin.bind(this));

};

StageAssistant.prototype.gotMessagesCount = function(result) {
	try {
		Mojo.Log.info("StageAssistant.gotMessagesCount: ", Object.toJSON(result));

		if (result && result.inbox_unread_count > appSettings.Tapatalk.forum.unreadMessagesCount) {
			Mojo.Log.info("New messages: ", Object.toJSON(result));
			appSettings.Tapatalk.forum.unreadMessagesCount = result.inbox_unread_count;
			if (result.inbox_unread_count == 1) {
				var titleText = $L("New Private Message");
				var messageText = $L("You have received a new private message");

			}
			else {
				var titleText = $L("New Private Messages")
				var messageText = $L("You have received ") + result.inbox_unread_count + $L(" new private messages.");
			}

			this.controller = Mojo.Controller.stageController.activeScene();
			this.controller.showAlertDialog({
				onChoose: this.controller.stageController.assistant.manageMessagesChoice.bind(this),
				title: titleText,
				message: messageText,
				choices: [{
					label: $L('Go to Inbox'),
					value: 'OK',
					type: 'affirmative'
				}, {
					label: $L('Dismiss'),
					value: 'DISMISS',
					type: 'standard'
				}]
			});

		}
		else {
			Mojo.Log.info("No new messages.");
		}
	} catch (e) {
		Mojo.Log.error("gotMessagesCount ERROR: ", e);
	}
};

StageAssistant.prototype.manageMessagesChoice = function(choice){
	Mojo.Log.info(choice);
	if (choice == "OK") {
		if (!appSettings.subLaunch) {
			appSettings.changingScene = true;
			this.controller.stageController.popScenesTo(appSettings.currentScene);
			this.controller.stageController.swapScene("messages");
		}
		else {

			var params = {
				method: "_messagesCalledFromChild",
				stageName: appSettings.parentStage,
				parameters: {
					calledFromStage: appSettings.currentStage,
					session: appSettings.Tapatalk.headers,
					lastActionTime: appSettings.Tapatalk._lastActionTime.toString()
				}
			};

			Mojo.Controller.getAppController().launch(Mojo.Controller.appInfo.id, params);
		}
	} else {
		//this.controller = Mojo.Controller.stageController.activeScene();

	}
};

StageAssistant.prototype.updateSessionStatus = function(parameters) {
	Mojo.Log.info("UPDATING CONNECTION:");

	//Mojo.Log.info((parameters.lastActionTime > appSettings.Tapatalk._lastActionTime));
	var newDate = new Date(parameters.lastActionTime);
	Mojo.Log.info(newDate.toString(), " ", appSettings.Tapatalk._lastActionTime.toString());
	if (newDate > appSettings.Tapatalk._lastActionTime) {
		Mojo.Log.info("Updated _lastActionTime");
		appSettings.Tapatalk._lastActionTime = parameters.lastActionTime;
	}
	//appSettings.Tapatalk.headers = parameters.session;
	if (parameters.session) {
		if (!appSettings.Tapatalk.headers || (appSettings.Tapatalk.headers !== parameters.session)) {
			Mojo.Log.info("Marcando como loggedIn");
			appSettings.Tapatalk.headers = parameters.session;
			appSettings.Tapatalk.loggedIn = true;
			//"Simulate Login"
			var activeController = Mojo.Controller.stageController.activeScene();
					appSettings.Tapatalk.forum.get_forum(function(returned){
						activeController.modelChanged(appSettings.Tapatalk.forum);
						activeController.assistant.refreshScene();
			});

		}

	}
	if (!appSettings.subLaunch) {
		var len = appSettings.subLaunchStages.length;
		Mojo.Log.info("LLAMADO DESDE STAGE: ", parameters.calledFromStage);
		if (len > 0) {
			for (var i = 0; i < len; i++) {
				if (appSettings.subLaunchStages[i] !== parameters.calledFromStage) {
					var params = {
						method: "_updateSessionStatus",
						stageName: appSettings.subLaunchStages[i],
						parameters: {
							session: appSettings.Tapatalk.headers,
							lastActionTime: appSettings.Tapatalk._lastActionTime.toString()
						}
					};

					Mojo.Controller.getAppController().launch(Mojo.Controller.appInfo.id, params);

/*
					var connectionInfoRequest = new Mojo.Service.Request('palm://com.palm.applicationManager', {
						method: 'open',
						parameters: {
							'id': Mojo.Controller.appInfo.id,
							'params': params
						}
					});

*/				}

			}
		}
	}
};

StageAssistant.prototype.openMessagesFromChild = function(stageName, parameters) {
	Mojo.Log.info("UPDATING CONNECTION:", Mojo.Log.info(Object.toJSON(parameters)));

	//Mojo.Log.info((parameters.lastActionTime > appSettings.Tapatalk._lastActionTime));
	var newDate = new Date(parameters.lastActionTime);
	Mojo.Log.info(newDate.toString(), " ", appSettings.Tapatalk._lastActionTime.toString());
	if (newDate > appSettings.Tapatalk._lastActionTime) {
		Mojo.Log.info("Updated _lastActionTime");
		appSettings.Tapatalk._lastActionTime = parameters.lastActionTime;
	}
	//appSettings.Tapatalk.headers = parameters.session;
	if (parameters.session) {
		if (!appSettings.Tapatalk.headers || (appSettings.Tapatalk.headers !== parameters.session)) {
			Mojo.Log.info("Marcando como loggedIn");
			appSettings.Tapatalk.headers = parameters.session;
			appSettings.Tapatalk.loggedIn = true;
			//"Simulate Login"
/*
			var activeController = Mojo.Controller.stageController.activeScene();
					appSettings.Tapatalk.forum.get_forum(function(returned){
						activeController.modelChanged(appSettings.Tapatalk.forum);
						activeController.assistant.refreshScene();
			});

*/
		}

	}
	if (!appSettings.subLaunch) {
			appSettings.changingScene = true;
			this.controller = Mojo.Controller.getAppController().getStageController(stageName);
			this.controller.popScenesTo(appSettings.currentScene);
			this.controller.swapScene("messages");
			this.controller.activate();
	}
};

StageAssistant.prototype.populateSessionStatus = function(){
	if (appSettings.subLaunch) {
		Mojo.Log.info("POPULATING LAST CONNECTION");
		var params = {
			method: "_updateSessionStatus",
			stageName: appSettings.parentStage,
			parameters: {
				calledFromStage: appSettings.currentStage,
				session: appSettings.Tapatalk.headers,
				lastActionTime: appSettings.Tapatalk._lastActionTime.toString()
			}
		};

		Mojo.Controller.getAppController().launch(Mojo.Controller.appInfo.id, params);

/*
		var connectionInfoRequest = new Mojo.Service.Request('palm://com.palm.applicationManager', {
			method: 'open',
			parameters: {
				'id': Mojo.Controller.appInfo.id,
				'params': params
			}
		});

*/

	}

};

StageAssistant.prototype.closeChildWindows = function(){

	if(!appSettings.subLaunch) {
		var len = appSettings.subLaunchStages.length;
		Mojo.Log.info("CERRANDO SUBSTAGES: ");
		for (var i = 0; i < len; i++) {
			Mojo.Controller.getAppController().closeStage(appSettings.subLaunchStages[i]);

/*		var len = appSettings.subLaunchStages.length;
		Mojo.Log.info("CERRANDO SUBSTAGES: ");
		for (var i = 0; i < len; i++) {
			var params = {
				method: "_closeStage",
				stageName: appSettings.subLaunchStages[i]
			};

			Mojo.Controller.getAppController().launch(Mojo.Controller.appInfo.id, params);
			*/
/*
			var connectionInfoRequest = new Mojo.Service.Request('palm://com.palm.applicationManager', {
				method: 'open',
				parameters: {
					'id': Mojo.Controller.appInfo.id,
					'params': params
				}
			});

*/		}
	}

};

StageAssistant.prototype.stageClosedNotified = function(parameters){

	Mojo.Log.info("RECEIVED NOTIFICATION OF STAGE CLOSING")
	if(!appSettings.subLaunch) {
		var len = appSettings.subLaunchStages.length;
		for (var i = 0; i < len; i++) {
			if(appSettings.subLaunchStages[i] == parameters.stageName) {
				appSettings.subLaunchStages.splice(i,1);
			}
		}
	}

};

StageAssistant.prototype.forceStageClosing = function() {
	appSettings.forceClosing = true;
	window.close();
};

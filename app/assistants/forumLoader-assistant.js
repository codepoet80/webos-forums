function ForumLoaderAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  Mojo.Log.info("ForumLoader constructor called.");
	  var _logJSON = function(jsonstr) {
		  var nl=jsonstr.indexOf("\n");
		  var idx=0;
		  while (nl>0) {
			  Mojo.Log.info(jsonstr.substring(idx,nl));
			  idx=nl+1;
			  nl=jsonstr.indexOf("\n", idx);
			  if (nl<0 && idx < jsonstr.length) {
				  Mojo.Log.info(jsonstr.substring(idx));
			  }
		  }
	  };

	  if (args) {
		//if (appSettings.debug.detailedLogging) 
		{
			//dumpForumLoaderArgs)
			var tmppwd = null;
			//!appSettings.debug.logPassword &&  //Not sure why this was conditional..
			if (args.forum && args.forum.user_password && !args.forum.encrypted) {
				Mojo.Log.info("record not encrypted, masking password..");
				tmppwd = args.forum.user_password;
				args.forum.user_password="******";
			}

	 		try {
				logJSON("ForumLoader arguments: \n" + JSON.stringify(args,null,2));
			} catch (jsex) {
				Mojo.Log.error("Unable to log json: ", jsex);

			}
	 		if (tmppwd) {
				args.forum.user_password = tmppwd;
			}

		}
		if (args.forum_id) {
			//I don't think this ever gets passed in, unless it was from the gallery, which I doubt.
			Mojo.Log.info("ForumLoader received forum_id:" + args.forum_id);
			var forum_id = args.forum_id;
			var i;
			for (i = 0; i <= appSettings.forums.length - 1; i++) {
				//Mojo.Log.info("CARGANDO FOROS::::", Object.toJSON(appSettings.forums[1]).id);
				if (appSettings.forums[i].id == forum_id) {
					//Mojo.Log.info("FOUND!!!");
					appSettings.currentForum = appSettings.forums[i];
				}
			}

		}
		else
			if (args.forum) {
				Mojo.Log.info("ForumLoader received forum object.");
				appSettings.currentForum = args.forum;
			}
/*	  	if (args.forum) {
	  		this.forum_id = args.id;
	  	}
		if(args.parameters) {
			this.params = args.parameters;
		}
		if (args.galleryForum) {
			this.forum = args.galleryForum;
		}
*/
	  }
	  else {
	  	Mojo.Log.info("ForumLoader(args) RECEIVED NO ARGUMENTS");
	  }
}

ForumLoaderAssistant.prototype.setup = function() {
	  Mojo.Log.info("ForumLoader.setup() called.");
	/* this function is for setup tasks that have to happen when the scene is first created */

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */

	/* setup widgets here */

	/* add event handlers to listen to events from widgets */

		this.appMenuModel = {
		visible: false,
		items: []
	};

		this.controller.setupWidget(Mojo.Menu.appMenu, {
			omitDefaultItems: true
		}, this.appMenuModel);


	this.controller.get("forum_icon").src = appSettings.currentForum.logo;
	this.showErrorDialog = this.showErrorDialog.bind(this);
};

ForumLoaderAssistant.prototype.aboutToActivate = function() {
	  Mojo.Log.info("ForumLoader.aboutToActivate() called.");


};

ForumLoaderAssistant.prototype.activate = function(event) {
	  Mojo.Log.info("ForumLoaderAssistant.activate() called.");
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
/*	  var that = this;
	appSettings.Database.getData("storedForums",'', function(response) {
		Mojo.Log.info(Object.toJSON(response));
		appSettings.forums = response;
		//this.controller=Mojo.Controller.stageController.activeScene();
		that.controller.stageController
	});
*/

//Comprueba que haya sido visitado, si no, lo añade al historial.

	appSettings.Database.getData("forumsHistory",'', function(response){
		appSettings.forumsHistory = response;

		var previouslyVisited = false;
		//Mojo.Log.info("CURRENT FORUM: ", Object.toJSON(appSettings.currentForum));
		appSettings.forumsHistory.each(function(item){
			if (item.id == appSettings.currentForum.id) {
				item.last_visit = Date.now().toString();
				previouslyVisited = true;
			}
		});
		if (!previouslyVisited) {
			var newForum = Object.clone(appSettings.currentForum);
			newForum.last_visit = Date.now().toString();
			appSettings.forumsHistory.push(newForum);
		}
		appSettings.Database.saveData("forumsHistory", appSettings.forumsHistory);


	});


	try {

	var that = this;


/*
	var remoteServer = appSettings.currentForum.url.replace(/mobiquo\056php$/i, "") // remove ending "mobiquo.php"
    remoteServer = remoteServer.replace(/mobiquo\057$/i, "") // remove ending "mobiquo/", if any
    remoteServer = remoteServer.replace(/mobiquo$/i, "") // remove ending "mobiquo", if any
    remoteServer = remoteServer.replace(/\057$/i, "") // remove ending "/", if any
	remoteServer = remoteServer + "/" + appSettings.currentForum.mobiquo_dir + "/mobiquo." + appSettings.currentForum.extension;

	Mojo.Log.info(remoteServer);

*/
	Mojo.Log.info("ForumLoader.activate() creating Tapatalk object for " + appSettings.currentForum.url);
	if (!appSettings.currentForum.url) {
		Mojo.Log.error("ForumLoader.activate(), currentForum.url is empty!");
		logJSON("ForumLoader.activate(), currentForum: " + JSON.stringify(appSettings.currentForum,null,2));
	}
	var userPwd = appSettings.currentForum.user_password;
	if (appSettings.currentForum.encrypted) {
		Mojo.Log.info("Decrypting password to prepare for forum encoding..");
		Mojo.Log.info("Encrypted password:" + userPwd);
		userPwd = Mojo.Model.decrypt("com.newnessdevelopments.forums",appSettings.currentForum.user_password);
		if (appSettings.debug.logPassword) {
			Mojo.Log.info("Decrypted password:" + userPwd);
		}
	}
	else {
		Mojo.Log.info("Record was not encrypted.. password:" + userPwd);
	}
	
	var testMode = false;
	if (true) {
	appSettings.Tapatalk = new Tapatalk(appSettings.currentForum.url, appSettings.currentForum.user_name, userPwd, function(result) {
		//callback in ForumLoader called by Tapatalk constructor
		Mojo.Log.info("Forum loader, Tapatalk constructor called callback. " + result);
		if (appSettings.debug.detailedLogging) {
			logJSON("Result: " + JSON.stringify(result));
		}
		if (result == false) {
			//Connect failed, return to calling scene (generally main, possibly others?)
			Mojo.Log.error("ForumLoader.activate(), Taptalk constructor returned false.");
			that.controller.stageController.popScene();
		}
		else {
			//this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
			//tapatalk.forum.get_config(function(result){
				
			if (result.guest_okay == false) {
				Mojo.Log.info("FormLoader, guestOkay==false");
				//appSettings.headers = result.cookie;
				//Mojo.Log.info(Object.toJSON(result));
				//appSettings.headers ="";
				if (appSettings.Tapatalk.config.disable_search == "1") {
					MenuData.ApplicationMenu.Search.disabled = true;
					MenuData.CommandMenu.Search.disabled = true;
				}
				else {
					MenuData.ApplicationMenu.Search.disabled = false;
					MenuData.CommandMenu.Search.disabled = false;
				}

				if (appSettings.Tapatalk.config.disable_lastest == "1") {
					MenuData.ApplicationMenu.Lastest.disabled = true;
					MenuData.CommandMenu.Recent.disabled = true;
				}
				else {
					MenuData.ApplicationMenu.Lastest.disabled = false;
					MenuData.CommandMenu.Recent.disabled = false;
				}

					that.controller.get("status-message").innerHTML = $L("This Forum requires authentication");
					//this.controller = Mojo.Controller.StageController.activeScene();
					var logInCallback = function(response){
						appSettings.Tapatalk.loggedIn = true;
						if (!that.params) {
							that.controller.stageController.swapScene(getDefaultView(true));
						}
						else {
							if (!that.params.scene) {
								that.controller.stageController.swapScene(getDefaultView(true), that.params); //"forums"
							}
							else {
								var sceneName = "";
								switch (that.params.scene) {
									case "forums":
										sceneName = "forums";
										break;
									case "recent":
										sceneName = "recentPosts";
										break;
									case "subscribed":
										sceneName = "subscribedPosts";
										break;
									case "search":
										sceneName = "search";
										break;
									case "messages":
										sceneName = "messages";
										break;
									default:
										sceneName = "forums";
								}
								that.controller.stageController.swapScene(sceneName);
							}
						}

					};
					this.controller = Mojo.Controller.stageController.activeScene();
					this.controller.stageController.assistant._showLoginDialog(logInCallback.bind(this));



			} //!guest_okay
			else {
				Mojo.Log.info("FormLoader, guestOkay==true");
				//Mojo.Log.info(Object.toJSON(result));
				//appSettings.headers ="";
				if (appSettings.Tapatalk.config.disable_search == "1") {
					MenuData.ApplicationMenu.Search.disabled = true;
					MenuData.CommandMenu.Search.disabled = true;
				}
				else {
					MenuData.ApplicationMenu.Search.disabled = false;
					MenuData.CommandMenu.Search.disabled = false;
				}

				if (appSettings.Tapatalk.config.disable_lastest == "1") {
					MenuData.ApplicationMenu.Lastest.disabled = true;
					MenuData.CommandMenu.Recent.disabled = true;
				}
				else {
					MenuData.ApplicationMenu.Lastest.disabled = false;
					MenuData.CommandMenu.Recent.disabled = false;
				}

				that.controller.get("status-message").innerHTML = $L("Retrieving Forum Data...");

				if (!testMode && appSettings.config.autoLogin == "true") {
					//If there are no credentials, ignore autologin
					if (appSettings.currentForum.user_name == "") {
							Mojo.Log.info("autoLogin true, but no credentials.");
								if (!that.params) {
									that.controller.stageController.swapScene(getDefaultView(false)); //"forums");
								}
								else {
									//Mojo.Log.info("Switching scene...");
									if (!that.params.scene) {
										that.controller.stageController.swapScene(getDefaultView(false), that.params); //"forums"
									} else {
										var sceneName ="";
										switch (that.params.scene) {
											case "forums":
												sceneName = "forums";
												break;
											case "recent":
												sceneName = "recentPosts";
												break;
											case "subscribed":
												sceneName = "subscribedPosts";
												break;
											case "search":
												sceneName = "search";
												break;
											case "messages":
												sceneName = "messages";
												break;
											default:
												sceneName = "forums";
										}
										that.controller.stageController.swapScene(sceneName);
									}
								}
/*
						appSettings.Tapatalk.forum.get_forum(function(returned){
							if (returned != false) {
								if (!that.params) {
									that.controller.stageController.swapScene(appSettings.config.defaultView);
								}
								else {
									that.controller.stageController.swapScene("forums", that.params);
								}
							}
							else {
								Mojo.Controller.errorDialog("This forum seems to be incompatible.");
							}
						});

*/
					}
					else {
						//forum autologin
						//mw temp, why does it set logged in before actually logging in?  In case user did not log out? Could well be.
						//appSettings.Tapatalk.loggedIn = true;
						Mojo.Log.info("ForumLoader, calling Authenticate (after setting loggedIn to true)");
						appSettings.Tapatalk.authenticate(function(response){
								Mojo.Log.info("Returned from Tapatalk.authenticate(), LOGGED IN: ", this.loggedIn);
								//TODO: need to work on this.. if we let the scene push, it doesn't show the dialog, plus if autologin is set, it will
								//not give you a chance to change your password.  If we swap to a scene to change password, what to do when done? Swap again?
								//Perhaps we can un-set the autologin or set some 'loginfailed' var, so it prompts for credentials instead of just trying to
								//log in with the stored password again.
								logJSON("ForumLoader, Login result: " + JSON.stringify(response));
								if (!that.params) {
									if (response && !response.result) {
//										if (response.result_text) {
//											that.controller.get('error-message').innerHTML = response.result_text
//										} else {
//											that.controller.get('error-message').innerHTML = $L("Login Error. Please check your credentials");
//										}
										delete appSettings.currentForum.user_password;
										that.showErrorDialog(response.result_text ? response.result_text : $L("Login Error. Please check your credentials"));
									}
									else {
										that.controller.stageController.swapScene(getDefaultView(true));
									}
								}
								else {
									if (response && !response.result) {
//										if (response.result_text) {
//											that.controller.get('error-message').innerHTML = response.result_text
//										} else {
//											that.controller.get('error-message').innerHTML = $L("Login Error. Please check your credentials");
//										}
										delete appSettings.currentForum.user_password;
										that.showErrorDialog(response.result_text ? response.result_text : $L("Login Error. Please check your credentials"));
									}
									else {
									if (!that.params.scene) {
										that.controller.stageController.swapScene(getDefaultView(true), that.params); //"forums"
									} else {
										var sceneName ="";
										switch (that.params.scene) {
											case "forums":
												sceneName = "forums";
												break;
											case "recent":
												sceneName = "recentPosts";
												break;
											case "subscribed":
												sceneName = "subscribedPosts";
												break;
											case "search":
												sceneName = "search";
												break;
											case "messages":
												sceneName = "messages";
												break;
											default:
												sceneName = "forums";
										}
										that.controller.stageController.swapScene(sceneName);
									}
									}
								}

/*
							appSettings.Tapatalk.forum.get_forum(function(returned){
								if (!that.params) {
									that.controller.stageController.swapScene(appSettings.config.defaultView);
								}
								else {
									that.controller.stageController.swapScene("forums", that.params);
								}
							});

*/						});
					}
				} //!testMode && autoLogin==true
				else {
					//Not logging in, so only use default if doesn't require login
					appSettings.Tapatalk.forum.get_forum(function(returned){
						if (!that.params) {
							that.controller.stageController.swapScene(getDefaultView(false)); //"forums");
						}
						else {
							that.controller.stageController.swapScene(getDefaultView(false), that.params); //"forums"
						}
					});
				}
			}

		}
	}, this.getConfigFail.bind(this));
	} //if testMode
	else {
		Mojo.Log.info("Not opening forum, we are in test mode.");
	}


			//});
	}
	catch (e) {
		Mojo.Log.error("Forums - forums Scene aboutToActivate: ", e);
	}
};

//mw localize this function
ForumLoaderAssistant.prototype.showErrorDialog = function(message) {
	this.controller.showAlertDialog({
		onChoose: function(value){
			//if (value == 'OK') {
			//}
			//Mojo.Controller.stageController.popScene();
			//this.setWaitingFeedback(false);
			//Do nothing?
			this.controller.stageController.swapScene(getDefaultView(false));
		},
		title: $L("Login error"),
		message: $L(message),
		choices: [{
			label: $L('Ok'),
			value: 'OK',
			type: 'standard'
		}]
	});
	
};

ForumLoaderAssistant.prototype.getConfigFail = function(err) {
	  Mojo.Log.info("ForumLoader.getConfigFail() called.");
	//Mojo.Log.info("getConfigFail: ", Object.toJSON(err));

	var	errorMessage = $L("Network error, can't connect to the server.");
	//var controller = Mojo.Controller.stageController.activeScene();
	this.controller.showAlertDialog({
		onChoose: function(value){
			if (value == 'OK') {
				Mojo.Controller.stageController.popScene();
			}
			//Mojo.Controller.stageController.popScene();
			//callback(false);
		},
		title: $L("Error"),
		message: errorMessage,
		preventCancel: true,
		choices: [{
			label: $L('Ok'),
			value: 'OK',
			type: 'standard'
		}]
	});

};

ForumLoaderAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

ForumLoaderAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
};

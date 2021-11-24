var Tapatalk = Class.create(
{
	initialize: function(url, user, password, callback, callbackError) {

	try {
		this.ipAddressHasChanged = false;
		this.loggedIn = false;
		this.headers = "";
		this._lastActionTime = new Date();
		this.config = {};

		var remoteServer = url.replace(/mobiquo\056php$/i, "") // remove ending "mobiquo.php"
		remoteServer = remoteServer.replace(/mobiquo\057$/i, "") // remove ending "mobiquo/", if any
		remoteServer = remoteServer.replace(/mobiquo$/i, "") // remove ending "mobiquo", if any
		remoteServer = remoteServer.replace(/\057$/i, "") // remove ending "/", if any
	    if (remoteServer.indexOf("proboards.com") > 0) {
	    	//Proboards..
	    	//http://tstoforum.com/mobiquo/index.cgi?action=tapatalk3
	    	remoteServer = url;
	    	appSettings.currentForum.extension = "cgi";
	    }
	    else
	    {
			remoteServer = remoteServer + "/" + appSettings.currentForum.mobiquo_dir + "/mobiquo." + appSettings.currentForum.extension;
	    }

		Mojo.Log.info("Tapatalk.initialize(), appSettings.currentForum.extension: " + appSettings.currentForum.extension);
		Mojo.Log.info("Tapatalk.initialize(), remoteServer: " + remoteServer);

		this.Mobiquo_is_login = false;
		this.url = remoteServer;
		this.username = user;
		this.password = password;
		this.username64 = new Base64Holder(Base64.encode(user));
		this.password64 = new Base64Holder(Base64.encode(password));


		this.forum = new Forum(this);
		this.post = new Post(this);
		this.privateMessage = new PrivateMessage(this);
		this.search = new Search(this);
		this.subscription = new Subscription(this);
		this.topic = new Topic(this);
		this.user = new User(this);
		this.social = new Social(this);
		this.others = new Others(this);

		this.connection = new ConnectionManager(this);
		this.forum.get_config(function(result) {
			if (appSettings.debug.detailedLogging) {
				logJSON("Tapatalk.initialize(), API config info: \n" + JSON.stringify(result,null,2));
			}
			//Mojo.Log.warn("API config info: ", Object.toJSON(result));
			try {
				if (result.api_level == "3") {
					Mojo.Log.info(result.version);
					var forumEngine = result.version.split("_");
					switch(forumEngine[0].substr(0,2)) {
						case "vb":
						case "pb":
							result.enableCopy = true;
							break;
						default:
							result.enableCopy = false;
					}
					Mojo.Log.warn("API LEVEL 3");
					callback(result);
				}
				else if (result.api_level == "4") {
					//mcw test for version 4 of plugin
					Mojo.Log.info(result.version);
					var forumEngine = result.version.split("_");
					switch(forumEngine[0].substr(0,2)) {
						case "vb":
						case "pb":
							result.enableCopy = true;
							break;
						default:
							result.enableCopy = false;
					}
					Mojo.Log.warn("API LEVEL 4");
					callback(result);
				}
				else
					if (result.error) {
						var errorMessage = "";
						switch (result.error) {
							case 404:
								errorMessage = $L("Can't connect to the forum. Please ask your forum Admin about Tapatalk Support");
								break;
							case 503:
								errorMessage = $L("Error 503 - Service Unavailable. The forum server may be overloaded or under maintenance.");
								break;
							default:
								errorMessage = $L("Network error, can't connect to the server.");
						}
						var controller = Mojo.Controller.stageController.activeScene();
						controller.showAlertDialog({
							onChoose: function(value){
								Mojo.Log.warn("Tapatalk.forum.get_config callback, error received, displaying error dialog..");
								Mojo.Log.warn("onchoose value: " + value);
								//if (value == 'OK') {

								//}
								//Mojo.Controller.stageController.popScene();
								if (callback) {
									Mojo.Log.warn("Callback passed, calling callback");
									callback(result);
								}
								else {
									Mojo.Log.warn("No callback passed, calling popScene()");
									Mojo.Controller.stageController.popScene();
								}
							},
							title: $L("Error"),
							message: errorMessage,
							choices: [{
								label: $L('Ok'),
								value: 'OK',
								type: 'standard'
							}]
						});
					}
					else {
						Mojo.Log.warn("Tapatalk.forum.get_config callback, no api_level or error received, displaying error dialog..");
						var controller = Mojo.Controller.stageController.activeScene();
						controller.showAlertDialog({
							onChoose: function(value){
								Mojo.Log.warn("onchoose value: " + value);
								//if (value == 'OK') {

								//}
								//Mojo.Controller.stageController.popScene();
								if (callback) {
									Mojo.Log.warn("Callback passed, calling callback");
									callback(result);
								}
								else {
									Mojo.Log.warn("No callback passed, calling popScene()");
									Mojo.Controller.stageController.popScene();
								}
							},
							title: $L("Incompatible Forum"),
							message: $L("This forum uses an old version of the Tapatalk plugin. Please ask your forum admins to update the plugin to the lastest version. You'll be limited to read-only mode until they update the plugin."),
							choices: [{
								label: $L('Ok'),
								value: 'OK',
								type: 'standard'
							}]
						});

					}
			} catch (e) {
				Mojo.Log.error("Tapatalk Initialize get_config: ", e);
			}
		}, callbackError);

	} catch (e) {
		Mojo.Log.error("Tapatalk Initialize: ", e);
		Mojo.Log.error("Stack: ", e.stack);
	}
	},
	set_user_name: function(user) {
		this.username = user;
		this.username64 = new Base64Holder(Base64.encode(user));
	},
	set_user_password: function(password) {
		this.password = password;
		this.password64 = new Base64Holder(Base64.encode(password));
	},
	authenticate: function(callback) {
		try {
			if (appSettings.debug.detailedLogging) {
				try { Mojo.Log.info("authenticate() caller: " + arguments.callee.caller.toString()); } catch (ex) {Mojo.Log.info("Unable to log caller");}
				try { Mojo.Log.info("authenticate() caller: " + authenticate.caller ); } catch (ex) {Mojo.Log.info("Unable to log caller." + ex.stack);}
			}
			var that = this;
			Mojo.Log.info("Tapatalk.authenticate(), LOGGED IN: ", this.loggedIn);
			//Mojo.Controller.getAppController().showBanner($L("Re-authenticating..."), "", "");
			if (this.loggedIn) {
				Mojo.Log.info("Tapatalk.authenticate(), calling logout_user: ", appSettings.Tapatalk.config.version);
//				if(!appSettings.Tapatalk.config.version.startsWith("huddler")) {
					this.user.logout_user(function(response){
						Mojo.Log.info("Tapatalk.authenticate(), logged out, now login again...");
						that.user.login(function(response){
							logJSON("Tapatalk.authenticate(), Login result: " + JSON.stringify(response));
							if (response.result == true) {
								that.headers = response.cookie;
								//appSettings.visual.defaultCommandMenu.items[1].items[1].disabled = false;
								//appSettings.visual.defaultCommandMenu.items[1].items[3].disabled = false;
								//isValid = true;
								that.connection.reauthenticate = false;
								that.loggedIn = true;
								callback();
							}
						});
					});
/*				} else {
					Mojo.Log.info("is a huddler forum");
					this.user.login(function(response){
						if (response.result == true) {
							that.headers = response.cookie;
							//appSettings.visual.defaultCommandMenu.items[1].items[1].disabled = false;
							//appSettings.visual.defaultCommandMenu.items[1].items[3].disabled = false;
							//isValid = true;
							that.connection.reauthenticate = false;
							that.loggedIn = true;
							callback();
						}
					});
				}
*/
			} else {
					Mojo.Log.info("Tapatalk.authenticate(), calling login");
					this.user.login(function(response){
						logJSON("Tapatalk.authenticate(), Login result: " + JSON.stringify(response));
						if (response.result == true) {
							that.headers = response.cookie;
							//appSettings.visual.defaultCommandMenu.items[1].items[1].disabled = false;
							//appSettings.visual.defaultCommandMenu.items[1].items[3].disabled = false;
							//isValid = true;
							that.connection.reauthenticate = false;
							that.loggedIn = true;
							callback();
						}
						else {
							Mojo.Log.error("Taptalk.authenticate(), result was false:" + JSON.stringify(response));
							//mw added callback, which *should* check login result!
							callback(response);
						}
					});
			}
		} catch(e) {
			Mojo.Log.error("REAUTHENTICATE: ", e);
		}
	},
	errorHandler: function(errorObject, callback) {
		Mojo.Log.info("Tapatalk.errorHandler: ", Object.toJSON(errorObject));
			//var controller = Mojo.Controller.stageController.activeScene();
			if (errorObject.faultCode)
			var errorCode = errorObject.faultCode;
			if (errorObject.error)
			var errorCode = errorObject.error;

		switch (errorCode.toString()) {
			case "6":
				Mojo.Log.error("ERROR 6");
				var args = {
					mode: "forumLogin",
					forum_id: errorObject.forum_id
				};
				this.controller = Mojo.Controller.stageController.activeScene();
				var assistant = this.controller.stageController.assistant;

				/*
this.controller.showDialog({
					template: 'main/userForumSetupCredentials-scene',
					assistant: new UserForumSetupCredentialsDialogAssistant(this, function(result){
						Mojo.Log.info(result);
					}.bind(this), args),
					preventCancel: false
				});

*/				break;
			case "9":
			case "20":
			case "21":
				Mojo.Log.info("forcing reauthenticate");
				callback({error:"reauthenticate"});

/*
				this.controller.showDialog({
					template: 'main/userForumSetupCredentials-scene',
					assistant: new UserForumSetupCredentialsDialogAssistant(this, function(response){
						Mojo.Log.info(Object.toJSON(response));
						callback(response);
					}.bind(this), args),
					preventCancel: false
				});

*/




				break;
			default:
				callback(errorObject);
/*
					controller.showAlertDialog({
						onChoose: function(value){
							//if (value == 'OK') {
							callback({
								result: false
							});
						//}
						//Mojo.Controller.stageController.popScene();
						},
						title: $L("Error"),
						message: $L(errorObject.faultText),
						choices: [{
							label: $L('Ok'),
							value: 'OK',
							type: 'standard'
						}]
					});

*/		}
		//Mojo.Controller.getAppController().showBanner(errorObject.faultString, "", "");
		//callback();
		//calledFrom();
	},
	lastActionTime: function(newTime) {
		if(newTime) {
			_lastActionTime = newTime;

/*
			if(appSettings.subLaunch) {
				Mojo.Log.info("POPULATING LAST CONNECTION");
				var params = {
					method: "_updateSessionStatus",
					stageName: appSettings.parentStage,
					parameters: {
						session: this.headers,
						lastActionTime: _lastActionTime
					}
				};
				var connectionInfoRequest = new Mojo.Service.Request('palm://com.palm.applicationManager', {
					method: 'open',
					parameters: {
						'id': Mojo.Controller.appInfo.id,
						'params': params
					}
				});

			}

*/

		} else {
			return _lastActionTime;
		}
	}
});

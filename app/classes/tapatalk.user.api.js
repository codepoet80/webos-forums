var User = Class.create(
{
	initialize: function(parent){

		this.parent = parent;
		Mojo.Log.info("User Initialize");


	},
	login: function(callback){
		try {
			var callbackOk = function(response){
				try {
					this.parent.lastActionTime(new Date());
					this.parent.loggedIn = response.result;
					if (appSettings.debug.detailedLogging) {
						logJSON("Tapatalk login response: \n" + JSON.stringify(response,null,2));
					}
					//				if (!response.cookie.startsWith("bblastactivity")) {
					this.parent.headers = response.cookie;

					callback(response);

					//				} else {
					//					this.logout_user(this.login(callback));
					//				}

				}
				catch (e) {
					Mojo.Log.error("TAPATALK API ERROR: login.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
					//showErrorDialog("Login Error", err );
					Mojo.Log.error("TAPATALK API ERROR: login.fail - ", err);
					Mojo.Controller.getAppController().showBanner(err, "", "");
				}
				catch (e) {
					Mojo.Log.error(e);
				}

			};
			var callbackDone = function(){

			};

			callbackOk = callbackOk.bind(this);
			callbackFail = callbackFail.bind(this);
			callbackDone = callbackDone.bind(this);

			var apiName = {
				authorize_user: "authorize_user",
				login: "login"
			};
			var selectedApi;
			var user;
			var password;

			//Do not log password!
			//Mojo.Log.info(this.parent.username, this.parent.password);
/*			switch (this.parent.config.api_level) {
				case "3":
*/
					selectedApi = apiName.login;
					//user = new Base64Holder(Base64.encode("admin"));
					//password = new Base64Holder(Base64.encode("651857"));
					user = this.parent.username64;
					password = this.parent.password64;
//					break;
/*
				default:
					var configArray = this.parent.config.version.split("_");

					Mojo.Log.info(configArray[0]);
					switch (configArray[0]) {
						case "vb38":
							Mojo.Log.info("VBULLETIN38");
							user = this.parent.username64;
							password = this.parent.password;
							break;
						case "pb30":
							Mojo.Log.info("PHPBB");
							user = this.parent.username64;
							password = this.parent.password64;
							break;
						case "sm20":
							Mojo.Log.info("Simple Machines");
							user = this.parent.username64;
							password = this.parent.password64;
					}
					if (configArray[1] < "1.7.0") {
						selectedApi = apiName.authorize_user;
					}
					if (configArray[1] >= "1.7.0") {
						selectedApi = apiName.authorize_user;
					//password = hex_md5(trim(this.parent.password));
					}
					if (configArray[0] == "sm20") {
						selectedApi = apiName.login;
					}

		}
*/

			Mojo.Log.info("Tapatalk.User.login() calling " + selectedApi + ", encoded USER_LOGIN: ", user, password);
			xmlrpc(this.parent.url, selectedApi, [user, password], {
				done: callbackOk,
				error: callbackFail,
				close: callbackDone
			});
		}
		catch (e) {
			Mojo.Log.error("tapatalk LOGIN ERROR: ", e);
		}
	},
	logout_user: function(callback){
		if (!callback) {
			var callback = function(){
				//appSettings.headers = "";
				this.parent.headers = "";
				this.parent.loggedIn = false;
				Mojo.Log.info("LOGOUT DONE");
				var stage = Mojo.Controller.stageController;

			}
		}

		var callbackOk = function(response){
			try {
				Mojo.Log.info("LOGOUT response: ", JSON.stringify(response));
				this.parent.headers = "";
				this.parent.loggedIn = false;
				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: logout.ok - ", e);
			}
		};

		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: logout_user.fail - ", JSON.stringify(err));
				this.parent.headers = "";
				this.parent.loggedIn = false;
				callback();
			}
			catch (e) {
				Mojo.Log.error(e);
			}

		};

		callbackOk = callbackOk.bind(this);
		callbackFail = callbackFail.bind(this);

		xmlrpc(this.parent.url, "logout_user", [], {
			done: callbackOk,
			error: callbackFail,
			close: function(){
			}
		});

	},
	get_user_info: function(user_name, callback){

		Mojo.Log.info("get_user_info: " + user_name);
		var callbackOk = function(response){
			try {

				this.parent.lastActionTime(new Date());
				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_user_info.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_user_info.fail - ", err);
				Mojo.Controller.getAppController().showBanner(err, "", "");
				Mojo.Controller.stageController.popScene();
			}
			catch (e) {
				Mojo.Log.error(e);
			}

		};
		var callbackDone = function(){

		};

		callbackOk = callbackOk.bind(this);
		callbackFail = callbackFail.bind(this);
		callbackDone = callbackDone.bind(this);

		var userName = new Base64Holder(Base64.encode(user_name));
		var args = [userName];

		//Mojo.Log.info(this.parent.url);
		xmlrpc(this.parent.url, "get_user_info", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	get_user_topic: function(user_name, callback){

		Mojo.Log.info("get_user_topic: " + user_name);
		var callbackOk = function(response){
			try {

				this.parent.lastActionTime(new Date());
				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_user_topic.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_user_topic.fail - ", err);
				Mojo.Controller.getAppController().showBanner(err, "", "");
				Mojo.Controller.stageController.popScene();
			}
			catch (e) {
				Mojo.Log.error(e);
			}

		};
		var callbackDone = function(){

		};

		callbackOk = callbackOk.bind(this);
		callbackFail = callbackFail.bind(this);
		callbackDone = callbackDone.bind(this);

		var userName = new Base64Holder(Base64.encode(user_name));
		var args = [userName];

		//Mojo.Log.info(this.parent.url);
		xmlrpc(this.parent.url, "get_user_topic", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	get_user_reply_post: function(user_name, callback){

		Mojo.Log.info("get_user_reply_post: " + user_name);
		var callbackOk = function(response){
			try {

				this.parent.lastActionTime(new Date());
				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_user_reply_post.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_user_reply_post.fail - ", err);
				Mojo.Controller.getAppController().showBanner(err, "", "");
				Mojo.Controller.stageController.popScene();
			}
			catch (e) {
				Mojo.Log.error(e);
			}

		};
		var callbackDone = function(){

		};

		callbackOk = callbackOk.bind(this);
		callbackFail = callbackFail.bind(this);
		callbackDone = callbackDone.bind(this);

		var userName = new Base64Holder(Base64.encode(user_name));
		var args = [userName];

		//Mojo.Log.info(this.parent.url);
		xmlrpc(this.parent.url, "get_user_reply_post", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
});

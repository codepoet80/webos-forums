//FALTA LOGIN_FORUM
var Forum = Class.create({


	initialize: function(parent) {

		this.parent = parent;

		//this.getConfig(callback);
		Mojo.Log.info("Forums Initialize");

	},
	forums: [],
	unreadMessagesCount: 0,
	get_config: function(callback, callbackError) {

		//this.parent.checkConnection(function(testResult) {
		//Mojo.Log.info("CHECK CONNECTION: ", testResult);
		var callbackOk = function(response){
			try {
				//Mojo.Log.info("GET_CONFIG.callbackOk(): ", Object.toJSON(response));
/*
				AdMob.ad.initialize({
					pub_id: response, // your publisher id
					bg_color: '#fff', // optional background color, defaults to #fff
					text_color: '#', // optional background color, defaults to #000
					test_mode: true // optional, set to true for testing ads, remove or set to false for production
				});

*/
				this.parent.config = response;

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_config.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_config.fail - ", Object.toJSON(err));
				//Mojo.Log.info("trying to recover...");
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				Mojo.Log.warn("Calling error callback.");
				callbackError(err);
				//this.parent.errorHandler(e);
			}
			catch (e) {
				Mojo.Log.error("Exception in get_config.fail callback: " + JSON.stringify(e));
				this.parent.errorHandler(e);
			}

		};
		var callbackDone = function(){

		};

		callbackOk = callbackOk.bind(this);
		callbackFail = callbackFail.bind(this);
		callbackDone = callbackDone.bind(this);

		Mojo.Log.info("calling Tapatalk.get_config xmlrpc @ " + this.parent.url);
		xmlrpc(this.parent.url, "get_config", {}, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
//		});
	},
	get_forum: function(callback){

		var formattedStructure = [];
		var callbackOk = function(response){
			try {
				if (appSettings.debug.detailedLogging) {
					try {
						logJSON("Tapatalk.Forum.get_forum(), response: " + JSON.stringify(response,null,2));
					} catch (ex) {
						Mojo.Log.info("Object too complex to build json string");
					}
				}
				this.parent.lastActionTime(new Date());
				this.forums.clear();

				//this.forums = response;
				//Mojo.Log.info("Recibidos foros: ", response.length);

				var parseTree = function(item){
					for (x = 0; x < item.length; x++) {
						if (!item[x].child) {
							formattedStructure.push(item[x]);

						}
						else {
							for (i = 0; i < item[x].child.length; i++) {
								item[x].child[i].category = item[x].forum_name;
								formattedStructure.push(item[x].child[i]);
								parseTree(item[x].child[i]);
							}
						}
					}
				}

				for (x = 0; x < response.length; x++) {
					if (!response[x].child) {
						formattedStructure.push(response[x]);

					} else {
						for (i = 0; i < response[x].child.length; i++) {
							response[x].child[i].category = response[x].forum_name;
							formattedStructure.push(response[x].child[i]);
						}
					}
				}

/*
				response.each(function(item){
					if (!item.child) {
						formattedStructure.push(item);

					} else {
						item.child.each(function(child) {
							child.category = item.forum_name;
							formattedStructure.push(child);
						});
					}
				});

*/
				//Mojo.Log.info("ARBOL COMPLETADO");
				this.forums = formattedStructure;

//Mojo.Log.info(Object.toJSON(formattedStructure));
				callback(formattedStructure);

			}
			catch (e) {
				Mojo.Log.error("Exception in get_forum.callbackOk() - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_forum.callbackFail() - ", Object.toJSON(err));
				//Mojo.Controller.getAppController().showBanner(err, "", "");
			}
			catch (e) {
				Mojo.Log.error(e);
			}

		};
		var callbackDone = function(){
			Mojo.Log.info( "get_forum: callbackDone()");
		};

		callbackOk = callbackOk.bind(this);
		callbackFail = callbackFail.bind(this);
		callbackDone = callbackDone.bind(this);

		//Mojo.Log.info(this.parent.url);
		xmlrpc(this.parent.url, "get_forum", {}, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		}, true);
	},
	mark_all_as_read: function(callback){

			var callbackOk = function(response){
				try {
					this.parent.lastActionTime(new Date());
					//this.forums.clear();

					//this.forums = response;
					callback(response);

				}
				catch (e) {
					Mojo.Log.error("GRAVATAR API ERROR: mark_all_as_read.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
					//showErrorDialog("Login Error", err );
					Mojo.Log.error("GRAVATAR API ERROR: mark_all_as_read.fail - ", err);
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

			xmlrpc(this.parent.url, "mark_all_as_read", {}, {
				done: callbackOk,
				error: callbackFail,
				close: callbackDone
			});
	},

	mark_as_read: function(forum_id, callback){

			var callbackOk = function(response){
				try {
					this.parent.lastActionTime(new Date());
					//this.forums.clear();

					//this.forums = response;
					callback(response);

				}
				catch (e) {
					Mojo.Log.error("GRAVATAR API ERROR: mark_all_as_read.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
					//showErrorDialog("Login Error", err );
					Mojo.Log.error("GRAVATAR API ERROR: mark_all_as_read.fail - ", err);
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

			xmlrpc(this.parent.url, "mark_all_as_read", [forum_id], {
				done: callbackOk,
				error: callbackFail,
				close: callbackDone
			});
	},
//TO BE DONE:
	login_forum: function(forum_id, password, callback){
		//callback({errorMessage: "Not done yet"});

		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());
				//this.forums.clear();

				//this.forums = response;
				//Mojo.Log.info("LOGGED IN THE FORUM");
				callback(response);

			}
			catch (e) {
				Mojo.Log.error("GRAVATAR API ERROR: login_forum.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("GRAVATAR API ERROR: login_forum.fail - ", err);
				//Mojo.Controller.getAppController().showBanner($L("Error requesting forum data"), "", "");
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

		//Mojo.Log.info(this.parent.url);
		var forumPassword = new Base64Holder(Base64.encode(password));

		var args = [forum_id.toString(), forumPassword];

		xmlrpc(this.parent.url, "login_forum", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});


	},
	get_id_by_url: function(url, callback, callbackError) {

		//this.parent.checkConnection(function(testResult) {
		//Mojo.Log.info("CHECK CONNECTION: ", testResult);
		var callbackOk = function(response){
			try {
				//Mojo.Log.info("GET_ID_BY_URL: ", Object.toJSON(response));
				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_config.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_id_by_url.fail - ", Object.toJSON(err));
				//Mojo.Log.info("trying to recover...");
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				callbackError(err);
				//this.parent.errorHandler(e);
			}
			catch (e) {
				this.parent.errorHandler(e);
			}

		};
		var callbackDone = function(){

		};

		callbackOk = callbackOk.bind(this);
		callbackFail = callbackFail.bind(this);
		callbackDone = callbackDone.bind(this);

		//Mojo.Log.info(this.parent.url);
		xmlrpc(this.parent.url, "get_id_by_url", [url], {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
//		});
	},

});
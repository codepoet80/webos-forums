var Post = Class.create(
{
	initialize: function(parent){

		this.parent = parent;
		Mojo.Log.info("Posts Initialize");

	},
	like_post: function(post_id, callback){

		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: like_post.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: like_post.fail - ", Object.toJSON(err));
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				if (err.startsWith("Please login") || err.startsWith("security error")) {
					Mojo.Log.info("PLEASE REAUTHENTICATE!!!!!!");
					callback({error: "reauthenticate"});
				}
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

		var args = [post_id];

		//Mojo.Log.info(this.parent.url);
		xmlrpc(this.parent.url, "like_post", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	unlike_post: function(post_id, callback){

		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: unlike_post.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: unlike_post.fail - ", Object.toJSON(err));
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				if (err.startsWith("Please login") || err.startsWith("security error")) {
					Mojo.Log.info("PLEASE REAUTHENTICATE!!!!!!");
					callback({error: "reauthenticate"});
				}
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

		var args = [post_id];

		//Mojo.Log.info(this.parent.url);
		xmlrpc(this.parent.url, "unlike_post", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	thank_post: function(post_id, callback){

		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: thank_post.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: thank_post.fail - ", Object.toJSON(err));
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				if (err.startsWith("Please login") || err.startsWith("security error")) {
					Mojo.Log.info("PLEASE REAUTHENTICATE!!!!!!");
					callback({error: "reauthenticate"});
				}
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

		var args = [post_id];

		//Mojo.Log.info(this.parent.url);
		xmlrpc(this.parent.url, "thank_post", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	reply_post: function(forum_id, topic_id, text_subject, text_body, attachment_id_array, group_id, callback, callbackError){

			if (!text_subject) {
				text_subject = "";
			}
			if (!attachment_id_array) {
				attachment_id_array = [];
			}
			Mojo.Log.info("Tapatalk.Post.reply_post, body: [" + text_body + "]");
			var subject = new Base64Holder(Base64.encode(text_subject));
			var body = new Base64Holder(Base64.encode(text_body));

			var callbackOk = function(response){
				try {
					this.parent.lastActionTime(new Date());
					//,null,2
					logJSON("Tapatalk.reply_post.ok, response:\n" + JSON.stringify(response,null,2));
					callback(response);

				}
				catch (e) {
					Mojo.Log.error("TAPATALK API ERROR: reply_post.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
					//showErrorDialog("Login Error", err );
					Mojo.Log.error("TAPATALK API ERROR: reply_post.fail - ", Object.toJSON(err));
					callbackError(err);
				}
				catch (e) {
					Mojo.Log.error(e);
				}

			};
			var callbackDone = function(){
				Mojo.Log.info("reply_post.done");
			};

			callbackOk = callbackOk.bind(this);
			callbackFail = callbackFail.bind(this);
			callbackDone = callbackDone.bind(this);

			if (attachment_id_array.length == 0) {
				var args = [forum_id, topic_id, subject, body];
			}
			else {
				var args = [forum_id, topic_id, subject, body, attachment_id_array, group_id];
			}

			//Mojo.Log.info(this.parent.url);
			xmlrpc(this.parent.url, "reply_post", args, {
				done: callbackOk,
				error: callbackFail,
				close: callbackDone
			});
	},
	get_quote_post: function(post_id, callback){

		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_quote_post.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_quote_post.fail - ", Object.toJSON(err));
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				if (err.startsWith("Please login") || err.startsWith("security error")) {
					Mojo.Log.info("PLEASE REAUTHENTICATE!!!!!!");
					callback({error: "reauthenticate"});
				}
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

		var args = [post_id];

		//Mojo.Log.info(this.parent.url);
		xmlrpc(this.parent.url, "get_quote_post", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	get_raw_post: function(post_id, callback){

			var callbackOk = function(response){
				try {

					this.parent.lastActionTime(new Date());
					callback(response);

				}
				catch (e) {
					Mojo.Log.error("TAPATALK API ERROR: get_raw_post.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_raw_post.fail - ", err);
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				if (err.startsWith("Please login") || err.startsWith("security error")) {
					Mojo.Log.info("PLEASE REAUTHENTICATE!!!!!!");
					callback({error: "reauthenticate"});
				}
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

			var args = [post_id];

			//Mojo.Log.info(this.parent.url);
			xmlrpc(this.parent.url, "get_raw_post", args, {
				done: callbackOk,
				error: callbackFail,
				close: callbackDone
			});
	},
	save_raw_post: function(post_id, text_subject, text_body, callback, callbackError){

			var subject = new Base64Holder(Base64.encode(text_subject));
			var body = new Base64Holder(Base64.encode(text_body));
			Mojo.Log.info("Tapatalk.Post.save_raw_post, body: [" + text_body + "]");
			var callbackOk = function(response){
				try {

					this.parent.lastActionTime(new Date());
					callback(response);

				}
				catch (e) {
					Mojo.Log.error("TAPATALK API ERROR: reply_post.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
					//showErrorDialog("Login Error", err );
					Mojo.Log.error("TAPATALK API ERROR: reply_post.fail - ", err);
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

			var args = [post_id, subject, body];

			//Mojo.Log.info(this.parent.url);
			xmlrpc(this.parent.url, "save_raw_post", args, {
				done: callbackOk,
				error: callbackFail,
				close: callbackDone
			});
	},
	get_thread: function(topic_id, start_num, last_num, callback){
		var retried = false;
		Mojo.Log.info("Tapatalk.Post.get_thread");
		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());
				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_thread.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_thread.fail - ", Mojo.Log.info(Object.toJSON(err)));
				if (err.error == 0) {
					if (!retried) {
						retried = true;
						Mojo.Controller.getAppController().showBanner($L("Please wait..."), "", "");
						xmlrpc(this.parent.url, "get_thread", args, {
							done: callbackOk,
							error: callbackFail,
							close: callbackDone
						});

					}
					else {
						var errorMessage = $L("A conectivity error has ocurred. Please retry.");
						this.controller = Mojo.Controller.stageController.activeScene();
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
					}
				}
				else {
					if (err.faultCode == 3) {
						//WRONG PARAMETERS, PASS CLASSIC API
						this.parent.config.disable_html = true;
						var args = [topic_id, start_num, last_num];
						xmlrpc(this.parent.url, "get_thread", args, {
							done: callbackOk,
							error: callbackFail,
							close: callbackDone
						});

					}
					else {

					}
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				}

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

		//Mojo.Log.info("disable_html: ", this.parent.config.disable_html);
		if (!this.parent.config.disable_html) {
			//Mojo.Log.info("WITH HTML");
			var args = [topic_id, start_num, last_num, true];
		}
		else {
			//Mojo.Log.info("NO HTML");
			var args = [topic_id, start_num, last_num];
		}

		//Mojo.Log.info(this.parent.url);
		Mojo.Log.info("get_thread args: " + JSON.stringify(args));
		appSettings.Tapatalk.threadListRequest = new xmlrpc(this.parent.url, "get_thread", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	get_thread_by_post: function(post_id, posts_per_request, return_html, callback){

		var retried = false;
		Mojo.Log.info("Tapatalk.Post.get_thread_by_post");
		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());
				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_thread_by_post.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_thread_by_post.fail - ", Mojo.Log.info(Object.toJSON(err)));
				if (err.error == 0) {
					if (!retried) {
						retried = true;
						Mojo.Controller.getAppController().showBanner($L("Please wait..."), "", "");
						xmlrpc(this.parent.url, "get_thread_by_post", args, {
							done: callbackOk,
							error: callbackFail,
							close: callbackDone
						});

					}
					else {
						var errorMessage = $L("A conectivity error has ocurred. Please retry.");
						this.controller = Mojo.Controller.stageController.activeScene();
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
					}
				}
								else {
					if (err.faultCode == 3) {
						//WRONG PARAMETERS, PASS CLASSIC API
						this.parent.config.disable_html = true;
						var args = [post_id_str, 20];
						xmlrpc(this.parent.url, "get_thread_by_post", args, {
							done: callbackOk,
							error: callbackFail,
							close: callbackDone
						});

					}
					else {

					}
				}


			}
			catch (e) {
				Mojo.Log.error("get_thread_by_post ERROR: ", e);
			}

		};
		var callbackDone = function(){

		};

		callbackOk = callbackOk.bind(this);
		callbackFail = callbackFail.bind(this);
		callbackDone = callbackDone.bind(this);

		//Mojo.Log.info("disable_html: ", this.parent.config.disable_html);
		var post_id_str = post_id.toString()
		if (!this.parent.config.disable_html) {
			//Mojo.Log.info("WITH HTML: ", post_id_str);
			var args = [post_id_str, 20];
		}
		else {
			//Mojo.Log.info("NO HTML: ", post_id.toString());
			var args = [post_id_str, 20, true];
		}

		//Mojo.Log.info(this.parent.url);
		appSettings.Tapatalk.threadListRequest = new xmlrpc(this.parent.url, "get_thread_by_post", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	get_thread_by_unread: function(topic_id, posts_per_request, return_html, callback){

		var retried = false;
		Mojo.Log.info("Tapatalk.Post.get_thread_by_unread");

		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());
				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_thread_by_unread.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_thread_by_unread.fail - ", Object.toJSON(err));
				if (err.error == 0) {
					if (!retried) {
						retried = true;
						Mojo.Controller.getAppController().showBanner($L("Please wait..."), "", "");
						xmlrpc(this.parent.url, "get_thread_by_unread", args, {
							done: callbackOk,
							error: callbackFail,
							close: callbackDone
						});

					}
					else {
						var errorMessage = $L("A conectivity error has ocurred. Please retry.");
						this.controller = Mojo.Controller.stageController.activeScene();
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
					}
				}
				else {
					if (err.faultCode == 3) {
						//WRONG PARAMETERS, PASS CLASSIC API
						this.parent.config.disable_html = true;
						var args = [topic_id_str, posts_per_request];
						xmlrpc(this.parent.url, "get_thread_by_unread", args, {
							done: callbackOk,
							error: callbackFail,
							close: callbackDone
						});

					}
					else {

					}
				}


			}
			catch (e) {
				Mojo.Log.error("get_thread_by_unread ERROR: ", e);
			}

		};
		var callbackDone = function(){

		};

		callbackOk = callbackOk.bind(this);
		callbackFail = callbackFail.bind(this);
		callbackDone = callbackDone.bind(this);

		//Mojo.Log.info("disable_html: ", this.parent.config.disable_html);
		var topic_id_str = topic_id.toString();
		if (!this.parent.config.disable_html) {
			//Mojo.Log.info("WITH HTML: ", topic_id_str);
			var args = [topic_id_str, posts_per_request, true];
		}
		else {
			//Mojo.Log.info("NO HTML: ", topic_id_str.toString());
			var args = [topic_id_str, posts_per_request];
		}

		//Mojo.Log.info(this.parent.url);
		appSettings.Tapatalk.threadListRequest = new xmlrpc(this.parent.url, "get_thread_by_unread", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	}


});

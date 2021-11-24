var PrivateMessage = Class.create(
{
	initialize: function(parent) {
		this.parent = parent;
		Mojo.Log.info("PM Initialize");

	},
	create_message: function(user_names, subject, text_body, action, pm_id, callback, callbackError) {

		try {
			var recipients = user_names.split(";");
			var recipientsArray = [];
			var i
			for (i = 0; i < recipients.length; i++) {
				var recipient = trim(recipients[i]);
				Mojo.Log.info(recipient);
				var encodedRecipient = new Base64Holder(Base64.encode(recipient));
				recipientsArray.push(encodedRecipient);
			}

			var encodedSubject = new Base64Holder(Base64.encode(subject));
			var encodedBody = new Base64Holder(Base64.encode(text_body));

			var callbackOk = function(response){
				try {
					this.parent.lastActionTime(new Date());

					callback(response);

				}
				catch (e) {
					Mojo.Log.error("TAPATALK API ERROR: create_message.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
					//showErrorDialog("Login Error", err );
					Mojo.Log.error("TAPATALK API ERROR: create_message.fail - ", err);
					//Mojo.Controller.getAppController().showBanner(err, "", "");
					this.parent.errorHandler(err, function(response){
						callbackError(response);
					});
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
			if (action != 0) {
				xmlrpc(this.parent.url, "create_message", [recipientsArray, encodedSubject, encodedBody, action, pm_id], {
					done: callbackOk,
					error: callbackFail,
					close: callbackDone
				});
			} else {
				Mojo.Log.info("ENVIANDO NUEVO MENSAJE");
				xmlrpc(this.parent.url, "create_message", [recipientsArray, encodedSubject, encodedBody], {
					done: callbackOk,
					error: callbackFail,
					close: callbackDone
				});
			}
		} catch (e) {
			Mojo.Log.error("create_message ERROR:", e);
		}

	},
	get_inbox_stat: function(callback) {
		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_inbox_stat.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_inbox_stat.fail - ", Object.toJSON(err));
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				this.parent.errorHandler(err, function(response){
					callback(response);
				});
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
		appSettings.Tapatalk.inboxStatusRequest = new xmlrpc(this.parent.url, "get_inbox_stat", [], {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});

	},
	get_box_info: function(callback) {
		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_box_info.ok - ", e);
				Mojo.Log.error("Stack: " + e.stack);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_box_info.fail - ", JSON.stringify(err));
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				this.parent.errorHandler(err, function(response){
					callback(response);
				});
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
		xmlrpc(this.parent.url, "get_box_info", [], {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	get_box: function(box_id, start_num, end_num, callback) {
		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_box.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_box.fail - ", JSON.stringify(err));
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				this.parent.errorHandler(err, function(response){
					callback(response);
				});
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
		xmlrpc(this.parent.url, "get_box", [box_id.toString(), start_num, end_num], {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	get_message: function(message_id, box_id, callback) {
		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_message.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_message.fail - ", err);
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				this.parent.errorHandler(err, function(response){
					callback(response);
				});
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
		xmlrpc(this.parent.url, "get_message", [message_id.toString()], {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	get_quote_pm: function(message_id, callback) {
		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_quote_pm.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_quote_pm.fail - ", err);
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				this.parent.errorHandler(err, function(response){
					callback(response);
				});
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
		xmlrpc(this.parent.url, "get_message", [message_id.toString()], {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},

	delete_message: function(message_id, box_id, callback) {
		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: delete_message.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: delete_message.fail - ", err);
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				this.parent.errorHandler(err, function(response){
					callback(response);
				});
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
		xmlrpc(this.parent.url, "delete_message", [message_id.toString()], {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},

	//Create a new Conversations file and move these there.
	//start_num, end_num, 
	get_conversations: function(callback) {
		var callbackOk = function(response){
			try {
					this.parent.lastActionTime(new Date());

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_conversations.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_conversations.fail - ", JSON.stringify(err));
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				this.parent.errorHandler(err, function(response){
					callback(response);
				});
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


		//, [start_num, end_num], {
		xmlrpc(this.parent.url, "get_conversations", [], {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
});
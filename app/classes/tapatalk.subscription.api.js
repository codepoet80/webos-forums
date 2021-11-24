var Subscription = Class.create(
{
	initialize: function(parent){
		this.parent = parent;
		Mojo.Log.info("Subscription Initialize");

	},
	get_subscribed_forum: function(callback){
		Mojo.Log.info("Tapatalk.Subscription.get_subscribed_forum()");
		var callbackOk = function(response){
			try {
				this.parent.lastActionTime(new Date());

				//this.parent.config = response;

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_subscribed_forum.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				//Mojo.Log.error("TAPATALK API ERROR: get_subscribed_forum.fail - ", Object.toJSON(err));
				//Mojo.Controller.getAppController().showBanner(err, "", "");

				/*if (err.startsWith("Please login") || err.startsWith("security error")) {
				 Mojo.Log.info("PLEASE REAUTHENTICATE!!!!!!");
				 callback({error: "reauthenticate"});
				 }*/
/*
				this.parent.errorHandler(err, function(response){
					callback(response);
				});

*/
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

		xmlrpc(this.parent.url, "get_subscribed_forum", {}, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	subscribe_forum: function(forum_id, callback){
		var callbackOk = function(response){
			try {

				this.parent.lastActionTime(new Date());
				//this.parent.config = response;

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: subscribe_forum.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: subscribe_forum.fail - ", err);
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

		xmlrpc(this.parent.url, "subscribe_forum", [forum_id], {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	unsubscribe_forum: function(forum_id, callback){

		var callbackOk = function(response){
			try {
				this.parent.lastActionTime(new Date());

				//this.parent.config = response;

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: unsubscribe_forum.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: unsubscribe_forum.fail - ", err);
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

		xmlrpc(this.parent.url, "unsubscribe_forum", [forum_id], {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	get_subscribed_topic: function(start_num, last_num, callback){
		Mojo.Log.info("Tapatalk.Subscription.get_subscribed_topic()");
		var callbackOk = function(response){
			try {
				Mojo.Log.info("Tapatalk.Subscription.get_subscribed_topic.callbackOK");
				this.parent.lastActionTime(new Date());

				//this.parent.config = response;

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_subscribed_topic.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_subscribed_topic.fail - ", Object.toJSON(err));
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

		var args = [start_num, last_num];
		
		//Mojo.Log.info(this.parent.url);
		xmlrpc(this.parent.url, "get_subscribed_topic", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	subscribe_topic: function(topic_id, callback){
		var callbackOk = function(response){
			try {

				this.parent.lastActionTime(new Date());
				//this.parent.config = response;

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: subscribe_topic.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: subscribe_topic.fail - ", err);
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

		xmlrpc(this.parent.url, "subscribe_topic", [topic_id], {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	unsubscribe_topic: function(topic_id, callback){
		var callbackOk = function(response){
			try {
				this.parent.lastActionTime(new Date());

				//this.parent.config = response;

				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: unsubscribe_topic.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: unsubscribe_topic.fail - ", err);
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

		xmlrpc(this.parent.url, "unsubscribe_topic", [topic_id], {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	}
});
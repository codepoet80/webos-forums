//COMPLETA Y FUNCIONANDO

var Topic = Class.create(
{
	initialize: function(parent){
		this.parent = parent;
		Mojo.Log.info("Topics Initialize");
		
	},
	new_topic: function(forum_id, subject, text_body, prefix_id, attachment_id_array, group_id, callback, callbackError){
		var callbackOk = function(response){
			try {
				this.parent.lastActionTime(new Date());
				
				callback(response);
				
			} 
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: new_topic.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: new_topic.fail - ", Object.toJSON(err));
				err.forum_id = forum_id;
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
		
		Mojo.Log.info(subject, " - ", text_body);
		var postSubject = new Base64Holder(Base64.encode(subject));
		var postContent = new Base64Holder(Base64.encode(text_body));
		
		if (attachment_id_array.length == 0) {
			var args = [forum_id, postSubject, postContent, prefix_id];
		}
		else {
			var args = [forum_id, postSubject, postContent, prefix_id, attachment_id_array, group_id];
		}
		
		//Mojo.Log.info(this.parent.url);
		xmlrpc(this.parent.url, "new_topic", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	get_topic: function(forum_id, start_num, last_num, mode, callback){
		var callbackOk = function(response){
			try {
				this.parent.lastActionTime(new Date());
				
				callback(response);
				
			} 
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_topic.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_thread.fail - ", Mojo.Log.info(Object.toJSON(err)));
				if (err.error == 0) {
						//Mojo.Controller.getAppController().showBanner($L("Please wait..."), "", "");
						xmlrpc(this.parent.url, "get_topic", args, {
							done: callbackOk,
							error: callbackFail,
							close: callbackDone
						});
						
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
		
		var args = [forum_id, start_num, last_num, mode];
		
		//Mojo.Log.info(this.parent.url);
		appSettings.Tapatalk.topicListRequest = new xmlrpc(this.parent.url, "get_topic", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	get_new_topic: function(start_num, last_num, callback){
		var callbackOk = function(response){
			try {
				this.parent.lastActionTime(new Date());
				
				callback(response);
				
			} 
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_new_topic.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_new_topic.fail - ", Object.toJSON(err));
				//Mojo.Controller.getAppController().showBanner(err, "", "");
				this.parent.errorHandler(err, function(response){
					Mojo.Log.info(Object.toJSON(response));
					if (response.error == "reauthenticate") {
						Mojo.Controller.errorDialog($L("You must be logged in to access this feature."));
					}
					callback({
						total_topic_num: 0,
						topics: []
					});
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
		
		Mojo.Log.info(this.parent.url);
		//xmlrpc(this.parent.url, "get_new_topic", args, { //old name, replaced by get_latest_topic
		xmlrpc(this.parent.url, "get_latest_topic", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	get_unread_topic: function(start_num, last_num, callback){
		var callbackOk = function(response){
			try {
				this.parent.lastActionTime(new Date());
				
				callback(response);
				
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
		
		var args = [start_num, last_num];
		
		//Mojo.Log.info(this.parent.url);
		xmlrpc(this.parent.url, "get_unread_topic", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},
	get_participated_topic: function(start_num, last_num, callback){
		var callbackOk = function(response){
			try {
				this.parent.lastActionTime(new Date());
				
				callback(response);
				
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
		
		
		var args = [this.parent.username64, start_num, last_num];
		
		//Mojo.Log.info(this.parent.url);
		xmlrpc(this.parent.url, "get_participated_topic", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	}
});

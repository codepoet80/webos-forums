var Search = Class.create(
{
	initialize: function(parent) {
		this.parent = parent;
		Mojo.Log.info("Search Initialize");

	},
	search_topic: function(search_string, start_num, last_num, search_id, callback){
		
						
			var search_text = new Base64Holder(Base64.encode(search_string));
			
			var callbackOk = function(response){
				try {
					this.parent.lastActionTime(new Date());
				
					callback(response);
					
				} 
				catch (e) {
					Mojo.Log.error("TAPATALK API ERROR: search_topic.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
					//showErrorDialog("Login Error", err );
					Mojo.Log.error("TAPATALK API ERROR: search_topic.fail - ", Object.toJSON(err));
					//Mojo.Controller.getAppController().showBanner(err, "", "");
					this.parent.errorHandler(err, function(response) {
						Mojo.Log.info(Object.toJSON(response));
						if (response.error == "reauthenticate") {
							Mojo.Controller.errorDialog($L("You must be logged in to access this feature."));
						}
						callback({total_topic_num: 0, topics:[]}); 
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
			
			if (search_id == "") {
				var args = [search_text, start_num, last_num];
			} else {
				var args = [search_text, start_num, last_num, search_id];
			}
			
			//Mojo.Log.info(this.parent.url);
			xmlrpc(this.parent.url, "search_topic", args, {
				done: callbackOk,
				error: callbackFail,
				close: callbackDone
			});
	},
	search_post: function(search_string, start_num, last_num, search_id, callback){
		
						
			var search_text = new Base64Holder(Base64.encode(search_string));
			
			var callbackOk = function(response){
				try {
					this.parent.lastActionTime(new Date());
					//Mojo.Log.info(Object.toJSON(response));
					callback(response);
					
				} 
				catch (e) {
					Mojo.Log.error("TAPATALK API ERROR: search_post.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
					//showErrorDialog("Login Error", err );
					Mojo.Log.error("TAPATALK API ERROR: search_post.fail - ", Object.toJSON(err));
					this.parent.errorHandler(err, function(response) {
						Mojo.Log.info(Object.toJSON(response));
						if (response.error == "reauthenticate") {
							Mojo.Controller.errorDialog($L("You must be logged in to access this feature."));
						}
						callback({total_topic_num: 0, topics:[]}); 
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
			
			Mojo.Log.info("SEARCH ID: ", search_id);
			if (!search_id) {
				Mojo.Log.info("Sin search id");
				var args = [search_text, start_num, last_num];
			} else {
				var args = [search_text, start_num, last_num, search_id];	
			}
			
			//Mojo.Log.info(this.parent.url);
			xmlrpc(this.parent.url, "search_post", args, {
				done: callbackOk,
				error: callbackFail,
				close: callbackDone
			});
	}

});
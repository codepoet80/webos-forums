var Others = Class.create(
{
	initialize: function(parent) {

		this.parent = parent;
		Mojo.Log.info("User Initialize");

		
	},
	get_thread_by_unread: function(post_id, posts_per_request, callback) {
		try {
			var callbackOk = function(response){
				try {
					//				if (!response.cookie.startsWith("bblastactivity")) {
					
					callback(response);
					
				//				} else {
				//					this.logout_user(this.login(callback));
				//				}
				
				} 
				catch (e) {
					Mojo.Log.error("TAPATALK API ERROR: get_thread_by_unread.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
					Mojo.Log.error("TAPATALK API ERROR: get_thread_by_unread.fail - ", err);
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
			
			if (posts_per_request) {
				var args = [topic_id.toString(), posts_per_request];
			} else {
				var args = [topic_id.toString()];
			}
			if (this.parent.config.goto_unread == "1") {
				var apiName = "get_thread_by_unread";
			}
			else {
				var apiName = "get_thread";
			}
			xmlrpc(this.parent.url, apiName, args, {
				done: callbackOk,
				error: callbackFail,
				close: callbackDone
			});
		} catch (e) {
			Mojo.Log.error("tapatalk LOGIN ERROR: ", e);
		}
	},
	get_thread_by_post: function(topic_id, post_id, posts_per_request, callback) {
		try {
			var callbackOk = function(response){
				try {
					//				if (!response.cookie.startsWith("bblastactivity")) {
					
					callback(response);
					
				//				} else {
				//					this.logout_user(this.login(callback));
				//				}
				
				} 
				catch (e) {
					Mojo.Log.error("TAPATALK API ERROR: get_thread_by_p.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
					Mojo.Log.error("TAPATALK API ERROR: get_thread_by_unread.fail - ", err);
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
			
			if (this.parent.config.goto_post == "1") {
				var apiName = "get_thread_by_post";
				if (posts_per_request) {
					var args = [post_id.toString(), posts_per_request];
				}
				else {
					var args = [post_id.toString()];
				}
			}
			else {
				var apiName = "get_thread";
				var args = [topic_id.toString(), 0, 20]
			}
				xmlrpc(this.parent.url, apiName, args, {
				done: callbackOk,
				error: callbackFail,
				close: callbackDone
			});
		} catch (e) {
			Mojo.Log.error("tapatalk LOGIN ERROR: ", e);
		}
	},
});
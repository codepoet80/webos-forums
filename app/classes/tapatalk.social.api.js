var Social = Class.create(
{
	initialize: function(parent){

		this.parent = parent;
		Mojo.Log.info("Social Initialize");


	},
	get_alert: function(user_name, callback){

		Mojo.Log.info("get_alert: " + user_name);
		var callbackOk = function(response){
			try {

				this.parent.lastActionTime(new Date());
				callback(response);

			}
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: get_alert.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				Mojo.Log.error("TAPATALK API ERROR: get_alert.fail - ", err);
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

		//var userName = new Base64Holder(Base64.encode(user_name));
		var pageNum = 1;
		var args = [ pageNum ];

		//Mojo.Log.info(this.parent.url);
		xmlrpc(this.parent.url, "get_alert", args, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
	},


});

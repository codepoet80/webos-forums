var checkUrl = function(url, callback){
		this.url = url;
		var callbackOk = function(response){
			try {
				//Mojo.Log.info(Object.toJSON(response));
				this.config = response;
				callback(response);
				
			} 
			catch (e) {
				Mojo.Log.error("TAPATALK API ERROR: checkUrl.ok - ", e);
			}
		};
		var callbackFail = function(err){
			try {
				//showErrorDialog("Login Error", err );
				callback(false);
				Mojo.Log.error("TAPATALK API ERROR: checkUrl.fail - ", err);
			//Mojo.Controller.getAppController().showBanner($L("Error requesting forum data"), "", "");
			} 
			catch (e) {
				Mojo.Log.error(e);
			}
			
		};
		var callbackDone = function(){
			//Mojo.Log.info("TAPATALK API: checkUrl.done");
		};
		
		callbackOk = callbackOk.bind(this);
		callbackFail = callbackFail.bind(this);
		callbackDone = callbackDone.bind(this);
		
		Mojo.Log.info(url);
		xmlrpc(url, "get_config", {}, {
			done: callbackOk,
			error: callbackFail,
			close: callbackDone
		});
		
	};
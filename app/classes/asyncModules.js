var classAsyncModules = Class.create({
	isBeta: false,
	checkSync: function() {
		var notABeta = false;
		var oc = new Date(1292367600000);
		
		this.controller=Mojo.Controller.stageController.activeScene();
		var today = new Date();
		var expirationDate = new Date("2010/12/15");
		var appIdString = Mojo.Controller.appInfo.id;
		var startPoint = appIdString.length;
		startPoint = startPoint - 4;
		var isBeta = appIdString.substr(startPoint,4);

		if ((!notABeta && isBeta == "beta") || !notABeta || isBeta == "beta") {
			Mojo.Log.info ("ES UNA BETA");
			if (today >= oc) {
				this.isBeta = true;
				this.controller.showAlertDialog({
					onChoose: function(value){
						if (value == 'OK') 
							window.close();
						if (value == 'BUY') {
							appSettings.Beta.redirectToAppCatalog();
						}
					},
					title: $L("This Beta Has Expired"),
					message: $L("This version has expired. Thank you for helping us to improve Forums. You can purchase forums in the App Catalog."),
					preventCancel: true,
					choices: [{
						label: $L("Go to App Catalog"),
						value: 'BUY',
						type: 'affirmative'
					},{
						label: $L('OK'),
						value: 'OK',
						type: 'standard'
					}]
				});
			}
			else {
				Mojo.Log.info("beta has not expired");
				return;
			}
		} else {
			window.close();
		}
	},
	redirectToAppCatalog: function(){
		var fullAppId = "com.newnessdevelopments.forums"; 
		this.controller=Mojo.Controller.stageController.activeScene();
		var fullAppUrl = "http://developer.palm.com/appredirect/?packageid=" + fullAppId;
		this.controller.serviceRequest("palm://com.palm.applicationManager", {
			method: "open",
			parameters: {
				target: fullAppUrl
			},
			onSuccess: function(result) {
				window.close();
			},
			onError: function(error) {
				window.close();
			}
		});
	}

});
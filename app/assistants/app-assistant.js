
function AppAssistant(appController) {
	this.appController = appController;

};
   
AppAssistant.prototype.initialize = function () {

};
   
   
AppAssistant.prototype.handleLaunch = function (params) {

//	var cardStageController = this.controller.getStageController("main");
	//var appController = Mojo.Controller.getAppController();

		//No method flag
		var launchParams = {method: false};
		var newAssistantName = "forums-" + Date.now();
		
		var pushForumCard = function(stageController){
			//stageController.appSettings.currentForum = launchParams.forum
			if (launchParams.forum_id) {
				var arguments = {
					stageName: newAssistantName,
					forum_id: launchParams.forum_id
				};
				
			} else if(launchParams.forum) {
				var arguments = {
					stageName: newAssistantName,
					forum: launchParams.forum
				};
				
			}
			
			if (launchParams.parameters) {
				arguments.parameters = launchParams.parameters;
			}
			
			stageController.swapScene('main', arguments, Mojo.Controller.StageType.card);
		}; 
		
		var pushSubCard = function(stageController){
			try {

				var arguments = {
					stageName: newAssistantName, 
					parentStageName: launchParams.parentStage,
					forum: launchParams.forum,
					parameters: launchParams.parameters
				};
				stageController.swapScene({
						name: "topic",
						disableSceneScroller: true
					}, arguments, Mojo.Controller.StageType.card);

			} 
			catch (e) {
				Mojo.Log.error("pushSubCard ERROR: ", e);
			}
		};
		
		


		if (Object.isString(params)) {
			//Mojo.Log.info("PARAMETROS SON STRING");
			if (params.isJSON()) {
//				Mojo.Log.info("PARAMETROS SON JSON");
				launchParams = params.evalJSON();
    			//Mojo.Log.info("PARAMETROS FINALES: ", Object.toJSON(launchParams));
			} else {
//				Mojo.Log.info("PARAMETROS NO SON JSON");
				
			}
		}
		else {
			//Mojo.Log.info("WHAT'S UPPPPPP", Object.toJSON(launchParams));
			launchParams = params;
		}

	
	//Mojo.Log.info("FORO RECIBIDO: ", Object.toJSON(launchParams.forum));
      //if (!cardStageController) {
	  	//this.launched = true;
		switch(launchParams.method) {
			case "openForum":
				this.appController.createStageWithCallback({
							name: newAssistantName,
							assistantName: "StageAssistant"
						}, pushForumCard);
						break;
			case "_openTopic":
				//Mojo.Log.error("_openTopic");
				newAssistantName =  launchParams.newStageName;
				this.appController.createStageWithCallback({
										name: newAssistantName,
										assistantName: "StageAssistant"
									}, pushSubCard);
									break;
			case "_updateSessionStatus":
				Mojo.Log.error("_updateSessionStatus");
				var controller = Mojo.Controller.getAppController().getStageController(launchParams.stageName);
				controller.assistant.updateSessionStatus(launchParams.parameters);
				/* ESTO FUNCIONA, NO LO DEJES DE LADO.
				controller.sendEventToCommanders({
					type: "custom",
					command: "updateConnectionData",
					parameters: launchParams.parameters
				});
				*/
				break;
			case "_closeStage":
				Mojo.Log.error("_closeStage");
				var controller = Mojo.Controller.getAppController().getStageController(launchParams.stageName);
				//controller.window.close();
				controller.assistant.forceStageClosing();
				/* ESTO FUNCIONA, NO LO DEJES DE LADO.
				controller.sendEventToCommanders({
					type: "custom",
					command: "updateConnectionData",
					parameters: launchParams.parameters
				});
				*/
				break;
			case "_messagesCalledFromChild":
				Mojo.Log.error("_messagesCalledFromChild");
				var controller = Mojo.Controller.getAppController().getStageController(launchParams.stageName);
				controller.assistant.openMessagesFromChild(launchParams.stageName, launchParams.parameters);
				break;
			case "openPrivateMessages":
			case "exists":
			//Mojo.Log.info("LAUNCHED FROM EXISTS");
				return true;
				break;
			default:
						//Mojo.Log.info("Sin parametros");
						this.appController.createStageWithCallback({
							name: newAssistantName,
							assistantName: "StageAssistant"
						}, function(stageController){
							stageController.swapScene('main', {
								stageName: newAssistantName
							});
						});
			
		};
/*
			if (launchParams.method == false) {
						Mojo.Log.info("Sin parametros");
						this.appController.createStageWithCallback({
							name: newAssistantName,
							assistantName: "StageAssistant"
						}, function(stageController){
							stageController.swapScene('main', {
								stageName: newAssistantName
							});
						});
				}
				else {
					Mojo.Log.info("Con parametros: ", launchParams.method);
					if (launchParams.method == "openForum") {
						this.appController.createStageWithCallback({
							name: newAssistantName,
							assistantName: "StageAssistant"
						}, pushForumCard);
						
					} else 
							if (launchParams.method == "addForum") {
								var forumData = {
									forum_id: Date.now().toString(),
									forum_url: launchParams.forum.forum_url, //"http://forums.precentral.net/mobiquo/mobiquo.php",
									logo_url: launchParams.forum.logo_url, //Mojo.appPath + "images/bundledforums/precentral.png",
									site_url: launchParams.forum.site_url, //"http://forums.precentral.net/",
									forum_name: launchParams.forum.forum_name, //"PreCentral.net Forums",
									forum_description: launchParams.forum.forum_description, //"The #1 Palm Pre Community",
									user_name: "",
									user_password: ""
								}
							}
							else 
								if (launchParams.method == "_openTopic") {
									newAssistantName =  launchParams.newStageName;
									this.appController.createStageWithCallback({
										name: newAssistantName,
										assistantName: "StageAssistant"
									}, pushSubCard);
								}
								else {
								//IGNORE PARAMETERS, AND LAUNCH DEFAULT CARD
								}
				}
				
			//}

*/     
};

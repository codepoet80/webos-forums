function NewPostAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  this.child = false;


			this.recipientsModel = {
				value: '',
				disabled: false
			};
/*
 * 			this.contentModel = {
				value: '',
				disabled: false
			};

*/
	  if (args) {
	  	if (args.topicMode) {
			this.topicMode = true;
			if (args.newTopic) {
				this.newTopic = true;
				this.forum_id = args.forum_id;
				this.post = {};
				this.post.forum_id = args.forum_id;
				this.post.subject = "";
				this.post.text_body = "";
				this.post.attachment_id_array = [];
				this.post.group_id = "";
			}
			else {
				this.editMode = args.editMode;
				this.topic = args.currentTopic;
				this.post = {};
				this.post.subject = "";
				this.post.text_body = "";
				this.post.forum_id = args.currentTopic.forum_id;
				this.post.topic_id = args.currentTopic.topic_id;
				if (args.quote_id) {
					//Mojo.Log.info("It's a quote");
					this.post.quote_id = args.quote_id;
				}
				else
					if (this.editMode) {
						//Mojo.Log.info("It's an edition");

						this.post.post_id = args.post_id;
					} else {
						this.post.attachment_id_array = [];
						this.post.group_id = "";
					}
					
			}
		}
		else {
			this.topicMode = false;
			if (args.messageId) {
				this.messageItem = args.originalMessage;
				this.messageItem.id = args.messageId;
			} else {
				this.messageItem = {};
				this.messageItem.id = 0;
			}
			if (args.replyMode) {
				this.replyMode = args.replyMode;
				} else {
					this.replyMode = false;
				}
			if (args.recipients) {
				this.messageItem.recipients = args.recipients;
				this.child = true;
			}
		}
	  }
}

NewPostAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */

	/* setup widgets here */

	/* add event handlers to listen to events from widgets */
	this.controller.get("textFieldSender").innerHTML = appSettings.Tapatalk.username;

	this.setupWaitingFeedback();
	//this.setWaitingFeedback(false);

	this.controller.get("scrim-minimized").hide();
	//this.controller.get("forum-image").src = appSettings.currentForum.logo;
	//this.controller.get("forum-name").innerHTML = appSettings.currentForum.name;
	this.controller.get("forum-image-small").src = appSettings.currentForum.logo;

	//Added by Jon W 6/7/2021
	this.appMenuModel = {
		visible: true,
		items: [
			MenuData.ApplicationMenu.GoBack,
			]
	};
	this.controller.setupWidget(Mojo.Menu.appMenu, {
		omitDefaultItems: false
	}, this.appMenuModel);

	//list name textfield
	if (this.topicMode) {
		this.controller.get("emailView").hide();
		if (this.newTopic) {
			this.controller.get("scene-message").innerHTML = $L("New Thread");
			this.controller.get("topic-title").addClassName("hidden");
			this.topicAttr = {
				hintText: $L('Topic Title...'),
				multiline: false,
				requiresEnterKey: false,
				changeOnKeyPress: false,
				autoFocus: false
			};
			this.contentAttr = {
				hintText: $L('Topic Body...'),
				multiline: true,
				requiresEnterKey: false,
				changeOnKeyPress: false,
				autoFocus: true
			};

		}
		else {
			this.controller.get("scene-message").innerHTML = $L("Post Reply");
			this.controller.get("topic-title").innerHTML = this.topic.posts[0].post_title;
			this.topicAttr = {
				hintText: $L('Reply Title...'),
				multiline: false,
				requiresEnterKey: false,
				changeOnKeyPress: false,
				autoFocus: false
			};
			this.contentAttr = {
				hintText: $L('Reply Body...'),
				multiline: true,
				requiresEnterKey: false,
				changeOnKeyPress: false,
				autoFocus: true
			};

		}
		this.subjectModel = {
			value: this.post.subject,
			disabled: false
		};
		this.contentModel = {
			value: this.post.text_body,
			disabled: false
		};

	}
	else {
		this.controller.get("postView").hide();
		//this.controller.get("scene-message").innerHTML = $L("New Message");
		//this.controller.get("topic-title").addClassName("hidden");
		this.topicAttr = {
			hintText: $L('Message Subject...'),
			multiline: false,
			requiresEnterKey: false,
			changeOnKeyPress: false,
			autoFocus: false
		};
		this.contentAttr = {
			//hintText: $L('Message Body...'),
			multiline: true,
			requiresEnterKey: false,
			changeOnKeyPress: false,
			autoFocus: false
		};

		this.recipientsAttr = {
			//hintText: $L('Recipients...'),
			multiline: true,
			requiresEnterKey: false,
			changeOnKeyPress: true,
			autoFocus: true
		};

		if (this.messageItem && this.messageItem.id !=0) {
			this.subjectModel = {
				value: $L('RE: ') + this.messageItem.msg_subject,
				disabled: false
			};
		}
		else {
			this.subjectModel = {
				value: "",
				disabled: false
			};
		}

		this.contentModel = {
			value: "",
			disabled: false
		};

		if (this.messageItem && this.replyMode) {
			if (this.messageItem.msg_from_display_name) {
				var recipients = this.messageItem.msg_from_display_name;
			} else {
				var recipients = this.messageItem.msg_from;
			}
			this.recipientsAttr.autoFocus = false;
			this.contentAttr.autoFocus = true;
		} else {
			if (this.messageItem.recipients) {
				var recipients = this.messageItem.recipients;
			}
			else {
				var recipients = "";
			}
		}

		this.recipientsModel = {
			value: recipients,
			disabled: false
		};

	}

	//this.controller.setupWidget('textFieldTopic', this.topicAttr, this.subjectModel);

	this.controller.setupWidget('textFieldContent', this.contentAttr, this.contentModel);

	this.controller.setupWidget('emailSubject', this.topicAttr, this.subjectModel);

	this.controller.setupWidget('textFieldRecipient', this.recipientsAttr, this.recipientsModel);

	this.cmdMenuModel = {
		visible: true,
		items: [{}, {},{
			icon: "send",
			command: "submitPost",
			disabled: false
		}]
	};
	var canattach = false; //TODO:add `toggle option defaulted to off.
	if (canattach) {
		this.cmdMenuModel.items[0]=
		{
				icon: "attach",
				command: "attachImage",
				disabled: false
		}
	}

	this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'fade-bottom'}, this.cmdMenuModel);

};

//TODO: added event as test for popScene.
NewPostAssistant.prototype.aboutToActivate = function(event) {
	try {
		Mojo.Log.info("NewPostAssistant.aboutToActivate(), event:" + JSON.stringify(event));
	} catch (ex) { Mojo.Log.info("Unable to log event in NewPostAssistant.aboutToActivate()"); }
	
	/* put in event handlers here that should only be in effect when this scene is active. For
	 example, key handlers that are observing the document */
	this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
	Mojo.Log.info("NewPost.aboutToActivate");
	try {
		if (this.topicMode) {
			if (!this.newTopic) {
				this.aboutToActivateActions();
			} else {
				//this.setWaitingFeedback(false);
				//todo: should only be doing this if I need to!
				if (appSettings.debug.sessionRecovery) {
					appSettings.Tapatalk.authenticate(function(result) {
						this.setWaitingFeedback(false);
					}.bind(this));
				}
				else {
					this.setWaitingFeedback(false);
				}
			}
		}
		else {
			if (this.messageItem) {
				this.aboutToActivateActions();
			} else {
				//this.setWaitingFeedback(false);
				//todo: should only be doing this if I need to!
				if (appSettings.debug.sessionRecovery) {
					appSettings.Tapatalk.authenticate(function(result) {
						this.setWaitingFeedback(false);
					}.bind(this));
				}
				else {
					this.setWaitingFeedback(false);
				}
			}
		}
	}
	catch (e) {
		Mojo.Log.error("NewPost.aboutToActivate: ", e);
	}

};

NewPostAssistant.prototype.aboutToActivateActions = function() {
	try {
		var that = this;

		if (this.topicMode) {
			if (this.editMode) {
				Mojo.Log.info("Retrieve Post Information");
				appSettings.Tapatalk.post.get_raw_post(this.post.post_id, this.gotContent.bind(this));
			}
			else {
				if (this.post.quote_id) {
					Mojo.Log.info("Retrieve Quote Information");
					appSettings.Tapatalk.post.get_quote_post(this.post.quote_id, this.gotContent.bind(this));
				}
				else {
					//this.setWaitingFeedback(false);
					//todo: should only be doing this if I need to!
					if (appSettings.debug.sessionRecovery) {
						appSettings.Tapatalk.authenticate(function(result) {
							this.setWaitingFeedback(false);
						}.bind(this));
					}
					else {
						this.setWaitingFeedback(false);
					}
						
				}
			}
		}
		else {
			//SI ES RESPUESTA O FORWARD, PEDIR DATOS; SI NO, CANCELAR SCRIM
			if (this.messageItem && this.messageItem.id != 0) {
				appSettings.Tapatalk.privateMessage.get_quote_pm(this.messageItem.id, this.gotContent.bind(this));
			//this.setWaitingFeedback(false);
			}
			else {
				this.setWaitingFeedback(false);
			}
		}
	} catch(e) {
		Mojo.Log.error ("AboutToActivateActions: ", e);
	}
};

NewPostAssistant.prototype.gotContent = function(response) {
	Mojo.Log.info("NewPost.gotContent, response:" + JSON.stringify(response));
	if (!response.error && (response.result == undefined || response.result == true) ) {
		if (this.topicMode) {
			this.subjectModel.value = response.post_title;
			this.controller.modelChanged(this.subjectModel);
			this.contentModel.value = response.post_content;
			this.controller.modelChanged(this.contentModel);
			this.setWaitingFeedback(false);
		} else {
			this.subjectModel.value = response.msg_subject;
			this.controller.modelChanged(this.subjectModel);
			this.contentModel.value = "[QUOTE]" + response.text_body + "[/QUOTE]";
			this.controller.modelChanged(this.contentModel);
			this.setWaitingFeedback(false);
		}
	}
	else {
		//Mojo.Log.warn("gotContent() response.error: " + response.error);
//		if (response.error == "reauthenticate") {
		//TODO: add error handling to new message send, which is also affected. 
		Mojo.Log.info("NewPost.gotContent, error:" + JSON.stringify(response));
		if (response.error == "reauthenticate" || (appSettings.debug.sessionRecovery && appSettings.Tapatalk.loggedIn && response.result == false)) {
			var that = this;
			var retries = 0;
				var timer = that.controller.window.setInterval(function(){
					retries++;
					Mojo.Log.info("Re-authenticate attempts: " + retries);
					if (!appSettings.Tapatalk.connection.reauthenticate) {
						//Mojo.Log.info("waiting...");
						//retries = retries + 1;
						//if (appSettings.Tapatalk.loggedIn && retries == 2) {
							//Mojo.Log.info("Tired of waiting, calling authenticate...");
							clearInterval(timer);
							appSettings.Tapatalk.authenticate(function(result) {
								that.aboutToActivateActions();
							});
						//}
					}
				}, 2000);
		} //else if(response.error)
	}

};

NewPostAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	try {
		Mojo.Log.info("NewPostAssistant.activate(), event:" + JSON.stringify(event));
	} catch (ex) { Mojo.Log.info("Unable to log event in NewPostAssistant.activate()"); }
	if (event) {
		//if was success, add attachment_id to attachment_id_array, save group_id if necessary..
		if (event.result) {
			Mojo.Log.info("Adding attachment id " + event.attachment_id);
			//Attach succeeded
			if (!this.post.attachment_id_array) {
				this.post.attachment_id_array = [];
			}
			this.post.attachment_id_array.push(event.attachment_id);
			this.post.group_id = event.group_id;
			Mojo.Log.info("Attachments array: " + JSON.stringify(this.post.attachment_id_array));
		}
		else {
			//Attach failed
			Mojo.Log.error("Nothing was attached");
			if (event.result_text) {
				Mojo.Log.error("Result text: " + event.result_text);
			}
		}
	}
	else {
	  if (this.recipientsModel.value != "") {
	  	if (this.subjectModel.value != "") {
			this.controller.get("textFieldContent").mojo.focus();
		} else {
			this.controller.get("emailSubject").mojo.focus();
		}
	  }
	}
};

NewPostAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

NewPostAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
};

NewPostAssistant.prototype.handleCommand = function(event) {
		if(event.type == Mojo.Event.commandEnable && (event.command == Mojo.Menu.helpCmd || event.command == Mojo.Menu.prefsCmd)) {
			event.stopPropagation();
		}

		try {

			if (event.type == Mojo.Event.command) {
				switch (event.command) {
					case Mojo.Menu.helpCmd:
						break;
					case 'attachImage':
						var args = {forum_id: this.forum_id, currentTopic: this.topic, group_id: this.post.group_id };
						this.controller.stageController.pushScene("newmessage", args);
						break;
					case 'submitPost':
						//Mojo.Log.info("ENVIANDO MENSAJE: foro:", this.post.forum_id," topic:", this.post.topic_id, " asunto:", this.subjectModel.value, " texto:", this.contentModel.value)
						this.managePostSendingWrapper();
						break;
				}
			}

		} catch (e) {
			Mojo.Log.error("handleCommand: ", e);
		}
};

NewPostAssistant.prototype.setupWaitingFeedback = function() {
	try {
		this.spinnerAttrs = {
			spinnerSize: Mojo.Widget.spinnerLarge
		};
		this.spinnerModel = {
			spinning: false
		}
		this.controller.setupWidget('activity-spinner', this.spinnerAttrs, this.spinnerModel);

		this.spinner = this.controller.get('activity-spinner');
		this.scrim = this.controller.get('scrim');
	}
	catch (e) {
		Mojo.Log.error("setupWaitingFeedback: ", e);
	}


};

NewPostAssistant.prototype.setWaitingFeedback = function(activate) {
	if (activate) {
		this.scrim.show();
		this.spinnerModel.spinning = true;
		this.controller.modelChanged(this.spinnerModel);

	} else {
		this.scrim.hide();
		this.spinnerModel.spinning = false;
		this.controller.modelChanged(this.spinnerModel);

		if(this.requestFeedbackTimeout) {
			this.controller.window.clearTimeout(this.requestFeedbackTimeout);
		}
	}

};

NewPostAssistant.prototype.managePostSendingWrapper = function() {
	try {
		//Mojo.Log.info("Entering managePostSendingWrapper");

		if (appSettings.Tapatalk.connection.reauthenticate) {
			Mojo.Log.info("NewPost send, reauthenticate is true (idle time check), reauthenticating..");
			var that = this;
				var timer = that.controller.window.setInterval(function(){
					if (!appSettings.Tapatalk.connection.reauthenticate) {
						//Mojo.Log.info("waiting...");
						//retries = retries + 1;
						//if (appSettings.Tapatalk.loggedIn && retries == 2) {
							//Mojo.Log.info("Tired of waiting, calling authenticate...");
							clearInterval(timer);
							appSettings.Tapatalk.authenticate(function(result) {
								that.managePostSending();
							});
						//}
					}
				}, 2000);
		}
		else {
			this.managePostSending();
		}

/*		if (appSettings.Tapatalk.connection.reauthenticate) {
			appSettings.Tapatalk.authenticate(function(result){
				that.managePostSending();
			});
			//this.getForums(listWidget,postsOffset, postsLimit);
		}
		else {
			this.managePostSending();
		}
*/
	}
	catch (e) {
		Mojo.Log.error("managePostSendingWrapper: ", e);
	}

};

NewPostAssistant.prototype.managePostSending = function() {

	var that = this;

	Mojo.Log.info("managePostSending, contentModel: [", this.contentModel.value + "]");
	if (this.topicMode) {
		if (this.newTopic) {
			Mojo.Log.info("Sending new topic");
			if (this.subjectModel.value == "") {
				this.controller.showAlertDialog({
					onChoose: function(value){
					//Mojo.Controller.StageController.activeScene().assistant.setWaitingFeedback(false);
					},
					title: $L("New Topic"),
					message: $L("Please insert a topic title."),
					choices: [{
						label: $L('Ok'),
						value: 'OK',
						type: 'standard'
					}]
				});
			}
			else {
				if (this.contentModel.value == "") {
					this.controller.showAlertDialog({
						onChoose: function(value){
						//Mojo.Controller.StageController.activeScene().assistant.setWaitingFeedback(false);
						},
						title: $L("New Topic"),
						message: $L("Please insert topic text."),
						choices: [{
							label: $L('Ok'),
							value: 'OK',
							type: 'standard'
						}]
					});

				}
				else {
					var text_body = "";
					if (appSettings.config.spreadWord) {
						text_body = this.contentModel.value + "\n\n" + appSettings.postingMessage;
					}
					else {
						text_body = this.contentModel.value;
					}
					this.scrim.show();
					this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
					appSettings.Tapatalk.topic.new_topic(this.forum_id, this.subjectModel.value, text_body, '', this.post.attachment_id_array, this.post.group_id, function(response){
						//Mojo.Log.info(Object.toJSON(response));
						that.setWaitingFeedback(false);
						if (response == true || response.result == true) {
							if (response.state == 1) {
								that.controller.showAlertDialog({
									onChoose: function(value){
										//if (value == 'OK') {
										//}
										//Mojo.Controller.stageController.popScene();
										that.controller.stageController.popScene(response);

									},
									title: $L("Moderation"),
									message: $L("Your post has been send, but is awaiting for moderation"),
									choices: [{
										label: $L('Ok'),
										value: 'OK',
										type: 'standard'
									}]
								});
							}
							else {
								that.controller.stageController.popScene(response);
							}
						}
						else {
							//TODO: add error handling to new message send, which is also affected. 
							Mojo.Log.info("NewPostAssistant.send, error:" + JSON.stringify(response));
							if (response.error == "reauthenticate" || (appSettings.Tapatalk.loggedIn && response.result == false)) {
								that.controller.showAlertDialog({
									onChoose: function(value){
										//if (value == 'OK') {
										//}
										//Mojo.Controller.stageController.popScene();
										//that.controller.stageController.popScene(response);

									},
									title: $L("Error"),
									message: $L("Unable to submit message. " + (response.result_text ? response.result_text : "")),
									choices: [{
										label: $L('Ok'),
										value: 'OK',
										type: 'standard'
									}]
								});
							}							
						}
		}, this.managePostingError.bind(this));
				}
			}

		} //if newTopic
		else {
			if (!this.editMode) {
				Mojo.Log.info("Sending reply post");
				//not newTopic, and not editMode, so it is a reply.
				var text_body = "";
				if (appSettings.config.spreadWord) {
					text_body = this.contentModel.value + "\n\n" + appSettings.postingMessage;
				}
				else {
					text_body = this.contentModel.value;
				}
				
				//mcw debug temp.. remove this!
				Mojo.Log.info("managePostSending, contentModel.value: [" + this.contentModel.value + "]");
				Mojo.Log.info("managePostSending, text_body: [" + text_body + "]");
				//return;
				//appSettings.config.spreadWord
				this.scrim.show();
				this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
				                        //reply_post: function(forum_id, topic_id, text_subject, text_body, attachment_id_array, callback, callbackError){
				appSettings.Tapatalk.post.reply_post(this.post.forum_id, this.post.topic_id, this.subjectModel.value, text_body, this.post.attachment_id_array, this.post.group_id, function(response){
					that.setWaitingFeedback(false);
					//Mojo.Log.info(Object.toJSON(response));
					if (response == true || response.result == true) {
						if (response.state == 1) {
							that.controller.showAlertDialog({
								onChoose: function(value){
									//if (value == 'OK') {
									//}
									//Mojo.Controller.stageController.popScene();
									that.controller.stageController.popScene(response);

								},
								title: $L("Moderation"),
								message: $L("Your post has been send, but is awaiting for moderation"),
								choices: [{
									label: $L('Ok'),
									value: 'OK',
									type: 'standard'
								}]
							});
						}
						else {
							that.controller.stageController.popScene(response);
						}
					}
					else {
						//TODO: add error handling to new message send, which is also affected. 
						Mojo.Log.info("NewPostAssistant.send, error:" + JSON.stringify(response));
						if (response.error == "reauthenticate" || (appSettings.Tapatalk.loggedIn && response.result == false)) {
							that.controller.showAlertDialog({
								onChoose: function(value){
									//if (value == 'OK') {
									//}
									//Mojo.Controller.stageController.popScene();
									//that.controller.stageController.popScene(response);

								},
								title: $L("Error"),
								message: $L("Unable to send reply. " + (response.result_text ? response.result_text : "")),
								choices: [{
									label: $L('Ok'),
									value: 'OK',
									type: 'standard'
								}]
							});
						}							
					}
		}, this.managePostingError.bind(this));
			}//!editMode
			else {
				//editMode
				Mojo.Log.info("Saving edited post.");
				this.scrim.show();
				this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
				appSettings.Tapatalk.post.save_raw_post(this.post.post_id, this.subjectModel.value, this.contentModel.value.replace(new RegExp("ē", "gi"), "e"), function(response){
					that.setWaitingFeedback(false);
					//Mojo.Log.info(Object.toJSON(response));
					if (response == true || response.result == true) {
						that.controller.stageController.popScene(response);
					}
					else {
						Mojo.Log.info("NewPostAssistant.send, error:" + JSON.stringify(response));
						if (response.error == "reauthenticate" || (appSettings.Tapatalk.loggedIn && response.result == false)) {
							that.controller.showAlertDialog({
								onChoose: function(value){
									//if (value == 'OK') {
									//}
									//Mojo.Controller.stageController.popScene();
									//that.controller.stageController.popScene(response);

								},
								title: $L("Error"),
								message: $L("Unable to save message. " + (response.result_text ? response.result_text : "")),
								choices: [{
									label: $L('Ok'),
									value: 'OK',
									type: 'standard'
								}]
							});
						}							
					}
		}, this.managePostingError.bind(this));

			}
		}
	} //topicMode
	else {
		Mojo.Log.info("Sending private message");
		//private message
		this.scrim.show();
		this.requestFeedbackTimeout = this.controller.window.setTimeout(this.setWaitingFeedback.curry(true).bind(this), 3000);
		if (this.replyMode == true) {
			//REPLYING
			var action = 1;
		}
		else {
			//FORWARDING
			if (this.messageItem.id != 0) {
				var action = 2;
			} else {
				var action = 0;
			}
		}
		//Mojo.Log.info("ACTION: ", action, "MESSAGE ID: ", this.messageItem.id);
		logJSON(JSON.stringify({ "recipientModel" : this.recipientsModel, "subjectModel": this.subjectModel, "contentModel": this.contentModel }," ",2));
		appSettings.Tapatalk.privateMessage.create_message(this.recipientsModel.value, this.subjectModel.value, this.contentModel.value, action, this.messageItem.id, function(response){
					that.setWaitingFeedback(false);
					Mojo.Log.info(Object.toJSON(response));
					if (response == true || response.result == true) {
						Mojo.Log.info("PM sent successfully!");
						if (that.child) {
							that.controller.stageController.popScene();
						}
						else {
							that.controller.stageController.popScenesTo("messages");
						}
					} else {
						Mojo.Log.info("PM send failed!" + response.result_text);
					}
		}, this.managePostingError.bind(this));


	}
};

NewPostAssistant.prototype.managePostingError = function(errorData) {

	//Mojo.Log.info(Object.toJSON(errorData));
	if (errorData.error == "reauthenticate") {
//	//TODO: add error handling to new message send, which is also affected. 
//	Mojo.Log.info("SubscribedPostsAssistant.gotTopics, error:" + JSON.stringify(response));
//	if (errorData.error == "reauthenticate" || (appSettings.Tapatalk.loggedIn && errorData.result == false)) {
		var that = this;
		var retries = 0;
				var timer = that.controller.window.setInterval(function(){
					if (!appSettings.Tapatalk.connection.reauthenticate) {
						Mojo.Log.info("waiting...");
						//retries = retries + 1;
						//if (appSettings.Tapatalk.loggedIn && retries == 2) {
							Mojo.Log.info("Tired of waiting, calling authenticate...");
							clearInterval(timer);
							appSettings.Tapatalk.authenticate(function(result) {
								that.managePostSending();
							});
						//}
					}
				}, 2000);
	}
	else {
		this.controller.showAlertDialog({
			onChoose: function(value){
				//if (value == 'OK') {
				//}
				//Mojo.Controller.stageController.popScene();
				this.setWaitingFeedback(false);

			},
			title: $L("Error sending post"),
			message: $L(errorData.faultString),
			choices: [{
				label: $L('Ok'),
				value: 'OK',
				type: 'standard'
			}]
		});
	}
};

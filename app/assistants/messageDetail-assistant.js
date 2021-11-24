function MessageDetailAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  if(args) {
	  	this.box_id = args.box_id;
		this.message_id = args.message_id;
	  }
	  
	  this.messageTapHandler = this.messageTap.bindAsEventListener(this);
}

MessageDetailAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* add event handlers to listen to events from widgets */
		this.controller.get("scrim-minimized").hide();
		this.controller.get("forum-image-small").src = appSettings.currentForum.logo;

	//Mojo.Log.info("ALTURA: ", this.controller.window.innerHeight);
	var height = this.controller.window.innerHeight - 170;
	this.controller.get("email_body_text").style.minHeight = height +"px";

		this.cmdMenuModel = {
			visible: true,
			items: [{
				icon: "reply",
				command: "replyMessage",
				disabled: false
			}, {
				icon: "forward-email",
				command: "forwardMessage"
			}, {}, {
				icon: "delete",
				command: "deleteMessage"
			}]
		};

		this.controller.setupWidget(Mojo.Menu.commandMenu, { menuClass: 'fade-bottom'}, this.cmdMenuModel);
		
		this.controller.listen(this.controller.get("email_body_text"), Mojo.Event.tap, this.messageTapHandler);


};

MessageDetailAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  appSettings.Tapatalk.privateMessage.get_message(this.message_id, this.box_id, this.gotMessage.bind(this));
};

MessageDetailAssistant.prototype.gotMessage = function(result) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	  
	  //this.controller.get("sender").innerHTML =result.msg_from;
	  
	var d = new Date();
	d.setTime(result.sent_date);

	var getLocalDate = function (originalDate){
		
		var offSet = d.getTimezoneOffset();
		
		offSet = offSet*60000;
		var cleanDate = new Date();
		cleanDate.setTime(originalDate.getTime()+offSet);
		
		return cleanDate;
	};

	d = getLocalDate(d);
	this.messageItem = result;
	result.niceDate = Mojo.Format.formatDate(d, {date:'short'}) + " " + Mojo.Format.formatDate(d, {time:'short'});

	var fromField = this.controller.get("email_from");
	var content = Mojo.View.render({template: 'messageDetail/message_from', object:result});
	fromField.update(content);
	
	var recipients = "";
	//Mojo.Log.info(Object.toJSON(result));
	
	if (result.msg_to) {
		result.msg_to.each(function(recipient){
			if (recipients != "") 
				recipients = recipients + "; ";
			recipients = recipient.username;
		});
		result.recipients = recipients
		result.recipientCount = result.msg_to.length;
		var recipientsField = this.controller.get("email_recipients_controller");
		content = Mojo.View.render({
			template: 'messageDetail/message_recips_compressed',
			object: result
		});
		recipientsField.update(content);
	} else {
		//Mojo.Log.info("Ocultando destinatarios");
		this.controller.get("recipients-row").hide();		
		var height = this.controller.window.innerHeight - 130;
		this.controller.get("email_body_text").style.minHeight = height +"px";
	}

	var subjectField = this.controller.get("email_subject");
	content = Mojo.View.render({template: 'messageDetail/message_subject', object: result });
	subjectField.update(content);

	if (appSettings.debug.dumpPosts && appSettings.debug.detailedLogging) {
		logJSON("Unformatted message body: " + result.text_body);
		logJSON("Formatted message body: " + myParser.toHTML(result.text_body));
	}
	this.controller.get("email_body_text").innerHTML =  myParser.toHTML(result.text_body);
};
MessageDetailAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

MessageDetailAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */

		this.controller.stopListening(this.controller.get("email_body_text"), Mojo.Event.tap, this.messageTapHandler);
};

MessageDetailAssistant.prototype.handleCommand = function(event) {

		switch (event.type) {
			case Mojo.Event.command:
				switch (event.command) {
					case "deleteMessage":
						this.deleteMessage();
						break;
					case "replyMessage":
						var args = {
							topicMode: false,
							replyMode: true,
							originalMessage: this.messageItem,
							messageId: this.message_id
						};
						this.controller.stageController.pushScene("newPost", args);
						break;
					case "forwardMessage":
						var args = {
							topicMode: false,
							replyMode: false,
							originalMessage: this.messageItem,
							messageId: this.message_id
						};
						this.controller.stageController.pushScene("newPost", args);
						break;
				}
		}
	
};

MessageDetailAssistant.prototype.deleteMessage = function(){

	this.controller.showAlertDialog({
		onChoose: this.deleteAlertChoose.bind(this),
		title: $L("Delete Message"),
		message: $L("Are you sure you want to delete this message? This action can't be undone"),
		choices: [{
			label: $L('Ok'),
			value: 'OK',
			type: 'negative'
		}, {
			label: $L('Cancel'),
			value: 'CANCEL',
			type: 'standard'
		}]
	});
	
};

MessageDetailAssistant.prototype.deleteAlertChoose = function(choice) {
	if (choice == 'OK') {
		appSettings.Tapatalk.privateMessage.delete_message(this.message_id, this.box_id, this.doDeletion.bind(this));
		
	}
};

MessageDetailAssistant.prototype.doDeletion = function(response) {
		
			if (response.result || response == true) {
				//this.controller = Mojo.Controller.stageController.activeScene();
				this.controller.stageController.popScene();
			}
			else {
				if (response.error == "reauthenticate") {
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
								that.deleteAlertChoose("OK");
							});
						//} 
					}
				}, 2000);
				//this.getMessages(listWidget, postsOffset, postsLimit);
				}
				else {
					Mojo.Controller.errorDialog(response.result_text);
				}
			}
};

MessageDetailAssistant.prototype.messageTap = function(event) {
	try {
		var args = {};
		//var item = event.item;
		var originalEvent = event.target;
		event.stopPropagation();

		if (originalEvent.name === "link" || originalEvent.name ==="anchor" || originalEvent.name ==="email") {
			
			event.stopPropagation();
			//event.cancel();
			switch (originalEvent.name) {
				case "link":
			//Mojo.Log.info(Object.toJSON(parseUri(originalEvent.href).queryKey));
				if(isEmptyJSON(parseUri(originalEvent.href).queryKey)) {
					Mojo.Log.info("URI VALIDA");
				} else {
					Mojo.Log.info("URI NO VALIDA");
				}

					var menuItem = [{
						label: $L("Open link"),
						command: "openLink"
					}];
					break;
				case "anchor":
					var menuItem = [{
						label: $L("Open File"),
						command: "openFile"
					}];
					break;
				case "email":
					var menuItem = [{
						label: $L("Send email"),
						command: "sendEmail"
					}];
					break;
			}
			
							args = {
								element: originalEvent.href
							};
				//Mojo.Log.info(Object.toJSON(args));

				this.popupMenuModel = {
					onChoose: this.postMenuPopupHandler.curry(args),
					placeNear: event.target,
					manualPlacement: false,
					//popupClass: "sub-menu-popup",
					items: menuItem
				};
				
		this.controller.popupSubmenu(this.popupMenuModel);
		} else if (originalEvent.name === "image") {
			event.stopPropagation();
			//event.cancel();
			
							args = {
								element: originalEvent.src
							};
				//Mojo.Log.info(Object.toJSON(args));
				var menuItem = [{
						label: $L("Open Image in Browser"),
						command: "openLink"
					}];
					
				this.popupMenuModel = {
					onChoose: this.postMenuPopupHandler.curry(args),
					placeNear: event.target,
					manualPlacement: false,
					//popupClass: "forum-menu-popup",
					items: menuItem
				};

				this.controller.popupSubmenu(this.popupMenuModel);
			
		}
		
	} catch (e) {
		Mojo.Log.error("postTap error: ", e);
	}
};

MessageDetailAssistant.prototype.postMenuPopupHandler = function(target,choice) {
	try {
		Mojo.Log.info("Tap target: " + target.element);
		this._onChild = true;
		switch (choice) {
			case 'openLink':
			case 'openFile':
			case 'openImage':
			case 'sendEmail':
				handleUrl(target.element);
				/*
				this.controller.serviceRequest('palm://com.palm.applicationManager', {
					method: 'open',
					parameters: {
						target: target.element
					}
				});
				*/
				break;
		}
	} catch (e) {
		Mojo.Log.error("childForum forumMenuPopupHandler: ", e);
	}
	
};

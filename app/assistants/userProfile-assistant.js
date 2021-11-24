function UserProfileAssistant(profile) {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	this.profile = profile;
}

UserProfileAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	//this.controller.get("email_from").innerHTML = this.profile.username;
	//this.controller.get("user-image-small").src = this.profile.icon_url;
	
	var subjectField = this.controller.get("main");
	if (subjectField) {
		var content = Mojo.View.render(
				{	object: this.profile, 
					template: 'userProfile/userTemplate',
					formatters: {
						reg_time: appSettings.Formatting.getNiceDate.bind(this),
						icon_url: appSettings.Formatting.formatTopicImage.bind(this),
						post_content: appSettings.Formatting.formatPostContent.bind(this),
						is_online: appSettings.Formatting.formatIsOnline.bind(this)
//						,thanks_info: this.getThanksInfo.bind(this)
//						,likes_info: this.getLikesInfo.bind(this)
//						,like_count: this.getLikesCount.bind(this)
						//can_reply:  appSettings.Formatting.formatCanReply.bind(this)
					} 
				});
		subjectField.innerHTML = content;
	} else {
		Mojo.Log.error("Unable to get target div");
	}	
	
	if (this.profile.custom_fields_list && this.profile.custom_fields_list.length > 0) {
//		this.controller.get("customname").innerHTML=this.profile.custom_fields_list[0].name + ": ";
//		this.controller.get("customvalue").innerHTML=this.profile.custom_fields_list[0].value;
		var htmlString = "";
		for (ii=0;ii<this.profile.custom_fields_list.length;ii++) {
			if (this.profile.custom_fields_list[ii].value.length > 0) {
				htmlString += this.profile.custom_fields_list[ii].name + ": ";
				htmlString += this.profile.custom_fields_list[ii].value + "<br/>";
			}
		}
		this.controller.get("customdata").innerHTML=htmlString;
	}
	
//	this.cmdMenuModel = {
//			visible: true,
//			items: [{
//				iconPath: "images/menu-icon-mail.png",
//				command: "sendMessaget",
//				disabled: false
//			}, {}, {
//				iconPath: "images/menu-icon-conversation.png",
//				command: "findPosts"
//			}, {
//				label: "Topics",
//				command: "findTopics"
//			}]
//		};
//	this.controller.setupWidget(Mojo.Menu.commandMenu, {
//		menuClass: 'fade-bottom'
//	}, this.cmdMenuModel);

	/* add event handlers to listen to events from widgets */

	//TODO: in-progress for future version. need new scene for user topics/posts... 
	//      This needs to move there, or push data to new scene.
	try {
		if (false) {
			Mojo.Log.info("UserProfileAssistant.setup - calling get_user_topic/get_user_reply_post..");
			appSettings.Tapatalk.user.get_user_topic(this.profile.username, this.gotUserTopics.bind(this));
			appSettings.Tapatalk.user.get_user_reply_post(this.profile.username, this.gotUserReplyPosts.bind(this));
			if ( appSettings.Tapatalk.loggedIn && appSettings.Tapatalk.config.conversation ) {
				//appSettings.Tapatalk.privateMessage.get_conversations(this.controller.stageController.assistant.gotMessagesCount.bind(this));
				appSettings.Tapatalk.privateMessage.get_conversations(this.gotConversations.bind(this));
			}
		}
	} catch (e) {
		Mojo.Log.error("UserProfileAssistant.setup - get_user_topics_and_replies, exception: ", e);
	}
	
};

//TODO: need to finish this, and command menu in setup...
/*
UserProfileAssistant.prototype.handleCommand = function (something) {
				var args = {
					topicMode: false,
					replyMode: false,
					recipients: target.author
				};
				this.controller.stageController.pushScene("newPost", args);
				break;

};
*/

UserProfileAssistant.prototype.gotUserTopics = function (response) {
	Mojo.Log.info("gotUserTopics()");
	try { 
		Mojo.Log.info("result: " + JSON.stringify(response));
		logJSON("UserProfileAssistant.gotUserTopics() response: " + JSON.stringify(response,null,2));
		var args = {
				userProfile: response
			};
		var htmlString = this.controller.get("customdata").innerHTML;
		htmlString += "\nUserTopics:\n";
		htmlString += JSON.stringify(response,null,2);
		this.controller.get("customdata").innerHTML=htmlString;
		//if (response.user_id) {
		//	this.viewingProfile=true;
		//	this.controller.stageController.pushScene("userProfile", response);
		//}
	} catch (ex) {
		Mojo.Log.error("Unable to print user info: " + ex);
	}	
};

UserProfileAssistant.prototype.gotUserReplyPosts = function (response) {
	Mojo.Log.info("gotUserReplyPosts()");
	try { 
		Mojo.Log.info("result: " + JSON.stringify(response));
		logJSON("UserProfileAssistant.gotUserReplyPosts() response: " + JSON.stringify(response,null,2));
		var args = {
				userProfile: response
			};
		var htmlString = this.controller.get("customdata").innerHTML;
		htmlString += "\nUserReplyPosts:\n";
		htmlString += JSON.stringify(response,null,2);
		this.controller.get("customdata").innerHTML=htmlString;

		//if (response.user_id) {
		//	this.viewingProfile=true;
		//	this.controller.stageController.pushScene("userProfile", response);
		//}
	} catch (ex) {
		Mojo.Log.error("Unable to print user info: " + ex);
	}	
}

UserProfileAssistant.prototype.gotConversations = function (response) {
	Mojo.Log.info("gotConversations()");
	try { 
		Mojo.Log.info("result: " + JSON.stringify(response));
		logJSON("UserProfileAssistant.gotConversations() response: " + JSON.stringify(response,null,2));
		var args = {
				userProfile: response
			};
		var htmlString = this.controller.get("customdata").innerHTML;
		htmlString += "\nConversations:\n";
		htmlString += JSON.stringify(response,null,2);
		this.controller.get("customdata").innerHTML=htmlString;
		//if (response.user_id) {
		//	this.viewingProfile=true;
		//	this.controller.stageController.pushScene("userProfile", response);
		//}
	} catch (ex) {
		Mojo.Log.error("Unable to print user info: " + ex);
	}	
};

UserProfileAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

UserProfileAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

UserProfileAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

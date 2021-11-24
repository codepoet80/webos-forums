// The applications custom menu command
MenuData = {};
MenuData.ApplicationMenu = {

	NewCard: {
		label: $L('New Card'),
		command: 'new-page-cmd'
	},

	ShareForum: {
		label: $L('Share'),
		command: 'share-forum-cmd',
		checkEnabled: true
	},

	AddToLauncher: {
		label: $L('Add to Launcher'),
		command: 'add-launch-icon-cmd',
		checkEnabled: true
	},
	ForumTree: {
		label: $L('Forum Tree'),
		command: 'show-forum-cmd',
		checkEnabled: true
	},
	Subscribed: {
		label: $L('Subscribed Topics'),
		command: 'show-subscribed-cmd',
		checkEnabled: true
	},
	Lastest: {
		label: $L('Recent Topics'), //mw 6/13/15 changed from Lastest Topics
		command: 'show-lastest-cmd',
		checkEnabled: true
	},
	Search: {
		label: $L('Search'),
		command: 'show-search-cmd',
		checkEnabled: true
	},
	Login: {
		label: $L('Login'),
		command: 'show-login-cmd',
		checkEnabled: true
	},
	Logout: {
		label: $L('Logout'),
		command: 'logout-forum-cmd',
		checkEnabled: true
	},
	PrivateMessages: {
		label: $L('Private Messages'),
		command: 'show-private-cmd',
		checkEnabled: true
	},
	Search: {
		label: $L('Search'),
		command: 'show-search-cmd',
		checkEnabled: true
	},
	Preferences: {
		label: $L('Preferences'),
		command: Mojo.Menu.prefsCmd,
		checkEnabled: true
	},
	Help: {
		label: $L('Help'),
		command: Mojo.Menu.helpCmd,
		checkEnabled: true
	},
	Support: {
		label: $L('Support'),
		command: 'show-support-cmd',
		checkEnabled: true
	},
	//Added by Jonathan Wise, 11/14/2020
	GoBack: {
		label: $L("Go Back"),
		command: "doGoBack"
	}


};

MenuData.PopupMenu = {
	separators: {
		forumActions: {
			label: $L("Forum Actions")
		},
		topicActions: {
			label: $L("Topic Actions")
		},
		options: {
			label: $L("Options")
		}
	},
	ViewProfile: {
		label: $L("View public profile"),
		command: "go-profile"
	},
	SendPrivateMessage: {
		label: $L("Send private message"),
		command: "go-send-private-message"
	},
	FindPostsByUser: {
		label: $L("Find more posts by this user"),
		command: "go-find-posts"
	},
	MarkAsRead: {
		label: $L("Mark current forum read"),
		command: "markAsRead"
	},
	MarkAllAsRead: {
		label: $L("Mark all forums read"),
		command: "markAllAsRead"
	},
	CopyForumURL: {
		label: $L("Copy Forum Link"),
		command: "copyForumAddress"
	},
	CopyThreadURL: {
		label: $L("Copy Thread Link"),
		command: "copyTopicAddress"
	},
	CopyPostURL: {
		label: $L("Copy Post Link"),
		command: "copyPostAddress"
	},
	QuotePost: {
		label: $L("Quote Post"),
		command: "quotePost"
	},
	EditPost: {
		label: $L("Edit Post"),
		command: "editPost"
	},
	LikePost: {
		label: $L("Like"),
		command: "likePost"
	},
	UnlikePost: {
		label: $L("Unlike"),
		command: "unlikePost"
	},
	ThankPost: {
		label: $L("Thank"),
		command: "thankPost"
	},
	ViewChildForums: {
		label: $L("View child forums"),
		command: "showChildForums"
	},
	HideChildForums: {
		label: $L("Hide child forums"),
		command: "hideChildForums"
	},
	ShowForumPath: {
		label: $L("View forum path"),
		command: "showForumPath"
	},
	HideForumPath: {
		label: $L("Hide forum path"),
		command: "hideForumPath"
	},
	SubscribeForum: {
		label: $L("Subscribe Forum"),
		command: "subscribeForum"
	},
	UnsubscribeForum: {
		label: $L("Unsubscribe Forum"),
		command: "unsubscribeForum"
	},
	SubscribeTopic: {
		label: $L("Subscribe Topic"),
		command: "subscribeTopic"
	},
	UnsubscribeTopic: {
		label: $L("Unsubscribe Topic"),
		command: "unsubscribeTopic"
	},
	ViewAll: {
		label: $L("Recent Posts"),
		command: "viewAll"
	},
	ViewUnread: {
		label: $L("Unread Posts"),
		command: "viewUnread"
	},
	ViewSubscribedTopics: {
		label: $L("Subscriptions"),
		command: "viewSubscribedTopics"
	},
	ViewSubscribedForums: {
		label: $L("Subscribed Forums"),
		command: "viewSubscribedForums"
	},
	ViewParticipatedTopics: {
		label: $L("Participated Topics"),
		command: "viewParticipatedTopics"
	},
	OpenTopic: {
		label: $L("Open"),
		command: "openTopic"
	},
	OpenTopicNewCard: {
		label: $L("Open in new Card"),
		command: "openTopicInNewCard"
	},
	TweetThis: {
		label: $L("Tweet this"),
		command: "tweet",
		iconPath:"images/twitter_dark_32.png"
	}
};

MenuData.CommandMenu = {
	Gallery: {
				iconPath: "images/menu-icon-xapp-web.png",
				label: "",
				command: "go-gallery"
			},
	New: {
				iconPath: "images/menu-icon-new.png",
				label: "",
				command: "go-new"
			},
	History: {
				iconPath: "images/menu-icon-date.png",
				label: "",
				command: "go-history"
			},
	Accounts: {
				iconPath: "images/menu-icon-subscribed.png",
				label: "",
				command: "go-accounts"
			},
	Recent: {
				iconPath: "images/menu-icon-date.png",
				label: "",
				command: "go-recent"
			},
	Subscribed: {
				iconPath: "images/menu-icon-subscribed.png",
				label: "",
				command: "go-subscribed"
			},
	Tree: {
				iconPath: "images/menu-icon-list.png",
				label: "",
				command: "go-tree"
			},
	Messages: {
				iconPath: "images/menu-icon-mail.png",
				label: "",
				command: "go-mail"
			},
	Search: {
				icon: "search",
				label: "",
				command: "go-search"
			},
	Login:	{
				iconPath: "images/menu-icon-unlock.png",
				label: "Login",
				command: "show-login-cmd"
			},
	Back:	{
				icon: 'back',
				label: $L('Back'),
				command: 'go-back'
			}
};

MenuData.ViewMenu = {
	Search: {
				icon: "search",
				label: "",
				command: "view-search"
			},
	Gallery: {
		label: $L("All"),
		iconPath: "images/menu-icon-list.png",
		command: "view-gallery"
	},
	New: {
		label: $L("New"),
		iconPath: "images/menu-icon-date.png",
		command: "view-new"
	}
};
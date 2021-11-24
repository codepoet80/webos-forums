/*appSettings = {};
appSettings.url = "";
appSettings.accountName = "";
appSettings.accountPassword = "";
appSettings.postingMessage = "";
appSettings.serverVersion ="";
appSettings.currentForum = {};
appSettings.forums = [];
appSettings.forumsHistory = [];
appSettings.unreadMessagesCount = 0;
appSettings.config = {};
appSettings.config.postPagination = true;
appSettings.config.spreadWord = true;
appSettings.config.defaultAppView = "gallery";
appSettings.config.defaultView = "forums";
appSettings.config.autoLogin = "true";
appSettings.config.newTopicsCount = 20;
//appSettings.Metrix = new Metrix(); //Instantiate Metrix Library
appSettings.Formatting = new Formatting();
appSettings.asyncModules = new classAsyncModules();
appSettings.Database = new Database();
appSettings.Tapatalk = {};
appSettings.Gallery  = new Gallery();
//forumChecker = Object();

//Setting up the Tapatalk classes
//tapatalk = new Tapatalk();
appSettings.changingScene = false;
*/

appSettings = {
	url: "",
	accountName: "",
	accountPassword: "",
	postingMessage: "",
	serverVersion: "",
	subLaunch: false,
	subLaunchStages: [],
	currentForum: {},
	forums: [],
	forumsHistory: [],
	unreadMessagesCount: 0,
	debug: {
		detailedLogging: false,
		sessionRecovery: false,
		logPassword: false,
		logXMLRPC: true,
		logBBcodeParsing: false,
		dumpConnectionInfo: false,
		dumpForumLoaderArgs: true,
		dumpOnHoldItem: false,
		dumpRecentTopicList: false,
		dumpPosts: true //TODO: false
	},
	config: {
		filemgr: false,
		enableGallery: false,
		postPagination: true,
		spreadWord: true,
		darkTheme: true,
		defaultAppView: "gallery",
		defaultView: "forums",
		autoLogin: "true",
		newTopicsCount: 20,
		twitter: {
			oauth_token: "",
			oauth_token_secret: "",
			authorized: false
		},
		fontSize: "fontsize2"
	},
	twitter: {
		consumerKey: "gW2uMhXh8flC9xJ756DDRw",
		consumerSecret: "mJeGYzP47RNdRNRMHflMLbXhu1lInrnY7tVCu4aNMo"
	},
	bitly: {
		login: "newness",
		key: "R_5e6e614ec7d0fb013eaf549307957d0e"
	},
	Formatting: new Formatting(),
	//asyncModules: new classAsyncModules(),
	Database: new Database(),
	Tapatalk: {},
	Gallery: new Gallery(),
	Bitly: new Bitly(),
	//forumChecker: Object(),

	//Setting up the Tapatalk classes
	//tapatalk: new Tapatalk(),
	changingScene: false
};

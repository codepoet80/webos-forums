/* cookie.js
Copyright 2009 Rafael Bernad de Castro. All rights reserved.
*/

var Cookie = Class.create({
		initialize: function()
		{
			// Update globals with preferences or create it.
			//Mojo.Log.info(Mojo.appInfo.id);
			this.cookieName = Mojo.appInfo.id + ".settings";
			this.initializeCookie();
		},
		initializeCookie: function() {

			this.cookieData = new Mojo.Model.Cookie(this.cookieName);
			Mojo.Log.info(this.cookieName);
			var storedPrefs = this.cookieData.get();
			//try {
				if (storedPrefs) {
					Mojo.Log.info("App version: " + Mojo.Controller.appInfo.version, ", storedPrefs version: " + storedPrefs.config.version);
					if (storedPrefs.config.version == Mojo.Controller.appInfo.version) {
						appSettings.config = storedPrefs.config;
					}
					else {
						Mojo.Log.info(storedPrefs.config.version);
						//var arrVersion = storedPrefs.config.version.split(".");
						if (storedPrefs.config.version <  "1.2.0") {
						appSettings.config = storedPrefs.config;
						appSettings.config.version = Mojo.Controller.appInfo.version;
						Mojo.Log.info("Version inferior");
						appSettings.config.twitter = {
							oauth_token: "",
							oauth_token_secret: "",
							authorized: false
						};


						//appSettings.data = storedPrefs.data;
						this.storeCookie();
						}
						else {
						appSettings.config = storedPrefs.config;
						}
					}
				}
				else {
					appSettings.config.version = Mojo.Controller.appInfo.version;
				//appSettings.data = {categories: [], items: []};
				}
				//this.storeCookie();
/*
			}
			catch (e) {
				Mojo.Log.info("ERROR READING COOKIE");
				//Can't load cookie: start with a predefined set of preferences
				appSettings.CookieLoaded = false;
				appSettings.firstRun = false;
				appSettings.registered = false;
				appSettings.currentCategory = 0;
				appSettings.version = Mojo.Controller.appInfo.version;
				appSettings.preferences.autocloseDrawers = true;
				appSettings.preferences.alwaysShowSMS = true;
				appSettings.preferences.closeDrawerOnSwipe = true;
				appSettings.preferences.enableCustomGesturesInMain = true;
				appSettings.preferences.askToDial = true;
				appSettings.preferences.closeOnDial = true;
				appSettings.preferences.defaultColor = {
					name: "Black",
					htmlName: "BLACK",
					hexValue: "#000000"
				};
				this.storeCookie();
			}

*/		},
		// store - function to update stored cookie with global values
		storeCookie: function()
			{
				Mojo.Log.info("saving app Data");
				//appSettings.config.version = Mojo.Controller.appInfo.version;
			this.cookieData.put({
				config: appSettings.config
			});
		},
		// delete - function to delete stored cookie
		deleteCookie: function()
			{
			this.cookieData.remove();
			}
});
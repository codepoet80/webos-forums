var ConnectionManager = Class.create({
    initialize:function(parent) {
		this.parent = parent;
        this.connected = 0;
		this.connectivityData = {};
		this.initializing = true;
        this._checkConnection();
		Mojo.Log.info("ConnectionManager Initialize");

    },
	reauthenticate: false,
	disable: function() {
		Mojo.Log.info("Disabling ConnectionManager");
		if (this.connectionInfoRequest) {
			this.connectionInfoRequest.cancel();
			this.connectionInfoRequest = null;
		}
	},

    _checkConnection : function() {
        try {
            //var controller = Mojo.Controller.stageController.activeScene();
            this.connectionInfoRequest = new Mojo.Service.Request('palm://com.palm.connectionmanager/',
              {
                  method: 'getstatus',
                  parameters:
                    {
                        subscribe: true
                    },
                  onSuccess: this._checkSuccess.bind(this),
                  onFailure: this._checkFailure.bind(this)
              });
        }
        catch (e) {
            Mojo.Log.error('ConnectMgr -', e);
        }
    },

    _checkSuccess:function(response) {
		try {
			if (!this.initializing) {

					//Mojo.Log.info('ConnectMgr - _checkSuccess', response.isInternetConnectionAvailable);
					this.connected = response.isInternetConnectionAvailable;
					//this.connectivityData = response;

					if (this.connected) {

						//BUSCAMOS EL ANTERIOR M�TODO DE CONEXI�N
						//Mojo.Log.info("Connected");
						//Mojo.Log.info("CURRENT IP ADDRESS: ", this._ipAddress);
						var request = new Ajax.Request('http://checkip.dyndns.org/', {
							method: 'get',
							onSuccess: this._gotIP.bind(this),
							onFailure: function(transport){
								// this is a failure -- note this is only called if the request fails, not if the server returns a failure code (such as 404, 403, 500, etc.)
								Mojo.Log.info("fallo recogiendo IP: ", transport);

							}
.bind(this)
						});


					}
				//Mojo.Log.info("Re-authenticate: ", reauthenticate);


			}
			else {
				this.initializing = false;
				//revisar conexiones, y dar por buena wifi.
					var request = new Ajax.Request('http://checkip.dyndns.org/', {
              			method: 'get',
               			onSuccess: function(transport){
							var text = transport.responseText;
							//this.controller.get("response").innerHTML(text);
							//Mojo.Log.info(text);
							re = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/
							var matchArray = re.exec(text)
							Mojo.Log.info(matchArray[0]);
							this._ipAddress = matchArray[0];
						}.bind(this),
               			onFailure: function(transport) {
                  			// this is a failure -- note this is only called if the request fails, not if the server returns a failure code (such as 404, 403, 500, etc.)
 							Mojo.Log.info("fallo recogiendo IP: ", transport);

						}.bind(this)
            		});

/*
				if (response.wan.state == "connected") {
					this._ipAddress = response.wan.ipAddress;
					this.ipAddress = response.wan.ipAddress;
				}
				if (response.btpan.state == "connected") {
					this._ipAddress = response.btpan.ipAddress;
					this.ipAddress = response.wan.ipAddress;
				}
				if (response.wifi.state == "connected") {
					this._ipAddress = response.wifi.ipAddress;
					this.ipAddress = response.wan.ipAddress;
				}

*/
			}
		}
		catch (e) {
			Mojo.Log.error("TAP@TALK: connection _checkSuccess: ", e);
		}

    },

_gotIP: function(transport) {

	try {
		var reauthenticate = true;
		var text = transport.responseText;
		//this.controller.get("response").innerHTML(text);
		//Mojo.Log.info(text);
		re = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/
		var matchArray = re.exec(text)
		Mojo.Log.info("_gotIP: " + matchArray[0]);
		this.ipAddress = matchArray[0];
		Mojo.Log.info("_gotIP compare: " + this._ipAddress, " - ", this.ipAddress)
		if (this._ipAddress != this.ipAddress) {
			this._ipAddress = this.ipAddress;
		}
		else {
			reauthenticate = false;
		}

		if (reauthenticate && appSettings.Tapatalk.loggedIn) {
			var that = this;
			this.parent.user.logout_user(function(response){
				Mojo.Controller.getAppController().showBanner($L("IP address changed, re-authenticating..."), "", "");
				that.parent.user.login(function(response){
					if (response.result == true) {
						that.parent.headers = response.cookie;
						reauthenticate = false;
						that.reauthenticate = reauthenticate;

					}
				});
			});
		}
		else {
			this.reauthenticate = reauthenticate;
		}
	}
	catch (e) {
		Mojo.Log.error(e);
	}
},
/*
    _checkSuccess:function(response) {
		var reauthenticate = true;
		try {
			if (!this.initializing) {
				Mojo.Log.info('ConnectMgr - _checkSuccess', response.isInternetConnectionAvailable);
				this.connected = response.isInternetConnectionAvailable;
				//this.connectivityData = response;

				if (response.isInternetConnectionAvailable) {
					//BUSCAMOS EL ANTERIOR M�TODO DE CONEXI�N
					Mojo.Log.info("Connected");
					Mojo.Log.info("CURRENT IP ADDRESS: ", this.ipAddress);

					switch (this.ipAddress) {
						case response.wan.ipAddress:
							Mojo.Log.info("IP ADDRESS ES WAN");
							//Si hay conexi�n wifi o btpan, el sistema usa wifi o btpan, reiniciar...
							if (response.wifi.state == "connected" || response.btpan.state == "connected") {
								Mojo.Log.info("RECONECTANDO A WIFI O BTPAN");
								if (response.wifi.state == "connected") {
									this.ipAddress = response.wifi.ipAddress;
									Mojo.Log.info("NEW IPADDRESS: WIFI - ", this.ipAddress);
								}
								else {
									this.ipAddress = response.btpan.ipAddress;
									Mojo.Log.info("NEW IPADDRESS: BTPAN - ", this.ipAddress);
								}
							}
							break;
						case response.wifi.ipAddress:
							//app ipAddress es igual a wifi.ipAddress, no hacer nada
							Mojo.Log.info("IP ADDRESS ES WIFI");
							reauthenticate = false;
							break;
						case response.btpan.ipAddress:
							//app ipAddress es igual a btpan ipAddress
							Mojo.Log.info("IP ADDRESS ES BTPAN");
							reauthenticate = false;
							break;
						default:
							//app ipAddress no es igual a ning�n ipAddress, re-autenticar
							Mojo.Log.info("IP ADDRESS NO RECONOCIDA");
							Mojo.Log.info("CURRENT IPADDRESS: ", this.ipAddress);
							Mojo.Log.info("IPADDRESS WAN - ", response.wan.ipAddress);
							Mojo.Log.info("IPADDRESS WIFI - ", response.wifi.ipAddress);
							Mojo.Log.info("IPADDRESS BTPAN - ", response.btpan.ipAddress);

							if (response.wifi.state == "connected") {
								this.ipAddress = response.wifi.ipAddress;
								Mojo.Log.info("NEW IPADDRESS: WIFI - ", this.ipAddress);
							}
							else
								if (response.btpan.state == "connected") {
									this.ipAddress = response.btpan.ipAddress;
									Mojo.Log.info("NEW IPADDRESS: BTPAN - ", this.ipAddress);
								}
								else {
									this.ipAddress = response.wan.ipAddress;
									Mojo.Log.info("NEW IPADDRESS: WAN - ", this.ipAddress);
								}

					}

				}
				Mojo.Log.info("Re-authenticate: ", reauthenticate);
/*
				if (reauthenticate) {
					var that = this;
					this.parent.user.logout_user(function(response){
						Mojo.Controller.getAppController().showBanner($L("Re-authenticating..."), "", "");
						that.parent.user.login(function(response){
							if (response.result == true) {
								appSettings.headers = response.cookie;
								reauthenticate = false;
							}
						});
					});
				}

*
				this.reauthenticate = reauthenticate;
			}
			else {
				this.initializing = false;
				//revisar conexiones, y dar por buena wifi.
				if (response.wan.state == "connected") {
					this.ipAddress = response.wan.ipAddress;
				}
				if (response.btpan.state == "connected") {
					this.ipAddress = response.btpan.ipAddress;
				}
				if (response.wifi.state == "connected") {
					this.ipAddress = response.wifi.ipAddress;
				}

			}
		}
		catch (e) {
			Mojo.Log.error("TAP@TALK: connection _checkSuccess: ", e);
		}

    },

*/
    _checkFailure:function(response) {
        Mojo.Log.error('ConnectMgr - Connection Check Error:', response.errorText, '(Code', response.code, ')');
    }
});
function Bitly() {
     //this.login = appSettings.bitly.login;
     //this.apiKey = appSettings.bitly.key;
     //this.apiAuthenticationURL = "http://api.bit.ly/v3/validate";
     this.apiShortenURL = "http://api.bit.ly/v3/shorten";
}

/*
Bitly.prototype.authenticate = function(x_login, x_apikey, on_success, on_failure) {     
     var parameters = [];
     parameters.push(['apiKey', this.apiKey]);
     parameters.push(['login', this.login]);
     parameters.push(['format', "json"]);
     parameters.push(['x_apiKey', x_apikey]);
     parameters.push(['x_login', x_login]);
     
     var request_url = Carbon.unsignedRequest(this.apiAuthenticationURL, parameters, "GET");
     var req = new Ajax.Request(request_url, {
         method: 'get',
         evalJSON: 'force',
         onSuccess: on_success,
         onFailure: on_failure
     });
};

*/
Bitly.prototype.shorten = function(url, onSuccess, onFailure) {
    Mojo.Log.info("BITLY#SHORTEN");

    var parameters = [
		['apiKey', appSettings.bitly.key],
		['login', appSettings.bitly.login],
		['format', "json"],
		['domain', 'bit.ly'],
		['longUrl', url]
	];
    
/*
    parameters.push(['apiKey', this.apiKey]);
    parameters.push(['login', this.login]);
    parameters.push(['format', "json"]);

    if(Carbon.Prefs.SERVICES_URL == "mybitly"){
       parameters.push(['x_apiKey', Carbon.Prefs.SERVICES_URL_MYBITLY_APIKEY]);
       parameters.push(['x_login', Carbon.Prefs.SERVICES_URL_MYBITLY_USERNAME]);
    }else 

    parameters.push(['domain', 'bit.ly']);
    
    parameters.push(['longUrl', url]);
*/
    var request_url = OAuth.addToURL(this.apiShortenURL, parameters);
    //var request_url = Carbon.unsignedRequest(this.apiShortenURL, parameters, "GET");
Mojo.Log.info("DOING REQUEST");
    var req = new Ajax.Request(request_url, {
        method: "get",
        evalJSON: "force",
        onSuccess: function(response){
          //Mojo.Log.info("Bitly Response: ", Object.toJSON(response.responseJSON));
          if (response.responseJSON.status_code == 200) {
         Mojo.Log.info("Bitly Response 200: ", Object.toJSON(response.responseJSON.data));
 		  	onSuccess(response.responseJSON.data);
		  }
		  else {
		  	Mojo.Log.info("BITLY FAILURE: ", Object.toJSON(response));
		  	onFailure(response);
		  }
          
        }.bind(this),
        onFailure: function(error){
          Mojo.Log.info("Bitly Error: ", Object.toJSON(error));
          onFailure("Bitly: Error Shortening URL");
          
        }.bind(this)
    });
};

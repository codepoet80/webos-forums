var Database = Class.create(
{

initialize: function() {
	var options = {
			name: "PersistentList",
			version: 1
		};
		this.depot = new Mojo.Depot(options, Mojo.Log.info.bind("setup db succeeded"), Mojo.Log.info);
},

saveData: function(key,value) {
		var onSuccess = function() {
				Mojo.Log.info("SAVED DATA");
		}.bind(this);
		var onFailure = function() {
			Mojo.Log.error("ERROR SAVING DATA");
		};

	this.depot.add(key, value, onSuccess, onFailure);
},

discardData: function(key, callback) {
		var onSuccess = function() {
				Mojo.Log.info("DATA REMOVED");
		}.bind(this);
		var onFailure = function() {
			Mojo.Log.error("ERROR REMOVING DATA");
		};

	this.depot.discard(key, onSuccess, onFailure);
},

getData: function(key, storageKey, callback) {
		var onSuccess = function(rs) {
				if (!storageKey) {
					storageKey  = key;
				}

				var data;
			if (rs === null) {
				Mojo.Log.info("DEPOT: No records found");
				//data = [];
				if (key == "storedForums") {
					data = bundledForums;
				} else {
					data = [];
				}
			} else {
				Mojo.Log.info("DEPOT GETDATA: Loaded records for '", key, "'");
				data = rs;
			}
			//this.controller.setWidgetModel(this.wordsList, this.currentModel);
			callback(data);

		}.bind(this);
		var onFailure = function(error) {
			Mojo.Log.error("GETTING EMPTY DATA: ", error);
			//appSettings.data[storageKey] = [];
			callback([]);
		};

		this.depot.get( key, onSuccess, onFailure);

},

getDataNotCurrent: function(key, storageKey, callback) {
			var onSuccess = function(rs) {
			var results
				if (!storageKey) {
					storageKey  = key;
				}
			if (rs === null) {
				Mojo.Log.info("DEPOT: No hay registros");
				results = [];
			} else {
				Mojo.Log.info("DEPOT GETDATA: Registros de '", key, "' obtenidos");
				results = rs;
			}
			//this.controller.setWidgetModel(this.wordsList, this.currentModel);
			callback(results);

		}.bind(this);
		var onFailure = function(error) {
			Mojo.Log.error("GETTING DATA EMPTY DATA", error);
			var results = [];
			callback(results);
		};

		this.depot.get( key, onSuccess, onFailure);

}
});
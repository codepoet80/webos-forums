var Gallery = Class.create(
{
	initialize: function() {

		//this.parent = parent;
		Mojo.Log.info("Gallery Initialize");


	},
	categories: [],
	get_nested_category: function(callback, callbackError) {
		try {
			var formattedStructure = [];
			var callbackOk = function(response){
				try {
					//Mojo.Log.info("Recibidos foros: ", Object.toJSON(response));
					this.categories.clear();
					this.categories = response.list;
					callback(response)

/*
					//this.forums = response;

					response.list.each(function(item){
						if (!item.child_list) {
							formattedStructure.push(item);

						}
						else {
							item.child_list.each(function(child){
								child.main_category_name = item.category_name;
								formattedStructure.push(child);
							});
						}
					});

					this.categories = formattedStructure;

					//Mojo.Log.info(Object.toJSON(formattedStructure));
					callback(formattedStructure);

*/
				}
				catch (e) {
					Mojo.Log.error("TAPATALK API ERROR: get_nested_category.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
					Mojo.Log.error("TAPATALK API ERROR: get_nested_category.fail - ", err);
					//Mojo.Controller.getAppController().showBanner(err, "", "");
					callbackError(err);
				}
				catch (e) {
					Mojo.Log.error(e);
				}

			};
			var callbackDone = function(){

			};

			callbackOk = callbackOk.bind(this);
			callbackFail = callbackFail.bind(this);
			callbackDone = callbackDone.bind(this);

			xmlrpc_gallery("get_nested_category", [], {
				done: callbackOk,
				error: callbackFail,
				close: callbackDone
			});
		} catch (e) {
			Mojo.Log.error("tapatalk LOGIN ERROR: ", e);
		}
	},
	get_directory: function(page, forum_per_page, category_id, cache, order_by, callback) {
		Mojo.Log.info("Gallery.get_directory()");
		try {
			var callbackOk = function(response){
				try {
					//Mojo.Log.info("Recibidos foros: ", Object.toJSON(response));
					//this.categories.clear();
					//this.categories = response.list;
					callback(response)

/*
					//this.forums = response;

					response.list.each(function(item){
						if (!item.child_list) {
							formattedStructure.push(item);

						}
						else {
							item.child_list.each(function(child){
								child.main_category_name = item.category_name;
								formattedStructure.push(child);
							});
						}
					});

					this.categories = formattedStructure;

					//Mojo.Log.info(Object.toJSON(formattedStructure));
					callback(formattedStructure);

*/
				}
				catch (e) {
					Mojo.Log.error("TAPATALK API ERROR: get_directory.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
					Mojo.Log.error("TAPATALK API ERROR: get_directory.fail - ", err);
					try { var a=null; a=a.length; } catch (gaex) {
					Mojo.Log.error("stack (ignore message): ", gaex.stack);
					}
					Mojo.Controller.getAppController().showBanner(err, "", "");
				}
				catch (e) {
					Mojo.Log.error(e);
				}

			};
			var callbackDone = function(){

			};

			callbackOk = callbackOk.bind(this);
			callbackFail = callbackFail.bind(this);
			callbackDone = callbackDone.bind(this);

			xmlrpc_gallery("get_directory", [page, forum_per_page, category_id, cache, order_by], {
				done: callbackOk,
				error: callbackFail,
				close: callbackDone
			});
		} catch (e) {
			Mojo.Log.error("tapatalk LOGIN ERROR: ", e);
		}
	},

	get_new: function(callback, callbackError) {
		Mojo.Log.info("Gallery.get_new()");
		try {
			var callbackOk = function(response){
				try {
					//Mojo.Log.info("Recibidos foros: ", Object.toJSON(response));
					//this.categories.clear();
					//this.categories = response.list;
					callback(response)

/*
					//this.forums = response;

					response.list.each(function(item){
						if (!item.child_list) {
							formattedStructure.push(item);

						}
						else {
							item.child_list.each(function(child){
								child.main_category_name = item.category_name;
								formattedStructure.push(child);
							});
						}
					});

					this.categories = formattedStructure;

					//Mojo.Log.info(Object.toJSON(formattedStructure));
					callback(formattedStructure);

*/
				}
				catch (e) {
					Mojo.Log.error("TAPATALK API ERROR: get_new.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
					Mojo.Log.error("TAPATALK API ERROR: get_new.fail - ", err);
					try { var a=null; a=a.length; } catch (gaex) {
					Mojo.Log.error("stack (ignore message): ", gaex.stack);
					}

					//Mojo.Controller.getAppController().showBanner(err, "", "");
					callbackError(err);
				}
				catch (e) {
					Mojo.Log.error(e);
				}

			};
			var callbackDone = function(){

			};

			callbackOk = callbackOk.bind(this);
			callbackFail = callbackFail.bind(this);
			callbackDone = callbackDone.bind(this);

			xmlrpc_gallery("get_new", [], {
				done: callbackOk,
				error: callbackFail,
				close: callbackDone
			});
		} catch (e) {
			Mojo.Log.error("tapatalk get_new ERROR: ", e);
		}
	},
	search: function(searchString, callback) {
		Mojo.Log.info("Gallery.search()");
		try {
			var callbackOk = function(response){
				try {
					//Mojo.Log.info("Recibidos foros: ", Object.toJSON(response));
					//this.categories.clear();
					//this.categories = response.list;
					callback(response)

/*
					//this.forums = response;

					response.list.each(function(item){
						if (!item.child_list) {
							formattedStructure.push(item);

						}
						else {
							item.child_list.each(function(child){
								child.main_category_name = item.category_name;
								formattedStructure.push(child);
							});
						}
					});

					this.categories = formattedStructure;

					//Mojo.Log.info(Object.toJSON(formattedStructure));
					callback(formattedStructure);

*/
				}
				catch (e) {
					Mojo.Log.error("TAPATALK API ERROR: search.ok - ", e);
				}
			};
			var callbackFail = function(err){
				try {
					Mojo.Log.error("TAPATALK API ERROR: search.fail - ", err);
					try { var a=null; a=a.length; } catch (gaex) {
					Mojo.Log.error("stack (ignore message): ", gaex.stack);
					}

					Mojo.Controller.getAppController().showBanner(err, "", "");
				}
				catch (e) {
					Mojo.Log.error(e);
				}

			};
			var callbackDone = function(){

			};

			callbackOk = callbackOk.bind(this);
			callbackFail = callbackFail.bind(this);
			callbackDone = callbackDone.bind(this);


			var search_string = new Base64Holder(Base64.encode(searchString));

			xmlrpc_gallery("search", [search_string], {
				done: callbackOk,
				error: callbackFail,
				close: callbackDone
			});
		} catch (e) {
			Mojo.Log.error("tapatalk get_new ERROR: ", e);
		}
	},

});
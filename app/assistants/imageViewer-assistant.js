function ImageViewerAssistant(args) {
	/* this is the creator function for your scene assistant object. It will be passed all the
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
	  Mojo.Log.info("IMAGEVIECWER: ", Object.toJSON(args.currentItem));
	  //{allItems: this.itemsList.items, currentItem: this.currentSelection};
	  this.itemsList = {};
	  this.itemsList.items = args.allItems;
	  Mojo.Log.info(Object.toJSON(this.itemsList.items));
	  this.currentItem = args.currentItem;

	  Mojo.Log.info(Object.toJSON(this.itemsList.items));
	  Mojo.Log.info(Object.toJSON(this.currentItem));
	  	// Used to recognize and record a change in the widgets 'position' in our set of images
		this.curPhotoIndex = this.itemsList.items.indexOf(this.currentItem);
		Mojo.Log.info("Current Photo Index: ", this.curPhotoIndex);
		this.positionDelta = {
			left: -1,
			center: 0,
			right: 1
		};

this.handleUpdate = this.handleViewerUpdate.bindAsEventListener(this);
this.handleResize = this.handleWindowResize.bindAsEventListener(this);
}

ImageViewerAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */

	/* use Mojo.View.render to render view templates and add them to the scene, if needed */

	/* setup widgets here */

	/* add event handlers to listen to events from widgets */

			this.cmdMenuModel = {
				visible: true,
				items: [
//			   {
//					icon: 'attach',
//					command: "goAttach",
//					disabled: false
//				},
			   {
					icon: 'save',
					command: "goSave",
					disabled: false
				},
				{},
				{
					icon: 'delete',
					command: "goDelete",
					disabled: true
				}]
			};

	//this.controller.setupWidget(Mojo.Menu.commandMenu, { spacerHeight: 0, menuClass: "no-fade" }, this.cmdMenuModel);

	this.controller.get("fullscreen_album_name").innerHTML = $L("Post Images");

	Mojo.Log.info("SETUP: ", Object.toJSON(this.itemsList));

		this.flipviewElement = this.controller.get('image_flipview_full');
		this.flipviewElement.style.height =	Mojo.Environment.DeviceInfo.screenHeight + "px";
		this.flipviewElement.style.width =	Mojo.Environment.DeviceInfo.screenWidth + "px";
		this.extractfsParams = "720:720:3";
		this.lowResExtractfsParams = "80:80:3";

		// These numbers are the max numbers for tv res images.
		// No sense in scaling up twice.
		this.controller.setupWidget(this.flipviewElement.id, {
			extractfsParams: this.extractfsParams,
			lowResExtractFSParams: this.lowResExtractfsParams,
			highResolutionTimeout: 0.0,
			allowExperimentalSwitch: true
		}, {
			background: "black",
			onLeftFunction:
				this.goLeft.bind(this),
			onRightFunction:
				this.goRight.bind(this)
		});
		this.controller.listen(this.controller.get(this.flipviewElement),Mojo.Event.imageViewChanged, this.handleUpdate);
};

ImageViewerAssistant.prototype.aboutToActivate = function() {
	if (this.controller.stageController.setWindowOrientation) {
		this.controller.stageController.setWindowOrientation("free");
		this.orientateControls(
			Mojo.Controller.getAppController(
				).getScreenOrientation());
	}

};

ImageViewerAssistant.prototype.orientateControls = function(dir) {
		if (this.orientation == dir) {
			Mojo.Log.info("Same dir, ignoring orientation.");
			return;
		}

		this.orientation = dir;
		this.controller.stageController.setWindowOrientation(dir);
	};

ImageViewerAssistant.prototype.orientationChanged = function(dir) {
		Mojo.Log.info("Changing orientation.", dir);

		if (!this.isActive) {
			Mojo.Log.info("Not active, ignoring orientation.");
			return;
		}

		this.orientateControls(dir);
	};

ImageViewerAssistant.prototype.handleWindowResize = function(event) {
		Mojo.Log.info("Window resize!",
					this.controller.window.innerWidth,
					this.controller.window.innerHeight);
		if (this.flipviewElement && this.flipviewElement.mojo) {
			this.flipviewElement.mojo.manualSize(
					this.controller.window.innerWidth,
					this.controller.window.innerHeight);
		}
/*
		this.controller.get('spinner').style.marginTop =
				(this.controller.window.innerHeight / 2) + "px";

*/
};

ImageViewerAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	this.controller.enableFullScreenMode(true);
		this.flipviewElement.mojo.centerUrlProvided(this.getUrlForThe('center'));
		this.flipviewElement.mojo.leftUrlProvided(this.getUrlForThe('left'));
		this.flipviewElement.mojo.rightUrlProvided(this.getUrlForThe('right'));
		this.isActive = true;
		Mojo.Event.listen(this.controller.window, 'resize', this.handleResize);

};

ImageViewerAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
	  this.isActive = false;
};

ImageViewerAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as
	   a result of being popped off the scene stack */
	Mojo.Event.stopListening(this.controller.window, 'resize', this.handleResize);
	if (this.controller.stageController.setWindowOrientation) {
		this.controller.stageController.setWindowOrientation("up");
	}

};

ImageViewerAssistant.prototype.handleCommand = function(event) {

		if(event.type == Mojo.Event.commandEnable && (event.command == Mojo.Menu.helpCmd || event.command == Mojo.Menu.prefsCmd)) {
			event.stopPropagation();
		}

		try {

			if (event.type == Mojo.Event.command) {
				switch (event.command) {
					case 'goAttach':
						var args = {newImage: this.currentItem};
						this.controller.stageController.pushScene("attachToAddresses", args);
						break;
					case 'goSave':
						Mojo.Log.info("Attempting to save " + this.getUrlForThe('center'));
						Mojo.Log.info("sending cookieHeader: " + JSON.stringify(appSettings.Tapatalk.headers));
						this.controller.serviceRequest('palm://com.palm.downloadmanager/', {
							method: 'download',
							parameters: {
								target: this.getUrlForThe('center'),
								//mime: "image/jpg",
								targetDir: "/media/internal/downloads/",
								//targetFilename: "image.jpg",
								keepFilenameOnRedirect: false,
								cookieHeader: appSettings.Tapatalk.headers,
								subscribe: true
							},
							onSuccess: function(response){
								if (response.completed) {
								Mojo.Log.info("DOWNLOAD MANAGER target onSuccess: ", JSON.stringify(response));
//									var callParams = {
//										id: Mojo.Controller.appInfo.id,
//										'icon': response.target, //Mojo.appPath + 'images/bundledforums/default.png',
//										'title': title,
//										'params': appParams
//									};
//									that.controller.serviceRequest('palm://com.palm.applicationManager/addLaunchPoint', {
//										parameters: callParams,
//										onSuccess: function(result){
//											Mojo.Controller.getAppController().showBanner($L("Shortcut created successfully"), "", "");
//										},
//										onFailure: function(failure){
//										}
//									});
								}
								else {
									Mojo.Log.info("DOWNLOAD MANAGER target onSuccess, not complete yet: ", JSON.stringify(response));
								}
							},
							onFailure: function(e){
								Mojo.Log.info("Download failed: ", Object.toJSON(e));
							}
						});
						break;
					case 'goDelete':
					Mojo.Log.info("Image Deletion Chosen");
						var messageText = $L("Delete Image?");

						this.controller.showAlertDialog({
							title: $L("Dial Confirmation"),
							message: messageText,
							choices: [{
								label: $L('Delete'),
								value: "ok",
								type: 'negative'
							}, {
								label: $L('Cancel'),
								value: "cancel"
							}],
							onChoose: this.confirmDeletionChoose.bind(this)
						});
						break;
				}
			} else if(event.type === Mojo.Event.back) {
				event.stop();
				this.controller.stageController.popScene({resetScroll: false});
			}
		}
		catch (e) {

		}
};

ImageViewerAssistant.prototype.goLeft = function() {
		this.movePhotoIndex('left');
		this.flipviewElement.mojo.leftUrlProvided(this.getUrlForThe('left'));

};
ImageViewerAssistant.prototype.goRight = function() {
		this.movePhotoIndex('right');
		this.flipviewElement.mojo.rightUrlProvided(this.getUrlForThe('right'));

};

ImageViewerAssistant.prototype.movePhotoIndex = function( direction ){
		this.curPhotoIndex = this.curPhotoIndex + this.positionDelta[direction];

		Mojo.Log.info("Nuevo INDEX", this.curPhotoIndex);

		//	Wrap around edges
		if(this.curPhotoIndex > this.itemsList.items.length-1 || this.itemsList.items < 1) {
			this.curPhotoIndex = this.wrapAroundMarioStyle( this.curPhotoIndex, this.itemsList.items.length );
		}

		//this.captionDiv.innerHTML = this.captions[this.curPhotoIndex] || "";

	};
ImageViewerAssistant.prototype.getUrlForThe = function( position ){
		var urlIndex;
		urlIndex = this.curPhotoIndex + this.positionDelta[position];
		//var currentPhoto = urlIndex + 1;

		Mojo.Log.info("GETURLFORTHE: Nuevo indice:", urlIndex);
		//	reach around edges
		if (urlIndex > this.itemsList.items.length - 1 || urlIndex < 0) {
		//urlIndex = this.wrapAroundMarioStyle( urlIndex, this.itemsList.items.length );
		}
		else {

			var bigPicture = this.itemsList.items[urlIndex].url; // + "?size=512";
			Mojo.Log.info("BIGPICTURE: ", bigPicture);
			return bigPicture;
		}
	};
ImageViewerAssistant.prototype.wrapAroundMarioStyle = function( index, max ){
		return Math.abs( Math.abs( index ) - max );
	};

ImageViewerAssistant.prototype.handleViewerUpdate =function (event) {
	var urlData = event.url;
	Mojo.Log.info("EVENTO CHANGE ", Object.toJSON(event));

	var currentItem;
	this.itemsList.items.each(function(item) {
		if ((item.url) == urlData) {
			currentItem = item;
		}
	});

	this.currentItem = currentItem;
	var currentItemIndex = this.itemsList.items.indexOf(currentItem);
	var currentItemPosition = currentItemIndex + 1;
	var imagesCount = this.itemsList.items.length;

	this.controller.get("album_count").innerHTML = currentItemPosition + "/" + imagesCount;

};

ImageViewerAssistant.prototype.confirmDeletionChoose = function(value){

	if (value == "ok") {

		gravatar.deleteUserImage(this.currentItem.key, this.imageDeleted.bind(this));

	}

};

ImageViewerAssistant.prototype.imageDeleted = function(response){

	try {
		Mojo.Log.info("IMAGE CHANGED!!!");
		//				Mojo.Controller.getAppController().showBanner($L(" Gravatar updated"), "", "");
		//				this.controller.stageController.popScene(this.currentItem);
		//var currentItemIndex = this.itemsList.items.indexOf(this.currentItem);
		this.itemsList.items.splice(this.itemsList.items.indexOf(this.currentItem), 1);
		//currentItemIndex = currentItemIndex;


		if (this.curPhotoIndex > this.itemsList.items.length - 1 || this.curPhotoIndex == 0) {
			if (this.curPhotoIndex > this.itemsList.items.length - 1) {
				this.curPhotoIndex = this.itemsList.items.length - 1;
			}
			this.currentItem = this.itemsList.items[this.curPhotoIndex];

		}
		else {
			Mojo.Log.info("DENTRO DEL RANGO");
			this.curPhotoIndex = this.curPhotoIndex - 1;
			this.currentItem = this.itemsList.items[this.curPhotoIndex];
		}
		Mojo.Log.info(this.itemsList.items.length);

		this.flipviewElement.mojo.centerUrlProvided(this.getUrlForThe('center'));
		this.flipviewElement.mojo.leftUrlProvided(this.getUrlForThe('left'));
		this.flipviewElement.mojo.rightUrlProvided(this.getUrlForThe('right'));


	}
	catch (e) {
		Mojo.Log.error("login OK: ", e);
	}


};

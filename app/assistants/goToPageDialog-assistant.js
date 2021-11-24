function GoToPageDialogAssistant(sceneAssistant,callbackFunc, arguments) {
	this.callbackFunc = callbackFunc;
	this.sceneAssistant = sceneAssistant;
	this.controller = sceneAssistant.controller;
	//Mojo.Log.info(Object.toJSON(arguments));
	this.minValue = arguments.minValue;
	this.maxValue = arguments.maxValue;
	this.currentValue = arguments.currentValue;
	
	this.goToPageHandler = this.goToPage.bindAsEventListener(this);
  	//this.goCancel = this.cancel.bindAsEventListener(this);

	
};

GoToPageDialogAssistant.prototype.setup = function(widget) {
	this.widget = widget;
	/* this function is for setup tasks that have to happen when the scene is first created */		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed. */	
	/* setup widgets here */	
	/* add event handlers to listen to events from widgets */
	this.pickerModel = {value:this.currentValue};
	this.controller.setupWidget('pagePicker', {label: 'Page Number', modelProperty:'value', min: this.minValue, max: this.maxValue}, this.pickerModel);

	this.gotoPageButtonModel = {buttonClass:'affirmative', buttonLabel:$L('Go'), disabled:false};
	this.gotoPageButton = this.controller.get('gotoPage');
	this.controller.setupWidget('gotoPage', {}, this.gotoPageButtonModel);

	/*this.cancelButtonModel = {buttonClass:'primary', buttonLabel:$L('Cancel'), disabled:false};
	this.cancelButton = this.controller.get('cancel');
	this.controller.setupWidget('cancel', {}, this.cancelButtonModel);*/

	Mojo.Event.listen(this.controller.get('gotoPage'),Mojo.Event.tap,this.goToPageHandler);
	//Mojo.Event.listen(this.controller.get('cancel'),Mojo.Event.tap,this.goToCancel);

};

GoToPageDialogAssistant.prototype.cancel = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  
	  this.widget.mojo.close();
};

GoToPageDialogAssistant.prototype.goToPage = function (event) {

	this.callbackFunc(this.pickerModel.value);
	this.widget.mojo.close();	

};

GoToPageDialogAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
	  //this.controller.get('pagePicker').mojo.focus();

};

GoToPageDialogAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

GoToPageDialogAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};

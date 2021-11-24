var Formatting = Class.create({

formatForumImage: function(value, model) {
	var composedImage;

	if (value) {
		composedImage = value;
		//TODO: check debug setting
		if (value.length > 0) {
			Mojo.Log.info("formatForumImage(), value:" + value);
		}
	} else {
		composedImage = 'images/default-forum-blue.png';
	}
	return composedImage;
},

formatCanReply: function(value, model) {
	//Mojo.Log.info(value)
	if(value == true) {
		 return "momentary";
	} else {
		return "none";
	}
},

formatIsOnline: function(value, model) {
	var returnText = "";
	if (value) {
		returnText = "connected";
	} else {
		returnText = "";
	}
	return returnText;
},


formatTopicImage: function(value, model) {
//	Mojo.Log.info("formatTopicImage: " + value);
	if(!value) {
		//model.show_user_image = "hidden";
		model.icon_url = "images/list-avatar-default.png";
		value = model.icon_url;
	}
	else if (value.indexOf("http") != 0) {
		if (value.indexOf("//") != 0) {
			value = "http://" + value;
		} else {
			value = "http:" + value;
		}
		model.icon_url = value;
	}
	var composedImage = "<img src='" + value + "'/>";
//	Mojo.Log.info("formatTopicImage, returning: " + composedImage);
	return composedImage;
	//return value;
},

formatTopicTitle: function(value, model) {

	//this only escapes topic titles.
	return escape(value);
},

getNiceDate: function(value, model){
	if (false && appSettings.debug.dumpPosts && appSettings.debug.detailedLogging) {
		Mojo.Log.warn("getNiceDate called with value: " + value);
		//model is the whole object the value is attached to -- the list item generally.
		//Mojo.Log.info("getNiceDate, model: " + JSON.stringify(model));
	}
	var d = new Date();
	if (value !== undefined) {
		d.setTime(value);
	}
	else {
		//mw I think I added this as defensive code while debugging recent post problem.
		//Mojo.Log.warn("getNiceDate - date was undefined.. using current date.");
	}

	var getLocalDate = function (originalDate){

		var offSet = d.getTimezoneOffset();

		offSet = offSet*60000;
		var cleanDate = new Date();
		cleanDate.setTime(originalDate.getTime()+offSet);

		return cleanDate;
	};

	d = getLocalDate(d);

	model.niceDate = BucketDateFormatter.getDateBucket(d, false, false);

	var midnight = new Date();
	midnight.setHours(0,0,0,1);

//Mojo.Log.warn("getNiceDate - ORIGINAL: ",d);
	if (d > midnight) {
		model.dividerStyle = "display:none;"
		//Mojo.Log.warn("getNiceDate - formatted: " + Mojo.Format.formatDate(d, {time:'short'}));
		return Mojo.Format.formatDate(d, {time:'short'});
	} else {
		//Mojo.Log.warn("getNiceDate - formatted: " + Mojo.Format.formatDate(d, {time:'short'}));
		return Mojo.Format.formatDate(d, {date:'short'});
	}

},

formatPostContent: function(value, model) {
	if (appSettings.Tapatalk.config.disable_html) {
		model.textFormat = "";
	} else {
		model.textFormat = "html";
	}
	if (!!value) {
		try {

		var emotifiedText = appSettings.Formatting.getEmoticons(value);
		//var emotifiedText = Mojo.Format.runTextIndexer(value);
		//var listedText = emotificedText; //appSettings.Formatting.getLists(emotifiedText);

		var myHTML = myParser.toHTML(emotifiedText);
		//myHTML = appSettings.Formatting.getEmoticons(myHTML);
		return myHTML;
		} catch(e) {
			Mojo.Log.error("ERROR PARSING BBCODE", e);
			return value;
		}
	}
},
formatIfNewPosts: function(value, model) {
	if (!!value) {
		var strStyle = "";
		if (value) {
			strStyle = "hasNewPosts";
			return strStyle
		} else {
			strStyle = "";
			return strStyle

		}

	}
},

formatIfUrlPlaceholder: function(value, model) {
	if (!value) {
		return "hidden";
	}
	else {
		return "";
	}
},

formatForumSubscribed: function(value, model) {

	if(!value) {
		value = "hidden";
	} else {
		value = "";
	}

	if (!model.is_closed) {
		model.is_closed = false;
	}
	return value;
},
formatForumClosed: function(value, model) {
	if(!value) {
		value = "hidden";
	} else {
		value = "";
	}
	return value;
},

/**
 * Formatting message status
 */

formatMessageStatus: function(value, model) {
	var returnValue = "";

	if (value == 1) {
		returnValue = "<img src='images/list-unread.png' width='18' height='18' style='position:absolute;top:28px;left:5px;'/>";
		model.read = "unread";
	}
	else
		if (value == 2) {
			returnValue = "";
		}
		else
			if (value == 3) {
				returnValue = "<img src='images/list-reply.png' width='18' height='18' style='position:absolute;top:28px;left:5px;'/>";
			}
			else
				if (value == 4) {
					returnValue = "<img src='images/list-forward.png' width='18' height='18' style='position:absolute;top:28px;left:5px;'/>";
				}
	return returnValue;
},
formatMessageDate: function(value, model) {

	var d = new Date();
	d.setTime(value);

	var getLocalDate = function (originalDate){

		var offSet = d.getTimezoneOffset();

		offSet = offSet*60000;
		var cleanDate = new Date();
		cleanDate.setTime(originalDate.getTime()+offSet);

		return cleanDate;
	};

	d = getLocalDate(d);

	model.niceDate = BucketDateFormatter.getDateBucket(d, false, false);

	var midnight = new Date();
	midnight.setHours(0,0,0,1);

	//Mojo.Log.warn("ORIGINAL: ",d);
	if (d > midnight) {
		//Mojo.Log.warn(Mojo.Format.formatDate(d, {time:'short'}));
		return Mojo.Format.formatDate(d, {time:'short'});

	} else {
		//Mojo.Log.warn(Mojo.Format.formatDate(d, {time:'short'}));
		return Mojo.Format.formatDate(d, {date:'short'});
	}
},

formatMessageRecipients: function (value, model) {
	var formattedNames = "";
	if (value) {
		for (var i = 0; i < value.length; i++) {
			if (formattedNames) {
				formattedNames = formattedNames + ";";
			}
			if (value[i].display_name) {
				formattedNames = formattedNames + value[i].display_name;
			}
			else {
				formattedNames = formattedNames + value[i].username;
			}
		}
		return formattedNames;
	} else {
		return value;
	}
},

chooseThumbnailOrUrl: function(value, model) {
	if (value == "") {
		//Mojo.Log.info("chooseThumbnailOrUrl returning " + model.url);
		//Full size image URL
		//return model.url;
		//Nice blue paperclip
		//return "http://b.dryicons.com/images/icon_sets/coquette_part_2_icons_set/png/64x64/attachment.png";
		//Attempt to use cmd menu attach icon
		//return Mojo.appPath + "./images/attach-64.png";
		return Mojo.Config.IMAGES_HOME + "/menu-icon-attach.png";
		//return Mojo.Config.IMAGES_HOME + "/corrupt-image.png";
		//return Mojo.Config.IMAGES_HOME + "/details-image-generic.png";

	} else {
		//Mojo.Log.info("chooseThumbnailOrUrl returning " + value);
		return value;
	}
},

getEmoticons: function(text) {

/*

 text = text.replace(/(\W|^):confused:/g,'<img src="images/emoticons/emoticon-confused.png" />');
text = text.replace(/(\W|^):laugh:/gi,'<img src="images/emoticons/emoticon-laugh.png"/>');
text = text.replace(/(\W|^):lol:/gi,'<img src="images/emoticons/emoticon-laugh.png"/>');
text = text.replace(/(\W|^):neutral:/gi,'<img src="images/emoticons/emoticon-neutral.png"/>');
text = text.replace(/(\W|^):meh:/gi,'<img src="images/emoticons/emoticon-neutral.png"/>');
text = text.replace(/(\W|^):sick:/gi,'<img src="images/emoticons/emoticon-sick.png"/>');
text = text.replace(/(\W|^):smile:/gi,'<img src="images/emoticons/emoticon-smile.png"/>');
text = text.replace(/(\W|^):doh:/gi,'<img src="images/emoticons/emoticon-undecided.png"/>');
text = text.replace(/(\W|^):wink:/gi,'<img src="images/emoticons/emoticon-wink.png"/>');
text = text.replace(/(\W|^):yuck:/gi,'<img src="images/emoticons/emoticon-yuck.png"/>');
text = text.replace(/(\W|^):razz:/gi,'<img src="images/emoticons/emoticon-yuck.png"/>');
text = text.replace(/(\W|^):angry:/gi,'<img src="images/emoticons/emoticon-angry.png"/>');
text = text.replace(/(\W|^):mad:/gi,'<img src="images/emoticons/emoticon-angry.png"/>');
text = text.replace(/(\W|^):heart:/gi,'<img src="images/emoticons/emoticon-heart.png"/>');
text = text.replace(/(\W|^):evil:/gi,'<img src="images/emoticons/emoticon-naughty.png"/>');
text = text.replace(/(\W|^):twisted:/gi,'<img src="images/emoticons/emoticon-naughty.png"/>');
*/

//	:thumbsup
text = text.replace(/(\W|^):thumbsup:/gi,'<img src="images/emoticons/emoticon-thumbsup.png"/>');

//	:thumbsdown
text = text.replace(/(\W|^)(:thumbsdown:|:thumbsdwn:)/gi,'<img src="images/emoticons/emoticon-thumbsdown.png"/>');
//text = text.replace(/(\W|^):thumbsdwn:/gi,'<img src="images/emoticons/emoticon-thumbsdown.png"/>');

//	:censored
text = text.replace(/(\W|^):censored:/gi,'<img src="images/emoticons/emoticon-censored.png"/>');

//o_O :confused
text = text.replace(/(\W|^)o_O/g,'<img src="images/emoticons/emoticon-confused.png" />');
text = text.replace(/(\W|^):confused:/gi,'<img src="images/emoticons/emoticon-confused.png" />');

// :Shake
text = text.replace(/(\W|^):shake:/gi,'<img src="images/emoticons/shake.gif"/>');
text = text.replace(/(\W|^):rolleyes:/gi,'<img src="images/emoticons/rolleyes.gif"/>');
text = text.replace(/(\W|^):brick:/gi,'<img src="images/emoticons/brick.gif"/>');

//8) 8-) B) B-) :cool
text = text.replace(/(\W|^)(8\)|8-\)|B\)|B-\)|:cool:)/g,'<img src="images/emoticons/emoticon-cool.png" />');

//	:’( =’( :cry
text = text.replace(/(\W|^)(:´\(|\=´\(|:'\(|\='\(|:cry:)/g,'<img src="images/emoticons/emoticon-cry.png" />');

// :{ :-[ =[ =-[ :redface
text = text.replace(/(\W|^)(:\{|:-\[|\=\[|\=-\[|:redface:)/g,'<img src="images/emoticons/emoticon-embarrassed.png" />');

//	:S :-S :s :-s %-( %( X-( X( :eww :gross
text = text.replace(/(\W|^)(:S\W|:-S|:eww:|:gross:)/gi,'<img src="images/emoticons/emoticon-eww.png"/>');
text = text.replace(/(\W|^)(\%-\(|\%\(|X-\(|X\()/g,'<img src="images/emoticons/emoticon-eww.png"/>');

//	:! :_! :eek
text = text.replace(/(\W|^)(:\!|:\_\!|:eek:)/gi,'<img src="images/emoticons/emoticon-footinmouth.png"/>');

//	:( :-( =( =-( :sad
text = text.replace(/(\W|^)(:\(|:-\(|\=\(|\=-\(|:sad:)/gi,'<img src="images/emoticons/emoticon-frown.png"/>');

//	:O :-O :o :-o =O =-O =o =-o :surprised :shock :omg
text = text.replace(/(\W|^)(:O\W|:-O|\=O|\=-O|:surprised:|:shock:|:omg:)/gi,'<img src="images/emoticons/emoticon-gasp.png"/>');

//	^^ ^_^ ^-^ :grin :biggrin
text = text.replace(/(\W|^)(\^\^|\^\-\^|\^\_\^|:grin:|:biggrin:)/gi,'<img src="images/emoticons/emoticon-grin.png"/>');

//	O:) O:-) o:) o:-) :innocent :angel
text = text.replace(/(\W|^)(o:\)|o:-\)|:innocent:|:angel:)/gi,'<img src="images/emoticons/emoticon-innocent.png"/>');

//	:-* :* =* =-* :kiss
text = text.replace(/(\W|^)(:-\*|:\*|\=\*|\=-\*|:kiss:)/gi,'<img src="images/emoticons/emoticon-kiss.png"/>');

//	:-D :D =D =-D :laugh :lol
text = text.replace(/(\W|^)(:-D|:D|=-D|=D|:laugh:|:lol:)/g,'<img src="images/emoticons/emoticon-laugh.png"/>');

//	:| :-| :neutral :meh
text = text.replace(/(\W|^)(:\||:-\||:neutral:|:meh:)/gi,'<img src="images/emoticons/emoticon-neutral.png"/>');

//	:-& :& =& =-& :-@ :@ =@ =-@ :sick
text = text.replace(/(\W|^)(:-&\W|:&\W|\=-&\W|\=&\W|:-&amp;|:&amp;|\=-&amp;|\=&amp;|:-\@|:\@|\=-\@|\=\@|:sick:)/gi,'<img src="images/emoticons/emoticon-sick.png"/>');

//	:) :-) =) =-) :smile
text = text.replace(/(\W|^)(:\)|:-\)|=\)|=-\)|:smile:)/gi,' <img src="images/emoticons/emoticon-smile.png"/>');

//	:/ :-/ :\ :-\ =/ =-/ =\ =-\ :doh
text = text.replace(/(\W|^)(:\/|:-\/|:\\|:-\\|\=\/|\=-\/|\=\\|\=-\\|:doh:)/g,'<img src="images/emoticons/emoticon-undecided.png"/>');

//	;) ;-) :wink
text = text.replace(/(\W|^)(;\)|;-\)|:wink:)/gi,'<img src="images/emoticons/emoticon-wink.png"/>');

//	:P :-P :p :-p :b :-b =p =P =b =-b =-p =-P :yuck :razz
text = text.replace(/(\W|^)(:p|:-p|\=p|=-p|:yuck:|:razz:)/gi,'<img src="images/emoticons/emoticon-yuck.png"/>');
text = text.replace(/(\W|^)(:b|:-b|\=-b|\=b)/g,'<img src="images/emoticons/emoticon-yuck.png"/>');

//	>:o >:-o >:O >:-O >:( >:-( :angry :mad
text = text.replace(/(\W|^)(>:-o|>:o|>:-\(|>:\(|:angry:|:mad:)/gi,'<img src="images/emoticons/emoticon-angry.png"/>');

//	<3 :heart
text = text.replace(/(\W|^)(<3|:heart:)/gi,'<img src="images/emoticons/emoticon-heart.png"/>');

//	>:-) >:) >:-> >:> :evil :twisted
text = text.replace(/(\W|^)(>:-\)|>:\)|>:->|>:>|:evil:|:twisted:)/gi,'<img src="images/emoticons/emoticon-naughty.png"/>');

/**
 * REEMPLAZAMOS COMIENZO DE POSTS
 */

return text;


}


});

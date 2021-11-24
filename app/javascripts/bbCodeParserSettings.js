
myParser = new BBCode({tagsSingle:["[","*"]});

                        myParser.addRule({
                            appliesToHTML:function(el){return (el.tagName.toLowerCase() == "a" && typeof el.href !== "undefined");},
                            toBBStart:function(el){
                                    return "[url="+ (el.href.indexOf(" ")>=0?"\""+el.href+"\"":el.href) +"]";
                             },toBBEnd:function(el){
                                     return "[/url]";
                        },
                        appliesToBB:function(el){return el.data.tag.toLowerCase() == "url"},
                        toHTMLStart:function(el){
							try {
								var linkUrl = "";
								if (el.data.params[el.data.tag] == el.data.tag) {
									linkUrl = el.children[0];
									//Mojo.Log.info(Object.toJSON(el.children[0]));
									//return '<a name="link" href="' + el.children[0] + '" onclick="return false;" x-mojo-touch-feedback="momentary">'
								}
								else {
									linkUrl = el.data.params[el.data.tag];
									//Mojo.Log.info(Object.toJSON(el.data.params[el.data.tag]));
								}
//								Mojo.Log.info("linkUrl step1: " + linkUrl);
								if(linkUrl.startsWith("&quot;")) {
									linkUrl = linkUrl.substring(6, linkUrl.length);
//									Mojo.Log.info("linkUrl step2: " + linkUrl);
									if (linkUrl.endsWith("&quot;")) {
										linkUrl = linkUrl.substring(0, linkUrl.length-6);
									}
								}
//								Mojo.Log.info("linkUrl done: " + linkUrl);
								return '<a name="link" href="' + linkUrl + '" onclick="return false;" x-mojo-touch-feedback="momentary">'
							} catch (e) {
								Mojo.Log.error("Error parsing link");
							}
								},
                        toHTMLEnd:'</a>'
                        });



                        myParser.addRule({
                            appliesToHTML:function(el){return el.tagName.toLowerCase() == "b";},
                            toBBStart:"[b]",toBBEnd:"[/b]",
                            appliesToBB:function(el){return el.data.tag.toLowerCase() == "b" ;},
                            toHTMLStart:function(el){
                                return '<span style="font-weight: bold;">'},
                            toHTMLEnd:'</span>'
                        });
 			myParser.addRule({
                            appliesToHTML:function(el){return el.tagName.toLowerCase() == "u" ;},
                            toBBStart:"[u]",
                            toBBEnd:"[/u]",
                            appliesToBB:function(el){return el.data.tag.toLowerCase() =="u";},
                            toHTMLStart:"<u>",
                            toHTMLEnd:'</u>'

                    });
 			myParser.addRule({
                            appliesToHTML:function(el){return el.tagName.toLowerCase() == "img" ;},
                            toBBContent:function(el){return "[img="+el.src+"]"},
                            appliesToBB:function(el){
								/*if(el.data.tag.toLowerCase()=="img") {Mojo.Log.info("VALIDO");}*/
								return el.data.tag.toLowerCase()=="img";},
                            toHTMLContent: function(el){
							
								try {
									var imageSrc = el.children[0];
									//Mojo.Log.info(imageSrc);
									var htmlCode = "<img name='image' src='" + imageSrc + "' class='post-image' onerror='this.className=\"hidden\"' x-mojo-touch-feedback='momentary' /><div class='clear'></div>";//src=\"images/no-image.png\"' >";
									return htmlCode;
								
								} 
								catch (e) {
									Mojo.Log.error("Error parsing image");
								}
							}
                    });
 			myParser.addRule({
                            appliesToHTML:function(el){return el.tagName.toLowerCase() == "quote" ;},
                            toBBStart:"[quote]",
                            toBBEnd:"[/quote]",
                            appliesToBB:function(el){return el.data.tag.toLowerCase() =="quote";},
                            toHTMLStart: function(el){
								return "<div class='quote-box'><p class='quote-title'>" + $L('Quote') + ":</p>";
							},
                            toHTMLEnd: '</div>'
                    });
 			myParser.addRule({
                            appliesToHTML:function(el){return el.tagName.toLowerCase() == "*" ;},
                            toBBContent:"[*]",
                            appliesToBB:function(el){return el.data.tag.toLowerCase() =="*";},
                            toHTMLContent:"<p class='bullet-list'>&bull; "

                    });



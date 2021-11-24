/*
BB to HTML parser class 

 Copyright (c) 2010 Björn Bösel

 Permission is hereby granted, free of charge, to any person
 obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without
 restriction, including without limitation the rights to use,
 copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following
 conditions:

 The above copyright notice and this permission notice shall be
 included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 OTHER DEALINGS IN THE SOFTWARE.

*/
BBCodeUtils = {
lamda: function(args){return args;},
filterArray:function (arr,callback,scope) {
if (typeof scope == "undefined") scope = this;
	var newArr = [];
	for (var i = 0;i < arr.length;++i) {
		if (callback.call(scope,arr[i])) newArr.push(arr[i]);
	}
	return newArr;
},
itemEquals:function(a,b){
    return BBCodeUtils.JSONstring.make(a) == BBCodeUtils.JSONstring.make(b);
    
},/*
JSONstring v 1.01
copyright 2006 Thomas Frank
(small sanitizer added to the toObject-method, May 2008)

This EULA grants you the following rights:

Installation and Use. You may install and use an unlimited number of copies of the SOFTWARE PRODUCT.

Reproduction and Distribution. You may reproduce and distribute an unlimited number of copies of the SOFTWARE PRODUCT either in whole or in part; each copy should include all copyright and trademark notices, and shall be accompanied by a copy of this EULA. Copies of the SOFTWARE PRODUCT may be distributed as a standalone product or included with your own product.

Commercial Use. You may sell for profit and freely distribute scripts and/or compiled scripts that were created with the SOFTWARE PRODUCT.

Based on Steve Yen's implementation:
http://trimpath.com/project/wiki/JsonLibrary

Sanitizer regExp:
Andrea Giammarchi 2007

*/

JSONstring:{
	compactOutput:false,
	includeProtos:false,
	includeFunctions: false,
	detectCirculars:true,
	restoreCirculars:true,
	make:function(arg,restore) {
		this.restore=restore;
		this.mem=[];this.pathMem=[];
		return this.toJsonStringArray(arg).join('');
	},
	toObject:function(x){
		if(!this.cleaner){
			try{this.cleaner=new RegExp('^("(\\\\.|[^"\\\\\\n\\r])*?"|[,:{}\\[\\]0-9.\\-+Eaeflnr-u \\n\\r\\t])+?$')}
			catch(a){this.cleaner=/^(true|false|null|\[.*\]|\{.*\}|".*"|\d+|\d+\.\d+)$/}
		};
		if(!this.cleaner.test(x)){return {}};
		eval("this.myObj="+x);
		if(!this.restoreCirculars || !alert){return this.myObj};
		if(this.includeFunctions){
			var x=this.myObj;
			for(var i in x){if(typeof x[i]=="string" && !x[i].indexOf("JSONincludedFunc:")){
				x[i]=x[i].substring(17);
				eval("x[i]="+x[i])
			}}
		};
		this.restoreCode=[];
		this.make(this.myObj,true);
		var r=this.restoreCode.join(";")+";";
		eval('r=r.replace(/\\W([0-9]{1,})(\\W)/gi,"[$1]$2").replace(/\\.\\;/gi,";")');
		eval(r);
		return this.myObj
	},
	toJsonStringArray:function(arg, out) {
		if(!out){this.path=[]};
		out = out || [];
		var u; // undefined
		switch (typeof arg) {
		case 'object':
			this.lastObj=arg;
			if(this.detectCirculars){
				var m=this.mem; var n=this.pathMem;
				for(var i=0;i<m.length;i++){
					if(arg===m[i]){
						out.push('"JSONcircRef:'+n[i]+'"');return out
					}
				};
				m.push(arg); n.push(this.path.join("."));
			};
			if (arg) {
				if (arg.constructor == Array) {
					out.push('[');
					for (var i = 0; i < arg.length; ++i) {
						this.path.push(i);
						if (i > 0)
							out.push(',\n');
						this.toJsonStringArray(arg[i], out);
						this.path.pop();
					}
					out.push(']');
					return out;
				} else if (typeof arg.toString != 'undefined') {
					out.push('{');
					var first = true;
					for (var i in arg) {
						if(!this.includeProtos && arg[i]===arg.constructor.prototype[i]){continue};
						this.path.push(i);
						var curr = out.length;
						if (!first)
							out.push(this.compactOutput?',':',\n');
						this.toJsonStringArray(i, out);
						out.push(':');
						this.toJsonStringArray(arg[i], out);
						if (out[out.length - 1] == u)
							out.splice(curr, out.length - curr);
						else
							first = false;
						this.path.pop();
					}
					out.push('}');
					return out;
				}
				return out;
			}
			out.push('null');
			return out;
		case 'unknown':
		case 'undefined':
			Mojo.Log.info("Unknown or undefined");
		case 'function':
			if(!this.includeFunctions){out.push(u);return out};
			arg="JSONincludedFunc:"+arg;
			out.push('"');
			var a=['\n','\\n','\r','\\r','"','\\"'];
			arg+=""; for(var i=0;i<6;i+=2){arg=arg.split(a[i]).join(a[i+1])};
			out.push(arg);
			out.push('"');
			return out;
		case 'string':
			if(this.restore && arg.indexOf("JSONcircRef:")==0){
				this.restoreCode.push('this.myObj.'+this.path.join(".")+"="+arg.split("JSONcircRef:").join("this.myObj."));
			};
			out.push('"');
			var a=['\n','\\n','\r','\\r','"','\\"'];
			arg+=""; for(var i=0;i<6;i+=2){arg=arg.split(a[i]).join(a[i+1])};
			out.push(arg);
			out.push('"');
			return out;
		default:
			out.push(String(arg));
			return out;
		}
	}
},
isInArray:function(arr,token) {
	for (var i = 0;i < arr.length;++i) {
	if (BBCodeUtils.itemEquals(arr[i],token)) return true;
}
return false;
},
includeIntoArray: function (arr,item) {
	if (!this.isInArray(arr,item)) arr.push(item);
	return arr;
},
/*
type function from mootools

copyright: Copyright (c) 2006-2008 [Valerio Proietti](http://mad4milk.net/).
*/
type: function (obj){
	if (obj == undefined) return false;
	if (obj.nodeName){
		switch (obj.nodeType){
			case 1: return 'element';
			case 3: return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';
		}
	} else if (typeof obj.length == 'number'){
		if (obj.callee) return 'arguments';
		else if (obj.item) return 'collection';
	}
	return typeof obj;
}
}

BBCodeConvertRule = function (options) {
this.options = {
        "appliesToBB":function(){return false;},
        "toBBStart":BBCodeUtils.lambda,
        "toBBEnd":BBCodeUtils.lambda,
        "toBBContent":BBCodeUtils.lambda,
        "appliesToHTML":function(){return false;},
        "toHTMLStart":BBCodeUtils.lambda,
        "toHTMLEnd":BBCodeUtils.lambda,
        "toHTMLContent":BBCodeUtils.lambda
    };

	for (var key in options) {
		this.options[key] = options[key];
	}
}

BBCodeConvertRule.prototype = {parser: null,
appliesToBB : function(el){
        if (BBCodeUtils.type(this.options.appliesToBB) == "function") return !!this.options.appliesToBB.call(this,el);
        return false;
    },
toBBStart:function(el){
        if (BBCodeUtils.type(this.options.toBBStart) == "function") return this.options.toBBStart.call(this,el);
        if (BBCodeUtils.type(this.options.toBBStart) == "string") return this.options.toBBStart;
        return this.options.toBBStart;
    },
toBBContent:function(el){
        if (BBCodeUtils.type(this.options.toBBContent) == "function") return this.options.toBBContent.call(this,el);
        if (BBCodeUtils.type(this.options.toBBStart) == "string") return this.options.toBBContent;
        return this.options.toBBContent;
    },
toBBEnd:function(el){
        if (BBCodeUtils.type(this.options.toBBEnd) == "function") return this.options.toBBEnd.call(this,el);
        if (BBCodeUtils.type(this.options.toBBEnd) == "string") return this.options.toBBEnd;
         return this.options.toBBEnd;
    },
doesToBBContent:function(el){
        if (this.options.toBBContent == BBCodeUtils.lambda) return false;
        return this. toBBContent(el) !== false;
    },
appliesToHTML:function(el){
        if (BBCodeUtils.type(this.options.appliesToHTML) == "function") return this.options.appliesToHTML(el);
        return false;
    },
toHTMLStart:function(el){
        if (BBCodeUtils.type(this.options.toHTMLStart) == "function") return this.options.toHTMLStart(el);
        if (BBCodeUtils.type(this.options.toHTMLStart) == "string") return this.options.toHTMLStart;
        return "";
    },
toHTMLEnd:function(el){
        if (BBCodeUtils.type(this.options.toHTMLEnd) == "function") return this.options.toHTMLEnd(el);
        if (BBCodeUtils.type(this.options.toHTMLEnd) == "string") return this.options.toHTMLEnd;
        return "";
    },
toHTMLContent:function(el){
        if (BBCodeUtils.type(this.options.toHTMLContent) == "function") return this.options.toHTMLContent(el);
        if (BBCodeUtils.type(this.options.toHTMLContent) == "string") return this.options.toHTMLContent;
        return false;
    },
doesToHTMLContent:function(el){
        return (this.options.toHTMLContent !== BBCodeUtils.lambda);
        if (this.options.toHTMLContent !== BBCodeUtils.lambda) return false;
        return this. toHTMLContent(el) !== false;
    }
};





     BBCodeTree= function(BBcode,options) {
	 	
this.options = {
 tagsSingle:[],
    };
 this.rules = []; 
	for (var key in options) {
		this.options[key] = options[key];
	}
	this.text = BBcode;
        this.toTree();
     };
BBCodeTree.prototype= { tagStack:[],
offset:0,
 text:"",
 tree:[],
 toTree:function(){
 	try {
		this.tree = [];
		var result = this.locateTagAfter(this.offset);
		while (result !== false) {
			if (appSettings.debug.detailedLogging && appSettings.debug.logBBcodeParsing) {
				Mojo.Log.info("Next tag: " + JSON.stringify(result));
	 		}
			//any text inbetween?
			if (result.start > (this.offset)) {
				if (this.tagStack.length == 0) {
					this.tree.push(this.text.substring(this.offset, result.start));
				}
				else {
					this.tagStack[this.tagStack.length - 1].children.push(this.text.substring(this.offset, result.start));
				}
				
			}
			// starting a new child
			if (result.data.type == "start") {
				if (BBCodeUtils.isInArray(this.options.tagsSingle, result.data.tag)) {
					if (this.tagStack.length == 0) {
						this.tree.push(result);
					}
					else {
						this.tagStack[this.tagStack.length - 1].children.push(result);
					}
				}
				else {
				
					this.tagStack.push(result);
				}
			}
			else //ending this is a end tag, maybe it fits current or parent?
 				if (this.tagStack.length > 0) {
					//it fits current?
					if (result.data.tag.toLowerCase() == this.tagStack[this.tagStack.length - 1].data.tag.toLowerCase()) {
						//no parent node on thestack? -> push it into result tree
						if (this.tagStack.length == 1) {
							this.tree.push(this.tagStack.pop());
						}
						else { // well just put it into its parent
							this.tagStack[this.tagStack.length - 2].children.push(this.tagStack.pop());
						}
					// if it doesnt fit the current, current might be missing its end, maybe there is any parent fitting?
					}
					else 
						if (BBCodeUtils.filterArray(this.tagStack, function(el){
							return el.data.tag == this.data.tag;
						}, result)) {
							//some parent fits (see above), lets close all unclosed ones
							while (result.data.tag !== this.tagStack[this.tagStack.length - 1].data.tag) {
								this.tagStack[this.tagStack.length - 2].children.push(this.tagStack.pop());
							}
							// so we finally found the tag to close!
							//no parent node on thestack? -> push it into result tree
							if (this.tagStack.length == 1) {
								this.tree.push(this.tagStack.pop());
							}
							else { // well just put it into its parent
								this.tagStack[this.tagStack.length - 2].children.push(this.tagStack.pop());
							}
						}
						else {
						//well we didnt find a tag to close, somebody screwed up appearenty, so discard the closing tag...
						}
				}
				else {
				//a ending tag with no open tags? screw that one too...
				}
			//repeat after last tag...
			this.offset = result.end;
			result = this.locateTagAfter(this.offset);
		}
		//text at the end ?
		if (this.offset < this.text.length) {
			if (this.tagStack.length == 0) {
				this.tree.push(this.text.substring(this.offset));
			}
			else { // well just put it into its parent
				this.tagStack[this.tagStack.length - 1].children.push(this.text.substring(this.offset));
			}
		}
		while (this.tagStack.length > 0) {
			if (this.tagStack.length == 1) {
				this.tree.push(this.tagStack.pop());
			}
			else { // well just put it into its parent
				this.tagStack[this.tagStack.length - 2].children.push(this.tagStack.pop());
			}
		}
		if (appSettings.debug.detailedLogging && appSettings.debug.logBBcodeParsing) {
			Mojo.Log.info("Done.");
 		}
		
	} catch (e) {
		Mojo.Log.error("toTree ERROR: ", e);
	}
     },
locateTagAfter:function(offset){
        var foundAt = -2;
        while (foundAt== -2 && offset<=this.text.length){

            foundAt = this.text.substr(offset).indexOf(this.options.openSymbol);
            if (foundAt == -1) {
                return false;
            }
            var endAt = this.text.substr(offset+foundAt+1).indexOf(this.options.closeSymbol);
            if (this.text.substr(offset+foundAt+1).indexOf(this.options.openSymbol) < endAt &&this.text.substr(offset+foundAt+1).indexOf(this.options.openSymbol) >=0) {
                offset = offset+foundAt+1;
                foundAt= -2;
            } else {
                return {data:this.tagToObject(this.text.substr(offset+foundAt+1,endAt)),start:(offset+foundAt),end:(offset+foundAt+endAt+2),children:[]};
            }
        }
     },
tagToObject:function(tag) {
         if (tag.substr(0,1) == "/") {
          var  type="end";
             tag=tag.substr(1);
         }  else {
          var   type="start";
         }
	parts = tag.match(/([^\s=]+(=("[^"]+"|[^\s]+))?)/gi);
         var params={};
         if (parts[0].indexOf("=")>0) {
             var tag = parts[0].split("=")[0];
         } else {
             var tag = parts[0];
         }

         for (var i=0;i<parts.length;++i){
              if (parts[i].indexOf("=")>0) {
		var value = parts[i].split("=").slice(1).join("=");
		if (value[0] == "\"" && value[value.length-1] == "\"") value= value.substring(1,value.length-2);
             params[ parts[i].split("=")[0]]= value;
         } else {
             params[ parts[i]]=parts[i];
         }
         }
         return {tag:tag,params:params,type:type,children:[]};
     }
};


BBCode = function(options) {
this.options = {
       tagsSingle:[],
	openSymbol:"[",
	closeSymbol:"]"
    };

	for (var key in options) {
		this.options[key] = options[key];
	}
    };

BBCode.prototype={
rules:[],
BBTextFilters:[],
HTMLTextFilters:[],
addRule:function(rule){
        this.rules.push(new BBCodeConvertRule(rule));
return this;
    },
addBBTextFilter:function(filter){
        if (BBCodeUtils.type(filter) =="function") this.BBTextFilters = BBCodeUtils.includeIntoArray(this.BBTextFilters,filter);
return this;
    },
addHTMLTextFilter:function(filter){
        if (BBCodeUtils.type(filter) =="function") this.HTMLTextFilters = BBCodeUtils.includeIntoArray(this.HTMLTextFilters,filter);
return this;
    },
toBBCode:function(html){
        var tmp = document.createElement("div")
tmp.innerHTML=unescape(html);
        var ret =this.nodesToBBcode(tmp.childNodes);

        return ret;
    },
toHTML:function(bbcode){
        var t = new BBCodeTree(bbcode,this.options);
        if (appSettings.debug.detailedLogging && appSettings.debug.logBBcodeParsing) {
        	logJSON("BBcodetree: " + JSON.stringify(t,null,2));
        }
        return this.nodesToHTML(t.tree);

    },
applyBBTextFilters:function(text){
        if (text == undefined ) return "";
        for (var i = 0;i<this.BBTextFilters.length;++i){
            var tmp =this.BBTextFilters[i](text);
            if (tmp != undefined) text = tmp;
        }
        return text;
    },
applyHTMLTextFilters:function(text){

        if (text == undefined ) return "";
        for (var i = 0;i<this.HTMLTextFilters.length;++i){
            var tmp =this.HTMLTextFilters[i](text);
            if (tmp != undefined) text = tmp;
        }
        return text;
    },
nodeToBBcode:function(node){
        var ret = "";
        if (BBCodeUtils.type(node)=="textnode") {
            return this.applyBBTextFilters((typeof node.textContent != "undefined"?node.textContent:node.data));
        }
        if (BBCodeUtils.type(node)=="whitespace") {
            return this.applyBBTextFilters((typeof node.textContent != "undefined"?node.textContent:node.data));
        }
        
        if (BBCodeUtils.type(node) !== "element") return"";
        var localrules = BBCodeUtils.filterArray(this.rules,function(rule){return rule.appliesToHTML(this);},node);
        for (var i = 0;i<localrules.length;++i){
            var tmp =localrules[i].toBBStart(node);
            if (typeof tmp != "undefined") ret += tmp;
        }
        var contentrules = BBCodeUtils.filterArray(localrules,function(rule){return rule.doesToBBContent(this);},node);
        if (contentrules.length>0){
             ret += contentrules[0].toBBContent(node);
        } else  {
            ret += this.nodesToBBcode(node.childNodes);
        }
        for (var i = (localrules.length-1);i>=0;--i){
             var tmp =localrules[i].toBBEnd(node);
            if (typeof tmp != "undefined") ret += tmp;

        }
        return ret;
    },
nodesToBBcode:function(nodes){
        var ret = "";
        for (var i = 0;i<nodes.length;++i){
            ret += this.nodeToBBcode(nodes[i]);
        }
        return ret;
    },
nodeToHTML:function(node){
        var ret = "";

        if (BBCodeUtils.type(node)=="string") {
            return this.applyHTMLTextFilters(node);
        }
        var localrules = BBCodeUtils.filterArray(this.rules,function(rule){return rule.appliesToBB(this);},node);
        for (var i = 0;i<localrules.length;++i){
            var tmp =localrules[i].toHTMLStart(node);
            if (tmp != undefined) ret += tmp;
        }
        var contentrules = BBCodeUtils.filterArray(localrules,function(rule){return rule.doesToHTMLContent(this);},node);
        if (contentrules.length>0){
             ret += contentrules[0].toHTMLContent(node);
        } else  {
            ret += this.nodesToHTML(node.children);
        }
        for (var i = (localrules.length-1);i>=0;--i){
             var tmp =localrules[i].toHTMLEnd(node);
            if (tmp != undefined) ret += tmp;

        }
        return ret;
    },
nodesToHTML:function(nodes){
        var ret = "";
        for (var i = 0;i<nodes.length;++i){
            ret += this.nodeToHTML(nodes[i]);
        }
        return ret;
    }
};

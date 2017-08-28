/**
 * Copyright (C) 2017
 * A project by mcx
 */
(function(window){
	/*
	 * base
	 */
	function hasClass(e, c) {
		var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
		return re.test(e.className);
	};
	function addClass(e, c) {
		var newclass = e.className.split(" ");
		if(e.className == "") newclass = [];
		newclass.push(c);
		e.className = newclass.join(" ");
	};
	function removeClass(e, c) {
		var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
		e.className = e.className.replace(re, " ");
	};
	var isSupportAddEventListener = !!document.addEventListener;
	function on(dom, eventType, callback){
		if(isSupportAddEventListener){
			dom.addEventListener(eventType, callback);
		}else{
			dom.attachEvent("on" + eventType, callback);
		}
	};
	function off(dom, eventType, fun){
		if(isSupportAddEventListener){
			dom.removeEventListener(eventType, fun);
		}else{
			dom.detachEvent("on" + eventType, fun);	
		}
	};
	function extend(source, target){
		for(var key in target){
			source[key] = target[key];
		}
		return source;
	};
	function getAnimationEndName(dom){
		var cssAnimation = ["animation", "webkitAnimation"];
		var animationEnd = {
			"animation":"animationend",
			"webkitAnimation":"webkitAnimationEnd"
		};
		for(var i = 0; i < cssAnimation.length; i++){
			if(dom.style[cssAnimation[i]] != undefined){
				return animationEnd[cssAnimation[i]];
			}
		}
		return undefined;
	};
	
	/*
	 * accordion
	 */
	function Accordion(id){
		var accordion = this.context = document.getElementById(id);
		var totalHeight = accordion.offsetHeight;  //get total height
		var accordions = accordion.querySelectorAll(".accordion-item");
		
		var firstH5 = accordion.getElementsByTagName("h5")[0];
		
		var initH = this.initH = firstH5.offsetHeight;  //item height
		
		//expandable height
		var h = totalHeight - accordions.length * initH + initH;
		this.h = h = h - /*accordions.length **/ 1 - 1;
		
		var firstAccordion = accordions[0];
		firstAccordion.style.height = h + "px";
		//show the content
		var content = firstAccordion.querySelector(".accordion-content");
		content.style.display = "block";
		//set content height
		content.style.height = h - initH + "px";
		
		addClass(firstAccordion, "collapsable");
		addClass(firstAccordion.getElementsByTagName("i")[0], "collapse");
		
		var accordionHeads = accordion.querySelectorAll(".accordion-head");
		var _this = this;
		on(accordionHeads[0], "click", function(e){
			coll.call(_this, e.target || e.srcElement);
		});
		on(firstAccordion.getElementsByTagName("i")[0], "click", function(e){
			coll.call(_this, e.target || e.srcElement);
		});
		for(var i = 1; i < accordions.length; i++){
			on(accordionHeads[i], "click", function(e){
				coll.call(_this, e.target || e.srcElement);
			});
			on(accordions[i].getElementsByTagName("i")[0], "click", function(e){
				coll.call(_this, e.target || e.srcElement);
			});
			accordions[i].style.height = initH + "px";
			
			content = accordions[i].querySelector(".accordion-content");
			content.style.height = h - initH + "px";
		}
	};
	var animationFinish = true;
	function coll(target){
		if(!hasClass(target.parentNode, "collapsable") && animationFinish){
			
			var previous = this.context.querySelector(".collapsable");
			//hide the content
			var content = previous.querySelector(".accordion-content");
			content.style.display = "none";
			
			removeClass(previous, "collapsable");
			removeClass(previous.getElementsByTagName("i")[0], "collapse");
			
			addClass(target.parentNode, "collapsable");
			addClass(target.parentNode.getElementsByTagName("i")[0], "collapse");
			
			animationFinish = false;
			var expandable = target.parentNode;
			content = expandable.querySelector(".accordion-content");
			content.style.display = "block";
			collAnimate(previous, target.parentNode, this.initH, this.h, function(collapsable, expandable){
				animationFinish = true;
			});
		}
	};
	function collAnimate(collapsable, expandable, minHeight, height, callback){
		
		var startHeight = parseInt(expandable.style.height);
		var step = height;
		var t = setInterval(function(){
			step = step - 15;
			
			collapsable.style.height = step + "px";
			expandable.style.height = startHeight + (height - step) + "px";
			
			if(step <= minHeight){
				collapsable.style.height = minHeight + "px";
				expandable.style.height = startHeight + (height - minHeight) + "px";
				clearInterval(t);
				callback(collapsable, expandable);
			}
		}, 10);
	};
	
	/*
	 * tab
	 */
	function Tab(id, options){
		this.id = id;
		this.currentIndex = 0;
		this.options = {
			removeable: false,
			tabChange: function(tabTitle, tabContent, index){}
		}
		this.options = extend(this.options, options);
		
		var context = document.getElementById(id);
		
		var tabHead = context.querySelector("#" + id + " > .tab-head");
		this.titleContainer = tabHead.getElementsByTagName("ul")[0];
		
		this.contentContainer = context.querySelector("#" + id + " > .tab-content");
		
		this.tabTitles = [];
		
		var tabTitles = context.querySelectorAll(".tab-title");
		this.tabTitles.push.apply(this.tabTitles, tabTitles);
		
		this.tabContents = []
		var tabContents = context.querySelectorAll("#" + id + " > .tab-content > .content");
		this.tabContents.push.apply(this.tabContents, tabContents);
		
		this.contentHeight = context.offsetHeight - tabHead.offsetHeight - 2;
		
		this.tabContents[0].style.display = "block";
		
		var _this = this;
		for(var i = 0; i < this.tabTitles.length; i++){
			this.tabTitles[i].id = this.id + "_title-" + (i + 1);
			on(this.tabTitles[i], "click", function(e){
				_this._changeTab(e.target || e.srcElement);
			});
			this.tabContents[i].style.height = this.contentHeight - 10 + "px";
			
			if(this.options.removeable && i != 0){
				//add delete icon
				var iconEle = document.createElement("i");
				on(iconEle, "click", function(e){
					//prevent bubble
					if(e.stopPropagation)e.stopPropagation();
					e.cancelBubble = true;
					_this._removeTab(e.target || e.srcElement);
				});
				this.tabTitles[i].appendChild(iconEle);
				this.tabTitles[i].style.paddingRight = "28px";
			}
		}
		
		if(this.options.removeable){
			on(tabHead, "contextmenu", function(e){
				if(e.preventDefault){
					e.preventDefault();
				}else{
					window.event.returnValue = false;
				}
				if(!tabHead.querySelector(".tab-menu")){
					var x = e.pageX || e.clientX;
					var y = e.pageY || e.clientY;
					var tabMenuBg = document.createElement("div");
					var tabMenu = document.createElement("div");
					var tabMenu1= document.createElement("div");
					var tabMenu2 = document.createElement("div");
					var tabMenu3 = document.createElement("div");
					var tabMenu4 = document.createElement("div");
					tabMenu.style.left = x + "px";
					tabMenu.style.top = y + "px";
					tabMenu1.innerHTML = "关闭当前";
					tabMenu2.innerHTML = "关闭其它";
					tabMenu3.innerHTML = "关闭所有";
					tabMenu4.innerHTML = "取消";
					addClass(tabMenuBg, "tab-menu-bg");
					addClass(tabMenu, "tab-menu");
					addClass(tabMenu1, "tab-menu-opt");
					addClass(tabMenu2, "tab-menu-opt");
					addClass(tabMenu3, "tab-menu-opt");
					addClass(tabMenu4, "tab-menu-opt");
					
					on(tabMenu1, "click", function(){
						_this._closeTab("current");
						
						tabHead.removeChild(tabMenuBg);
						tabHead.removeChild(tabMenu);
					});
					on(tabMenu2, "click", function(){
						_this._closeTab("other");
						
						tabHead.removeChild(tabMenuBg);
						tabHead.removeChild(tabMenu);
					});
					on(tabMenu3, "click", function(){
						_this._closeTab("all");
						
						tabHead.removeChild(tabMenuBg);
						tabHead.removeChild(tabMenu);
					});
					on(tabMenu4, "click", function(){
						tabHead.removeChild(tabMenuBg);
						tabHead.removeChild(tabMenu);
					});
					on(tabMenuBg, "click", function(){
						tabHead.removeChild(tabMenuBg);
						tabHead.removeChild(tabMenu);
					});
					
					tabMenu.appendChild(tabMenu1);
					tabMenu.appendChild(tabMenu2);
					tabMenu.appendChild(tabMenu3);
					tabMenu.appendChild(tabMenu4);
					tabHead.appendChild(tabMenuBg);
					tabHead.appendChild(tabMenu);
				}
			});
		}
	};
	Tab.prototype = {
		constructor: Tab,
		_changeTab: function(t){
			var target = t;
			var _tab = this;
			if(!hasClass(target, "selected")){
				var index = target.id.split("-")[1];
				index = parseInt(index) - 1;
				_tab.currentIndex = index;
				for(var i = 0; i < _tab.tabTitles.length; i++){
					if(i == index){
						_tab.tabContents[index].style.display = "block";
						addClass(_tab.tabTitles[index], "selected");
					}else{
						_tab.tabContents[i].style.display = "none";
						removeClass(_tab.tabTitles[i], "selected");
					}
				}
				_tab.options.tabChange(_tab.tabTitles[index], _tab.tabContents[index], index);
			}
			
		},
		_removeTab: function(t){
			var target = t;
			var _tab = this;
			
			var index = target.parentNode.id.split("-")[1];
			index = parseInt(index) - 1;
			//remove title
			_tab.titleContainer.removeChild(document.getElementById(target.parentNode.id));
			_tab.tabTitles.splice(index, 1);
			//remove content
			_tab.contentContainer.removeChild(_tab.tabContents[index]);
			_tab.tabContents.splice(index, 1);
			
			for(var i = 0; i < _tab.tabTitles.length; i++){
				_tab.tabTitles[i].id = _tab.id + "_title-" + (i + 1);
			}
			
			if(_tab.tabTitles.length != 0)
				_tab._changeTab(_tab.tabTitles[_tab.tabTitles.length - 1]);
		},
		_closeTab: function(opt){
			if(opt == "current"){
				if(this.currentIndex != 0){
					var t = this.tabTitles[this.currentIndex].querySelector("i");
					this._removeTab(t);
				}
			}else if(opt == "other"){
				var titles = [], contents = [];
				for(var i = 1; i < this.tabTitles.length; i++){
					if(i != this.currentIndex){
						var target = this.tabTitles[i].querySelector("i");
						var index = target.parentNode.id.split("-")[1];
						index = parseInt(index) - 1;
						//remove title
						this.titleContainer.removeChild(document.getElementById(target.parentNode.id));
						//remove content
						this.contentContainer.removeChild(this.tabContents[index]);
					}
				}
				titles.push(this.tabTitles[0]);
				titles.push(this.tabTitles[this.currentIndex]);
				contents.push(this.tabContents[0]);
				contents.push(this.tabContents[this.currentIndex]);
				this.tabTitles = titles;
				this.tabContents = contents;
				
				for(var i = 0; i < this.tabTitles.length; i++){
					this.tabTitles[i].id = this.id + "_title-" + (i + 1);
				}
				this.currentIndex = 1;
				
			}else if(opt = "all"){
				var titles = [], contents = [];
				for(var i = 1; i < this.tabTitles.length; i++){
					var target = this.tabTitles[i].querySelector("i");
					var index = target.parentNode.id.split("-")[1];
					index = parseInt(index) - 1;
					//remove title
					this.titleContainer.removeChild(document.getElementById(target.parentNode.id));
					//remove content
					this.contentContainer.removeChild(this.tabContents[index]);
				}
				titles.push(this.tabTitles[0]);
				contents.push(this.tabContents[0]);
				this.tabTitles = titles;
				this.tabContents = contents;
				
				for(var i = 0; i < this.tabTitles.length; i++){
					this.tabTitles[i].id = this.id + "_title-" + (i + 1);
				}
				//selected this first tab
				this.tabContents[0].style.display = "block";
				addClass(this.tabTitles[0], "selected");
				this.currentIndex = 0;
			}
		},
		addTab: function(title, content){
			for(var i = 0; i < this.tabTitles.length; i++){
				var tabTitle = this.tabTitles[i];
				var _title= tabTitle.innerHTML.replace("<i></i>", "");
				if(_title == title){
					this.tabContents[i].innerHTML = content;
					this._changeTab(tabTitle);
					handleScript(content);
					return;
				}
			}
			var titleElem = document.createElement("li");
			titleElem.innerHTML = title;
			titleElem.id = this.id + "_title-" + (this.tabTitles.length + 1);
			var _this = this;
			on(titleElem, "click", function(e){
				_this._changeTab(e.target || e.srcElement);
			});
			
			if(this.options.removeable){
				//add delete icon
				var iconEle = document.createElement("i");
				on(iconEle, "click", function(e){
					//prevent bubble
					if(e.stopPropagation)e.stopPropagation();
					e.cancelBubble = true;
					_this._removeTab(e.target || e.srcElement);
				});
				titleElem.appendChild(iconEle);
				titleElem.style.paddingRight = "28px";
			}
			addClass(titleElem, "tab-title");
			
			var contentElem = document.createElement("div");
			contentElem.innerHTML = content;
			contentElem.style.height = this.contentHeight - 10 + "px";
			addClass(contentElem, "content");
			
			this.titleContainer.appendChild(titleElem);
			this.tabTitles.push(titleElem);
			this.contentContainer.appendChild(contentElem);
			this.tabContents.push(contentElem);
			
			this._changeTab(titleElem);
			
			handleScript(content);
		},
		setCurrentTab: function(content){
			this.tabContents[this.currentIndex].innerHTML = content;
			handleScript(content);
		}
	};
	function handleScript(content){
		var div = document.createElement("div");
		div.innerHTML = content;
		var scripts = div.getElementsByTagName("script");
		for(var i = 0; i < scripts.length; i++){
			var script = document.createElement("script");
			script.type = "text/javascript";
			if(scripts[i].innerHTML)
				script.innerHTML = scripts[i].innerHTML;
			if(scripts[i].getAttribute("src"))
				script.src = scripts[i].getAttribute("src");
			document.getElementsByTagName("body")[0].appendChild(script);
		}
	};
	
	/*
	 * tree
	 */
	function Tree(id, options, data){
		this.options = {
			enableLink: true,
			enableCheck: false,
			treeClick: function(tree){},
			checkboxClick: function(treeId, treeName, checked){}
		}
		this.options = extend(this.options, options);
		this.data = (data && data instanceof Array) ? data : [];
		this.checkedNodes = [];
		if(this.data.length > 0){
			this.context = this._initView(this.context);
			document.getElementById(id).appendChild(this.context);
		}else{
			this.context = document.getElementById(id);
		}
		
		this._initBehavior();
	};
	
	Tree.prototype = {
		constructor: Tree,
		_initView: function(){
			var data = this.data;
			var treeUl = document.createElement("ul");
			addClass(treeUl, "mcxui-tree");
			for(var i = 0; i < data.length; i++){
				var treeObj = data[i];
				if(treeObj.parentId == 0){
					var treeItem = document.createElement("li");
					var treeIndicate = document.createElement("i");
					var treeNode = document.createElement("a");
					var treeIco = document.createElement("i");
					var treeNodeName = document.createElement("span");
					
					addClass(treeItem, "tree-item");
					addClass(treeItem, "data-item");
					addClass(treeIndicate, "tree-icon");
					addClass(treeNode, "tree-node");
					if(treeObj.expand == true) addClass(treeNode, "tree-expand");
					addClass(treeIco, "tree-icon");
					addClass(treeNodeName, "tree-name");
					treeNode.id = treeObj.id;
					if(treeObj.url != undefined) treeNode.href = treeObj.url;
					treeNodeName.innerHTML = treeObj.name;
					
					treeNode.appendChild(treeIco);
					treeNode.appendChild(treeNodeName);
					treeItem.appendChild(treeIndicate);
					
					if(this.options.enableCheck == true){
						var treeCheckBox = document.createElement("span");
						addClass(treeCheckBox, "tree-checkbox");
						if("checked" in treeObj && treeObj.checked == true){
							addClass(treeCheckBox, "checked");
							
							var tree = {id:0, name:"", checked:false, url:""};
							tree.id = treeObj.id;
							tree.name = treeObj.name;
							tree.checked = treeObj.checked;
							tree.url = treeObj.url;
							this.checkedNodes.push(tree);
						}else{
							addClass(treeCheckBox, "unchecked");
							treeObj.checked = false;
						}
						treeItem.appendChild(treeCheckBox);
					}
					
					treeItem.appendChild(treeNode);
					
					//recursive sub element
					var child = Tree.structureTreeView(data, treeObj.id, this.options.enableCheck, this.checkedNodes);
					if(child) treeItem.appendChild(child);
					
					treeUl.appendChild(treeItem);
				}
			}
			return treeUl;
		},
		_initBehavior : function(){
			var _this = this;
			var indicates = this.context.querySelectorAll(".tree-item > .tree-icon");
			for(var i = 0; i < indicates.length; i++){
				var indicate = indicates[i];
				var sibs = getSibling(indicate, "ul", "html");
				var treeNode = getSibling(indicate, "tree-node", "class")[0];
				if(sibs.length > 0){
					addClass(indicate, "expandable");
					addClass(sibs[0], "hidden");
					addClass(treeNode.querySelector("i"), "folder");
					
					if(hasClass(treeNode, "tree-expand")){
						removeClass(indicate, "expandable");
						removeClass(sibs[0], "hidden");
						removeClass(treeNode.querySelector("i"), "folder");
						
						addClass(indicate, "collapsable");
						addClass(sibs[0], "show");
						addClass(treeNode.querySelector("i"), "folder-open");
					}
					
					//set click event
					on(indicate, "click", this._indicateClick);
					
				}else{
					removeClass(indicate, "expandable");
					removeClass(indicate, "collapsable");
					addClass(treeNode.querySelector("i"), "text");
				}
				if(this.options.enableLink == false){
					on(treeNode, "click", function(e){
						if(e.preventDefault) e.preventDefault();
						else e.returnValue = false;
						_this._treeNodeClick(e.target || e.srcElement);
					});
				}
			}
			
			//whether enableCheck is true,binding checkbox click event 
			if(this.data.length > 0 && this.options.enableCheck == true){
				var checkboxs = this.context.querySelectorAll(".tree-item > .tree-checkbox");
				for(var i = 0; i < checkboxs.length; i++){
					var ckbox = checkboxs[i];
					on(ckbox, "click", function(e){
						_this._checkboxClick(e.target || e.srcElement);
					});
				}
			}
		},
		_indicateClick: function(e){
			var target = e.target || e.srcElement;
			
			var childTree = getSibling(target, "ul", "html")[0];
			var treeNode = getSibling(target, "tree-node", "class")[0];
			var foldIco = treeNode.querySelector("i");
			if(hasClass(childTree, "hidden")){
				removeClass(childTree, "hidden");
				addClass(childTree, "show");
				removeClass(target, "expandable");
				addClass(target, "collapsable");
				removeClass(foldIco, "folder");
				addClass(foldIco, "folder-open");
			}else{
				removeClass(childTree, "show");
				addClass(childTree, "hidden");
				removeClass(target, "collapsable");
				addClass(target, "expandable");
				removeClass(foldIco, "folder-open");
				addClass(foldIco, "folder");
			}
		},
		_treeNodeClick: function(target){
			var treeNode;
			if(target.tagName != "A"){
				treeNode = target.parentNode;
			}else{
				treeNode = target;
			}
			var tree = {id:0, name:"", url:""};
			tree.id = treeNode.getAttribute("id");
			tree.name = treeNode.querySelector("span").innerHTML;
			tree.url = treeNode.getAttribute("href");
			
			this.options.treeClick(tree);
		},
		_checkboxClick: function(target){
			var treeNode = getSibling(target, "tree-node", "class")[0];
			var tree = {};
			if(hasClass(target, "checked")){
				removeClass(target, "checked");
				addClass(target, "unchecked");
				tree = Tree.checkChildTree(treeNode, false, this.checkedNodes);
				Tree.checkParentTree(treeNode, false, this.checkedNodes);
			}else{
				removeClass(target, "unchecked");
				addClass(target, "checked");
				tree = Tree.checkChildTree(treeNode, true, this.checkedNodes);
				Tree.checkParentTree(treeNode, true, this.checkedNodes);
				this.checkedNodes.push(tree);
			}
			this.options.checkboxClick(tree.id, tree.name, tree.checked);
		},
		getCheckedNodes: function(){
			return this.checkedNodes;
		},
		getUncheckedNodes: function(){
			var uncheckedNodes = [];
			for(var i = 0; i < this.data.length; i ++){
				var dataNode = this.data[i];
				var find = false;
				for(var j = 0; j < this.checkedNodes.length; j++){
					var checkedNode = this.checkedNodes[j];
					if(dataNode.id == checkedNode.id){
						find = true;
						break;
					}
				}
				if(!find) uncheckedNodes.push(dataNode);
			}
			if(this.checkedNodes.length > 0) return uncheckedNodes;
			else return this.data;
		}
	};
	Tree.structureTreeView = function(data, parentId, enableCheck, checkedNodes){
		var childTreeUl = document.createElement("ul");
		addClass(childTreeUl, "tree-child");
		var hasChild = false;
		for(var i = 0; i < data.length; i++){
			var treeObj = data[i];
			if(treeObj.parentId != 0 && treeObj.parentId == parentId){
				var treeItem = document.createElement("li");
				var treeIndicate = document.createElement("i");
				var treeNode = document.createElement("a");
				var treeIco = document.createElement("i");
				var treeNodeName = document.createElement("span");
				
				addClass(treeItem, "tree-item");
				addClass(treeItem, "data-item");
				addClass(treeIndicate, "tree-icon");
				addClass(treeNode, "tree-node");
				addClass(treeIco, "tree-icon");
				addClass(treeNodeName, "tree-name");
				treeNode.id = treeObj.id;
				if(treeObj.url != undefined) treeNode.href = treeObj.url;
				treeNodeName.innerHTML = treeObj.name;
				treeNode.appendChild(treeIco);
				treeNode.appendChild(treeNodeName);
				treeItem.appendChild(treeIndicate);
				
				if(enableCheck == true){
					var treeCheckBox = document.createElement("span");
					addClass(treeCheckBox, "tree-checkbox");
					if("checked" in treeObj && treeObj.checked == true){
						addClass(treeCheckBox, "checked");
						var tree = {id:0, name:"", checked:false, url:""};
						tree.id = treeObj.id;
						tree.name = treeObj.name;
						tree.checked = treeObj.checked;
						tree.url = treeObj.url;
						checkedNodes.push(tree);
					}else{
						addClass(treeCheckBox, "unchecked");
						treeObj.checked = false;
					}
						
					treeItem.appendChild(treeCheckBox);
				}
				
				treeItem.appendChild(treeNode);
				
				var child = Tree.structureTreeView(data, treeObj.id, enableCheck);
				if(child) treeItem.appendChild(child);
				
				childTreeUl.appendChild(treeItem);
				hasChild = true;
			}
		}
		if(hasChild) return childTreeUl; else return undefined;
	};
	Tree.checkChildTree = function(treeNode, checked, checkedNodes){
		var tree = {id:0, name:"", checked:false, url:""};
		tree.id = treeNode.getAttribute("id");
		tree.name = treeNode.querySelector("span").innerHTML;
		tree.url = treeNode.getAttribute("href");
		tree.checked = checked;
		var treeChilds = getSibling(treeNode, "tree-child", "class");
		if(treeChilds.length > 0){
			var children = treeChilds[0].children;
			for(var i = 0; i < children.length; i++){
				var cxb = children[i].querySelector("span.tree-checkbox");
				var childNode = children[i].querySelector("a.tree-node");
				if(checked){
					removeClass(cxb, "unchecked");
					if(!hasClass(cxb, "checked")){
						addClass(cxb, "checked");
					}
					
					var t = Tree.checkChildTree(childNode, checked, checkedNodes);
					//push sub tree in the checkednodes
					if(!Tree.isCheckedTree(checkedNodes, t.id))
						checkedNodes.push(t);
				}else{
					removeClass(cxb, "checked");
					if(!hasClass(cxb, "unchecked")){
						addClass(cxb, "unchecked");
					}
					Tree.checkChildTree(childNode, checked, checkedNodes);
				}
			}
		}
		//remove the unchecked node
		if(checked == false){
			for(var j = 0; j < checkedNodes.length; j++){
				var checkedNode = checkedNodes[j];
				if(checkedNode.id == tree.id){
					checkedNodes.splice(j, 1);
				}
			}
		}
		return tree;
	};
	Tree.checkParentTree = function(treeNode, checked, checkedNodes){
		var treeChild = treeNode.parentNode.parentNode;
		
		var parentNodes = getSibling(treeChild, "tree-node", "class");
		if(parentNodes.length > 0){
			var tree = {id:0, name:"", checked:false, url:""};
			var parentNode = parentNodes[0];
			tree.id = parentNode.getAttribute("id");
			tree.name = parentNode.querySelector("span").innerHTML;
			tree.url = parentNode.getAttribute("href");
			tree.checked = checked;
			
			var parentCheckbox = getSibling(treeChild, "tree-checkbox", "class")[0];
			if(checked){
				removeClass(parentCheckbox, "unchecked");
				if(!hasClass(parentCheckbox, "checked")){
					addClass(parentCheckbox, "checked");
				}
				
				if(!Tree.isCheckedTree(checkedNodes, tree.id))
					checkedNodes.push(tree);
				
				Tree.checkParentTree(parentCheckbox, checked, checkedNodes);
				return tree;
			}
		}
		return undefined;
	};
	Tree.isCheckedTree = function(trees, treeId){
		var exist = false;
		for(var i = 0; i < trees.length; i++){
			var checkedNode = trees[i];
			if(checkedNode.id == treeId){
				exist = true;
				break;
			}
		}
		return exist;
	};
	function getSibling(elem, selector, type){
		type = type == undefined ? "html" : type;
		var siblingElements = [];
		var siblings = elem.parentNode.children;
		for(var i = 0; i < siblings.length; i++){
			switch(type){
				case "html":
					if(siblings[i].nodeName == selector.toUpperCase()){
						siblingElements.push(siblings[i]);
					}
				break;
				case "class":
					if(siblings[i].className.indexOf(selector) != -1){
						siblingElements.push(siblings[i]);
					}
				break;
			}
		}
		return siblingElements;
	};
	
	/*
	 * nav
	 */
	function Nav(id){
		this.context = document.getElementById(id);
		var items = this.context.querySelectorAll(".nav-item>a");
		
		for(var i = 0; i < items.length; i++){
			var item = items[i];
			var navChild = getSibling(item, "nav-child", "class")[0];
			if(navChild){
				if(!hasClass(item, "nav-expandable")) addClass(item, "nav-expandable");
				if(!hasClass(navChild, "hide")) addClass(navChild, "hide");
				if(hasClass(item, "nav-expand")){
					removeClass(item, "nav-expandable");
					addClass(item, "nav-collapsable");
					addClass(item, "choose");
					addClass(item.parentNode, "nav-current");
					removeClass(navChild, "hide");
					addClass(navChild, "show");
				}
				var _this = this;
				on(item, "click", function(e){
					if(e.preventDefault){
						e.preventDefault();
					}else{
						e.returnValue = false;
					}
					_this._itemClick(e.target || e.srcElement);
				});
			}else{
				on(item, "click", function(e){
					_this._linkItemClick(e.target || e.srcElement);
				});
			}
		}
	};
	Nav.prototype = {
		constructor: Nav,
		_itemClick: function(target){
			var sibling = getSibling(target, "nav-child", "class")[0];
			if(hasClass(sibling, "hide")){
				removeClass(target, "nav-expandable");
				addClass(target, "nav-collapsable");
				
				addClass(target, "choose");
				addClass(target.parentNode, "nav-current");
				
				removeClass(sibling, "hide");
				addClass(sibling, "show");
				
				sibling.style.overflow = "hidden";
				expacollAnimate(sibling, 0, sibling.offsetHeight, "expand",
				function(){
					sibling.style.height = "";
					sibling.style.overflow = "auto";
				});
			}else{
				removeClass(target, "nav-collapsable");
				addClass(target, "nav-expandable");
				
				removeClass(target, "choose");
				//removeClass(target.parentNode, "nav-current");
				
				removeClass(sibling, "show");
				//addClass(sibling, "hide");
				
				sibling.style.overflow = "hidden";
				expacollAnimate(sibling, sibling.offsetHeight, 0, "collapse",
				function(){
					sibling.style.height = "";
					sibling.style.overflow = "auto";
					
					removeClass(target.parentNode, "nav-current");
					addClass(sibling, "hide");
				});
			}
		},
		_linkItemClick: function(target){
			var activeItem = this.context.querySelector("a.nav-active");
			if(activeItem)
				removeClass(activeItem, "nav-active");
			addClass(target,  "nav-active");
		}
	};
	function expacollAnimate(target, initH, targetH, type, callback){
		target.style.height = initH + "px";
		var step = 0;
		var i = setInterval(function(){
			if(type == "expand"){
				step += 10;
			}else if(type == "collapse"){
				step -= 10;
			}
			target.style.height = initH + step + "px";
			
			if(type == "expand"){
				if(step >= targetH){
					target.style.height = targetH + "px";
					clearInterval(i);
					callback();
				}
			}else if(type == "collapse"){
				if((initH + step) <= targetH){
					target.style.height = targetH + "px";
					clearInterval(i);
					callback();
				}
			}
		}, 20);
	};
	function getSibling(elem, selector, type){
		type = type == undefined ? "html" : type;
		var siblingElements = [];
		var siblings = elem.parentNode.children;
		for(var i = 0; i < siblings.length; i++){
			switch(type){
				case "html":
					if(siblings[i].nodeName == selector.toUpperCase()){
						siblingElements.push(siblings[i]);
					}
				break;
				case "class":
					if(siblings[i].className.indexOf(selector) != -1){
						siblingElements.push(siblings[i]);
					}
				break;
			}
		}
		return siblingElements;
	};
	
	/*
	 * switch
	 */
	function Switch(id){
		this.switchElem = document.getElementById(id);
		this.switchBtn = this.switchElem.querySelector(".switch-button");
		this.animationEndName = getAnimationEndName(this.switchBtn);
		
		var _this = this;
		on(this.switchBtn, "click", function(){
			_this._switchClick();
		});
		
		function animation(){
			_this._switch();
		}
		
		if(this.animationEndName) on(this.switchBtn , this.animationEndName, animation);
		
		if(hasClass(this.switchElem, "switch-on")){
			this.isOpen = true;
		}else{
			this.isOpen = false;
		}
		this.toggleCallback = function(status){};
	};
	Switch.prototype = {
		constructor: Switch,
		_switchClick: function(){
			//whether support animation 
			if(!this.animationEndName){
				this._switch();
				return;
			}
			if(hasClass(this.switchElem , "switch-on")){
				addClass(this.switchBtn , "animation-off");
				addClass(this.switchElem, "switching");
			}else{
				addClass(this.switchBtn , "animation-on");
				addClass(this.switchElem, "switching");
			}
		},
		_switch: function(){
			if(hasClass(this.switchElem, "switch-on")){
				removeClass(this.switchElem, "switch-on");
				removeClass(this.switchBtn, "animation-off");
				addClass(this.switchElem, "switch-off");
				this.isOpen = false;
			}else{
				removeClass(this.switchElem, "switch-off");
				removeClass(this.switchBtn, "animation-on");
				addClass(this.switchElem, "switch-on");
				this.isOpen = true;
			}
			removeClass(this.switchElem, "switching");
			this.toggleCallback(this.isOpen);
		},
		on: function(){
			if(!this.isOpen) {
				if(this.animationEndName){
					addClass(this.switchBtn , "animation-on");
					addClass(this.switchElem, "switching");
				}else{
					this._switch();
				}
			}
		},
		off: function(){
			if(this.isOpen) {
				if(this.animationEndName){
					addClass(this.switchBtn , "animation-off");
					addClass(this.switchElem, "switching");
				}else{
					this._switch();
				}
			}
		},
		toggle: function(callback){
			if(callback){
				this.toggleCallback = callback;
			}else{
				this._switchClick();
			}
		}
		
	};
	
	/*
	 * pagination
	 */
	function Pagination(id, options){
		this.options = {
			showSkipPage: true,
			showFirstLast: true,
			pageNumber: 1,
			pageSize: 10,
			totalCount: 10,
			pages: 5,
			form: ""
		}
		var ajax = {
			url: "",
			type: "POST",
			contentType: "application/x-www-form-urlencoded",
			before: function(param){},
			success: function(data, page){},
			failure: function(){}
		}
		this.options = extend(this.options, options);
		if(options.ajax) extend(ajax, options.ajax);
		this.options.ajax = ajax;
		this.container = document.getElementById(id);
		this.totalPage = this.options.totalCount % this.options.pageSize == 0 ?
			this.options.totalCount / this.options.pageSize : parseInt(this.options.totalCount / this.options.pageSize) + 1;
		this.pages = [];
		
		this._init();
	};
	Pagination.prototype = {
		constructor: Pagination,
		_init: function(){
			var opts = this.options;
			var operation = document.createElement("div");
			addClass(operation, "pagination-operation");
			addClass(this.container, "mcxui-pagination");
			if(this.totalPage > 1){
				var first = document.createElement("div");
				var last = document.createElement("div");
				var previous = document.createElement("div");
				var next = document.createElement("div");
				var firstLeaveout = document.createElement("div");
				var lastLeaveout = document.createElement("div");
				
				first.innerHTML = "首页";
				last.innerHTML = "末页";
				previous.innerHTML = "上一页";
				next.innerHTML = "下一页";
				last.innerHTML = "末页";
				firstLeaveout.innerHTML = lastLeaveout.innerHTML = "...";
				
				addClass(first, "first");
				addClass(last, "last");
				addClass(previous, "previous");
				addClass(next, "next");
				addClass(firstLeaveout, "leaveout");
				addClass(lastLeaveout, "leaveout");
				
				operation.appendChild(previous);
				if(this.options.showFirstLast == true)
				operation.appendChild(first);
				operation.appendChild(firstLeaveout);
				
				if(opts.pageNumber > 1){
					if(opts.pageNumber <= opts.pages)
					firstLeaveout.style.display = "none";
				}else{
					first.style.display = "none";
					firstLeaveout.style.display = "none";
				}
				
				var _this = this;
				for(var i = 1; i <= this.totalPage; i++){
					var page = document.createElement("div");
					page.innerHTML = i;
					addClass(page, "page");
					if(opts.pageNumber == i){
						var current = document.createElement("span");
						current.innerHTML = i;
						addClass(current, "current");
						page.appendChild(current);
					}
					
					var ltLimit = gtLimit = 0;
					if(opts.pageNumber % opts.pages == 0){
						ltLimit = opts.pageNumber - (opts.pages - 1);
						gtLimit = opts.pageNumber;
					}else{
						ltLimit = parseInt(opts.pageNumber / opts.pages) * opts.pages + 1;
						gtLimit = ltLimit + (opts.pages - 1);
					}
					
					if(i < ltLimit || i > gtLimit)
					page.style.display = "none";
					
					operation.appendChild(page);
					on(page, "click", function(e){
						_this._page(e.target || e.srcElement);
					})
					this.pages.push(page);
				}
				
				operation.appendChild(lastLeaveout);
				if(this.options.showFirstLast == true)
				operation.appendChild(last);
				operation.appendChild(next);
				
				//paging pagination
				var limit = (parseInt(this.totalPage / opts.pages) - 1) * opts.pages;
				if(this.totalPage % opts.pages != 0){
					limit = parseInt(this.totalPage / opts.pages) * opts.pages;
				}
				this.lastLimit = limit;
				
				if(opts.pageNumber < this.totalPage){
					if(opts.pageNumber > limit)
					lastLeaveout.style.display = "none";
				}else{
					lastLeaveout.style.display = "none";
					last.style.display = "none";
				}
				
				this.container.appendChild(operation);
				
				this.first = first;
				this.last = last;
				this.previous = previous;
				this.next = next;
				this.firstLeaveout = firstLeaveout;
				this.lastLeaveout = lastLeaveout;
				
				if(this.options.showFirstLast == true){
					on(first, "click", function(e){
						_this._first();
					});
					on(last, "click", function(e){
						_this._last();
					});
				}
				on(previous, "click", function(e){
					_this._previous();
				});
				on(next, "click", function(e){
					_this._next();
				});
				
				if(this.options.showSkipPage == true){
					var paginationSkip = document.createElement("div");
					var span1 = document.createElement("span");
					var skipPage = document.createElement("input");
					var span2 = document.createElement("span");
					var skipButton = document.createElement("button");
					span1.innerHTML = "跳转到";
					skipPage.type = "text";
					skipPage.value = opts.pageNumber;
					span2.innerHTML = "页";
					skipButton.innerHTML = "确定";
					
					addClass(paginationSkip, "pagination-skip");
					addClass(skipPage, "skip-page");
					addClass(skipButton, "skip-button");
					paginationSkip.appendChild(span1);
					paginationSkip.appendChild(skipPage);
					paginationSkip.appendChild(span2);
					paginationSkip.appendChild(skipButton);
					
					this.container.appendChild(paginationSkip);
					
					this.skipPage = skipPage;
					on(skipButton, "click", function(e){
						_this._skipPage();
					});
					on(skipPage, "blur", function(e){
						var t = e.target || e.srcElement;
						if(/\d/.test(t.value)){
							if(parseInt(t.value) < 1)
							t.value = 1;
							else if(parseInt(t.value) > _this.totalPage)
							t.value = _this.totalPage;
						}
					});
				}
			}else{
				
			}
		},
		_first: function(){
			if(this.options.form == ""){
				var page = {
					pageNumber: 1,
					pageSize: this.options.pageSize,
					totalCount: this.options.totalCount,
					totalPage: this.totalPage
				};
				if(this.options.ajax.url != ""){
					this._ajax(page, "first");
				}else{
					this._selectPage("first");
				}
			}else{
				this.options.pageNumber = 1;
				this._formSubmit();
			}
		},
		_last: function(){
			if(this.options.form == ""){
				var page = {
					pageNumber: this.totalPage,
					pageSize: this.options.pageSize,
					totalCount: this.options.totalCount,
					totalPage: this.totalPage
				};
				if(this.options.ajax.url != ""){
					this._ajax(page, "last");
				}else{
					this._selectPage("last");
				}
			}else{
				this.options.pageNumber = this.totalPage;
				this._formSubmit();
			}
		},
		_previous: function(){
			//this.options.pageNumber = this.options.pageNumber - 1;
			var currentPage = this.options.pageNumber - 1;
			if(currentPage >= 1){
				if(this.options.form == ""){
					var page = {
						pageNumber: currentPage,
						pageSize: this.options.pageSize,
						totalCount: this.options.totalCount,
						totalPage: this.totalPage
					};
					if(this.options.ajax.url != ""){
						this._ajax(page, "previous");
					}else{
						this._selectPage("previous");
					}
				}else{
					this.options.pageNumber = currentPage;
					this._formSubmit();
				}
			}else{
				this.options.pageNumber = 1;
			}
		},
		_next: function(){
			var currentPage = this.options.pageNumber + 1;
			if(currentPage <= this.totalPage){
				if(this.options.form == ""){
					var page = {
						pageNumber: currentPage,
						pageSize: this.options.pageSize,
						totalCount: this.options.totalCount,
						totalPage: this.totalPage
					};
					if(this.options.ajax.url != ""){
						this._ajax(page, "next");
					}else{
						this._selectPage("next");
					}
				}else{
					this.options.pageNumber = currentPage;
					this._formSubmit();	
				}
			}else{
				this.options.pageNumber = this.totalPage;
			}
		},
		_page: function(target){
			if(this.options.form == ""){
				var page = {
					pageNumber: parseInt(target.innerHTML),
					pageSize: this.options.pageSize,
					totalCount: this.options.totalCount,
					totalPage: this.totalPage
				};
				if(this.options.ajax.url != ""){
					this._ajax(page, "page", target);
				}else{
					this._selectPage("page", target);
				}
			}else{
				this.options.pageNumber = parseInt(target.innerHTML);
				this._formSubmit();
			}
		},
		_skipPage: function(){
			var skipInput = this.container.querySelector(".skip-page");
			if(/\d/.test(skipInput.value)){
				if(this.options.form == ""){
					var page = {
						pageNumber: parseInt(skipInput.value),
						pageSize: this.options.pageSize,
						totalCount: this.options.totalCount,
						totalPage: this.totalPage
					};
					if(this.options.ajax.url != ""){
						this._ajax(page, "skip", skipInput);
					}else{
						this._selectPage("skip", skipInput);
					}
				}else{
					this.options.pageNumber = parseInt(skipInput.value);
					this._formSubmit();
				}
			}else{
				alert("请输入数字");
				skipInput.value = this.options.pageNumber;
			}
		},
		_selectPage: function(op, pageTarget){
			if(op == "first"){
				var current = this.pages[this.options.pageNumber - 1].querySelector("span.current");
				current.innerHTML = 1;
				this.pages[0].appendChild(current);
				
				this.options.pageNumber = 1;
				
				if(this.options.showSkipPage == true){
					this.skipPage.value = 1;
				}
				
				//show the last
				this.last.style.display = "inline-block";
				//hide the first
				this.first.style.display = "none";
				
				this.firstLeaveout.style.display = "none";
				
				if(this.options.pageNumber <= this.lastLimit){
					this.lastLeaveout.style.display = "inline-block";
				}
				
				this._changePage();
			}else if(op == "last"){
				var current = this.pages[this.options.pageNumber - 1].querySelector("span.current");
				current.innerHTML = this.totalPage;
				this.pages[this.totalPage - 1].appendChild(current);
				
				this.options.pageNumber = this.totalPage;
				
				if(this.options.showSkipPage == true){
					this.skipPage.value = this.totalPage;
				}
				
				//show the first
				this.first.style.display = "inline-block";
				//hide the last
				this.last.style.display = "none";
				
				this.lastLeaveout.style.display = "none";
				
				if(this.options.pageNumber - this.options.pages >= 1){
					this.firstLeaveout.style.display = "inline-block";
				}
				this._changePage();
			}else if(op == "previous"){
				this.options.pageNumber = this.options.pageNumber - 1;
				var current = this.pages[this.options.pageNumber].querySelector("span.current");
				current.innerHTML = this.options.pageNumber;
				this.pages[this.options.pageNumber - 1].appendChild(current);
				
				if(this.options.pageNumber <= 1){
					//hide the first
					this.first.style.display = "none";
				}else if(this.options.pageNumber + 1 <= this.totalPage){
					//show the last
					this.last.style.display = "inline-block";
				}
				
				if(this.options.pageNumber <= this.lastLimit){
					this.lastLeaveout.style.display = "inline-block";
				}
				 
				if(this.options.pageNumber <= this.options.pages){
					this.firstLeaveout.style.display = "none";
				}
				
				//change pages
				if(this.options.pageNumber % this.options.pages == 0){
					this._changePage();
				}
				
				if(this.options.showSkipPage == true){
					this.skipPage.value = this.options.pageNumber;
				}
			}else if(op == "next"){
				this.options.pageNumber = this.options.pageNumber + 1;
				var current = this.pages[this.options.pageNumber - 2].querySelector("span.current");
				current.innerHTML = this.options.pageNumber;
				this.pages[this.options.pageNumber - 1].appendChild(current);
				
				if(this.options.pageNumber >= this.totalPage){
					//hide the last
					this.last.style.display = "none";
				}else if(this.options.pageNumber - 1 >= 1){
					//show the first
					this.first.style.display = "inline-block";
				}
				
				if(this.options.pageNumber > this.options.pages){
					this.firstLeaveout.style.display = "inline-block";
				}
				
				if(this.options.pageNumber > this.lastLimit){
					this.lastLeaveout.style.display = "none";
				}
				
				//change pages
				if((this.options.pageNumber - 1) % this.options.pages == 0){
					this._changePage();
				}
				
				if(this.options.showSkipPage == true){
					this.skipPage.value = this.options.pageNumber;
				}
			}else if(op == "page"){
				var current = this.pages[this.options.pageNumber - 1].querySelector("span.current");
				this.options.pageNumber = parseInt(pageTarget.innerHTML);
				current.innerHTML = this.options.pageNumber;
				this.pages[this.options.pageNumber - 1].appendChild(current);
				
				if(this.options.showSkipPage == true){
					this.skipPage.value = this.options.pageNumber;
				}
				
				if(this.options.pageNumber == 1){
					this.first.style.display = "none";
				}else{
					this.first.style.display = "inline-block";
				}
				if(this.options.pageNumber == this.totalPage){
					this.last.style.display = "none";
				}else{
					this.last.style.display = "inline-block";
				}
			}else if(op == "skip"){
				var current = this.pages[this.options.pageNumber - 1].querySelector("span.current");
				this.options.pageNumber = parseInt(pageTarget.value);
				current.innerHTML = this.options.pageNumber ;
				this.pages[this.options.pageNumber - 1].appendChild(current);
				
				if(this.options.pageNumber == 1){
					this.first.style.display = "none";
				}else{
					this.first.style.display = "inline-block";
				}
				if(this.options.pageNumber == this.totalPage){
					this.last.style.display = "none";
				}else{
					this.last.style.display = "inline-block";
				}
				
				if(this.options.pageNumber > this.options.pages){
					this.firstLeaveout.style.display = "inline-block";
				}else{
					this.firstLeaveout.style.display = "none";
				}
				
				if(this.options.pageNumber > this.lastLimit){
					this.lastLeaveout.style.display = "none";
				}else{
					this.lastLeaveout.style.display = "inline-block";
				}
				
				//change pages
				this._changePage();
			}
		},
		_changePage: function(){
			for(var i = 1; i <= this.pages.length; i++){
				var page = this.pages[i - 1];
				var ltLimit = gtLimit = 0;
				if(this.options.pageNumber % this.options.pages == 0){
					ltLimit = this.options.pageNumber - (this.options.pages - 1);
					gtLimit = this.options.pageNumber;
				}else{
					ltLimit = parseInt(this.options.pageNumber / this.options.pages) * this.options.pages + 1;
					gtLimit = ltLimit + (this.options.pages - 1);
				}
				if(i < ltLimit || i > gtLimit)
				page.style.display = "none";
				else
				page.style.display = "inline-block";
			}
		},
		_formSubmit: function(){
			var pageForm = document.getElementById(this.options.form);
			if(pageForm){
				var numberInput = pageForm.querySelector("input[type='hidden'][name='pageNumber']");
				var sizeInput = pageForm.querySelector("input[type='hidden'][name='pageSize']");
				if(numberInput == null && sizeInput == null){
					numberInput = document.createElement("input");
					sizeInput = document.createElement("input");
					numberInput.type  = "hidden";
					sizeInput.type  = "hidden";
					numberInput.name = "pageNumber";
					sizeInput.name = "pageSize";
					pageForm.insertBefore(sizeInput, pageForm.firstChild);
					pageForm.insertBefore(numberInput, pageForm.firstChild);
				}
				numberInput.value = this.options.pageNumber;
				sizeInput.value = this.options.pageSize;
				
				if(pageForm.onsubmit){
					if(pageForm.onsubmit() != false)
					pageForm.submit();
				}else{
					pageForm.submit();
				}
			}
		},
		_ajax: function(page, opt, target){
			var ajax = this.options.ajax;
			var url = ajax.url;
			var data = {};
			this.options.ajax.before(data);
			if(ajax.type.toUpperCase() == "POST"){
				data.pageNumber = page.pageNumber;
				data.pageSize = page.pageSize;
				
				if(this.options.ajax.contentType == "application/x-www-form-urlencoded"){
					var params = [];
					for(var key in data){
						params.push(key + "=" + data[key]);
					}
					data = params.join("&");
				}else{
					var jsonData = "{";
					for(var key in data){
						jsonData += "\"" + key + "\":\"" + data[key] + "\",";	
					}
					if(jsonData.indexOf(",") != -1){
						jsonData = jsonData.substring(0, jsonData.length - 1);
					}
					jsonData += "}";
					data = jsonData;
				}
			}else{
				var p = [];
				for(var key in data){
					p.push(key + "=" + data[key]);
				}
				p.push("pageNumber=" + page.pageNumber);
				p.push("pageSize=" + page.pageSize);
				var param = p.join("&");
				
				var separator = "";
				if(ajax.url.indexOf("?") != -1){
					if(ajax.url.indexOf("=") != -1){
						separator = "&";
					}
				}else{
					separator = "?";
				}
				url = ajax.url + separator + param;
			}
			var _this = this;
			sendAjax({
				url: url,
				type: ajax.type,
				contentType: ajax.contentType,
				data: data,
				success: function(data){
					ajax.success(data, page);
					if(opt == "first"){
						_this._selectPage("first");
					}else if(opt == "last"){
						_this._selectPage("last");
					}else if(opt == "previous"){
						_this._selectPage("previous");
					}else if(opt == "next"){
						_this._selectPage("next");
					}else if(opt == "page"){
						_this._selectPage("page", target);
					}else if(opt == "skip"){
						_this._selectPage("skip", target);
					}
				},
				failure: ajax.failure
			});
		}
	};
	function sendAjax(param){
		var xmlHttpRequest;
		try{
			// Firefox, Opera 8.0+, Safari
			xmlHttpRequest=new XMLHttpRequest();
		}catch(e){
			try{
				// Internet Explorer
				xmlHttpRequest=new ActiveXObject("Msxml2.XMLHTTP");
			}catch(e){
				try{
					xmlHttpRequest=new ActiveXObject("Microsoft.XMLHTTP");
				}catch(e){
					throw new Error("你的浏览器过时了");
				}
			}
		}
		xmlHttpRequest.onreadystatechange = function(){
			if(xmlHttpRequest.readyState == 4){  //finish
				if(xmlHttpRequest.status == 200){
					param.success(xmlHttpRequest.responseText);
				}else{
					param.failure();
				}
			}
		};
		//open asynchronous request
		xmlHttpRequest.open(param.type.toUpperCase(), param.url, true);
		
		xmlHttpRequest.setRequestHeader("Content-Type", param.contentType + "; charset=UTF-8");
		
		var data = null;
		if(param.type.toUpperCase() == "POST"){
			data = param.data;
		}
		xmlHttpRequest.send(data);
	};
	
	/*
	 * dialog
	 */
	function getOffsetTop(dom){
	  	var top = dom.offsetTop;
	  	while(dom.offsetParent != null){
	  		top += dom.offsetParent.offsetTop;
	  		dom = dom.offsetParent;
	  	}
  		return top;
	};
	function getOffsetLeft(dom){
	  	var left = dom.offsetLeft;
	  	while(dom.offsetParent != null){
	  		left += dom.offsetParent.offsetLeft;
	  		dom = dom.offsetParent;
	  	}
  		return left;
	};
	
	var layer = {
		init: function(dom, options, isShade){
			var body = document.getElementsByTagName("body")[0];
			if(isShade){
				var bgDiv = document.createElement("div");
				addClass(bgDiv, "mcxui-dialog-bg");
				body.appendChild(bgDiv);
				//whether shade can be closed
				if(options.shadeClose){
					on(bgDiv, "click", function(){
						handleClose();
					});
				}
			}
			
			//whether show close button
			if(options.showClose){
				var closeBtn = dom.getElementsByTagName("i")[0];
				on(closeBtn, "click", function(){
					handleClose();
				});
			}
			
			var isAnimationEnd = false;
			if(dom.style["animation"] != undefined){
				isAnimationEnd = true;
			}
			function remove(){
				layer.close([dom]);
				off(dom, "animationend", remove);
			}
			function handleClose(){
				if(isAnimationEnd){
					addClass(dom, "animation-" + options.animationType + "-out");
					on(dom, "animationend", remove);
					layer.close([bgDiv]);
				}else{
					layer.close([bgDiv, dom]);
				}
			}
			
			//set drag
			var dialogHead = dom.getElementsByTagName("div")[0];
			var downX, downY, left, top;
			function move(e){
				var x = (e.pageX || e.clientX) - downX;
				var y = (e.pageY || e.clientY) - downY;
				dom.style.left = left + x + "px";
				dom.style.top = top + y + "px";
			}
			on(dialogHead, "mousedown", function(e){
				downX = e.pageX || e.clientX;
				downY = e.pageY || e.clientY;
				left = parseFloat(dom.style.left);
				top = parseFloat(dom.style.top);
				on(document, "mousemove", move);
			});
			on(dialogHead, "mouseup", function(){
				off(document, "mousemove", move);
			});
			
			//set button event
			if(options.buttons.length > 0){
				for(var i = 0; i < options.buttons.length; i++){
					var btn = options.buttons[i];
					btn.setAttribute("index", i);
					on(btn, "click", function(e){
						handleClose();
						var _this = e.target || e.srcElement;
						if(options.btnClick)
							options.btnClick(parseInt(_this.getAttribute("index")));
					});
				}
			}
			
			body.appendChild(dom);
			
			//set dialog position
			dom.style.top = (document.documentElement.clientHeight - dom.offsetHeight) / 2 + "px";
			dom.style.left = (document.documentElement.clientWidth - dom.offsetWidth) / 2 + "px";
			
			if(options.layer){
				options.afterLoad();
			}
		},
		initHint: function(dom, options){
			var body = document.getElementsByTagName("body")[0];
			body.appendChild(dom);
			
			if(options.target == undefined){
				dom.style.top = (document.documentElement.clientHeight - dom.offsetHeight) / 2 + "px";
				dom.style.left = (document.documentElement.clientWidth - dom.offsetWidth) / 2 + "px";
			}else{
				//set tips position
				var targetElem = document.getElementById(options.target);
				var offsetTop = getOffsetTop(targetElem);
				var offsetLeft = getOffsetLeft(targetElem);
				if(options.direction == "right"){
					offsetLeft = offsetLeft + targetElem.offsetWidth;
					dom.style.top = offsetTop + "px";
					dom.style.left = offsetLeft + 10 + "px";
				}else if(options.direction == "left"){
					offsetLeft = offsetLeft - dom.offsetWidth;
					dom.style.top = offsetTop + "px";
					dom.style.left = offsetLeft - 10 + "px";
				}else if(options.direction == "top"){
					offsetTop = offsetTop - dom.offsetHeight;
					dom.style.top = offsetTop - 10 + "px";
					dom.style.left = offsetLeft + "px";
				}else if(options.direction == "bottom"){
					offsetTop = offsetTop + targetElem.offsetHeight;
					dom.style.top = offsetTop + 10 + "px";
					dom.style.left = offsetLeft + "px";
				}
			}
			
			var isAnimationEnd = false;
				if(dom.style["animation"] != undefined){
					isAnimationEnd = true;
			}
			function remove(){
				layer.close([dom]);
				off(dom, "animationend", remove);
			}
			function handleClose(){
				if(isAnimationEnd){
					addClass(dom, "animation-" + options.animationType + "-out");
					on(dom, "animationend", remove);
				}else{
					layer.close([dom]);
				}
			}
			setTimeout(function(){
				handleClose();
			}, options.time * 1000);
		},
		close: function(doms){
			var body = document.getElementsByTagName("body")[0];
			for(var i = 0; i < doms.length; i++){
				body.removeChild(doms[i]);
			}
		}
		
	};
	var dialog = {
		loadElement: [],
		alert: function(content, options){
			var opts = {
				showClose: true,
				shadeClose: false,
				animationType: "bounce",
				titleStyle: {},
				buttonStyle: {}
			};
			opts = extend(opts, options);
			opts.btn = ["确定"];
			opts.btnClick = undefined;
			if(opts.buttonStyle){
				opts.buttonStyle = [opts.buttonStyle];
			}
			
			this.open(content, opts);
		},
		confirm: function(content, options){
			var secondBtn = {
				color: "#000000",
				border: "1px solid #DEDEDE",
				backgroundColor: "#F1F1F1"
			}
			var opts = {
				btn: ["确定", "取消"],
				showClose: true,
				shadeClose: false,
				animationType: "bounce",
				titleStyle: {},
				buttonStyle: [{}, secondBtn]
			};
			opts = extend(opts, options);
			if(opts.buttonStyle.length == 1){
				opts.buttonStyle = [options.buttonStyle[0], secondBtn];
			}
			
			this.open(content, opts);
		},
		layer: function(options){
			var opts = {
				width: 500,
				height: 400,
				showClose: true,
				shadeClose: false,
				animationType: "bounce",
				titleStyle: {},
				style: 1,
				content: "",
				afterLoad: function(){}
			};
			opts = extend(opts, options);
			opts.btn = [];
			opts.showClose = true;
			opts.layer = true;
			
			this.open(opts.content, opts);
		},
		open: function(content, options){
			var dialog = document.createElement("div");
			var dialogHead = document.createElement("div");
			var dialogContent = document.createElement("div");
			var dialogTitle = document.createElement("div");
			
			dialogTitle.innerHTML = options.title || "信息";
			dialogContent.innerHTML = content;
			
			addClass(dialog, "mcxui-dialog");
			addClass(dialog, "animation-" + options.animationType + "-in");
			addClass(dialogHead, "dialog-head");
			addClass(dialogContent, "dialog-content");
			addClass(dialogTitle, "dialog-title");
			
			dialogHead.appendChild(dialogTitle);
			dialog.appendChild(dialogHead);
			dialog.appendChild(dialogContent);
			
			if(options.width){
				dialog.style.width = options.width + "px";
			}
			if(options.height){
				if(!options.layer){
					dialogContent.style.height = options.height - 41 - 2 * 18 - 50 + "px";
				}else{
					dialogContent.style.height = options.height - 41 - 2 * 18 + "px";
				}
			}
			
			if(options.titleStyle){
				for(var k in options.titleStyle) dialogHead.style[k] = options.titleStyle[k];
			}
			
			if(options.showClose){
				var dialogIco = document.createElement("i");
				addClass(dialogIco, "dialog-ico");
				dialogHead.appendChild(dialogIco);
			}
			
			if(!options.layer){
				var dialogFoot = document.createElement("div");
				addClass(dialogFoot, "dialog-foot");
				dialog.appendChild(dialogFoot);
			}else{
				if(options.style == 1){
					addClass(dialog, "dialog-layer");
					dialogHead.style.borderRadius = "0";
				}
				dialogContent.style.overflow = "auto";
			}
			
			options.buttons = [];
			for(var i = 0; i < options.btn.length; i++){
				var btn = document.createElement("a");
				btn.href = "javascript:void(0);";
				btn.innerHTML = options.btn[i];
				addClass(btn, "dialog-foot-btn");
				
				//handle button style
				if(options.buttonStyle && options.buttonStyle.length > 0){
					var btnStyle = options.buttonStyle[i];
					for(var k in btnStyle){
						btn.style[k] = btnStyle[k];
					}
				}
				
				dialogFoot.appendChild(btn);
				options.buttons.push(btn);
			}
			
			layer.init(dialog, options, true);
		},
		msg: function(msg, options){
			var opts = {
				time: 3,
				style: {},
				animationType: "zoom"
			};
			opts = extend(opts, options);
			
			var msgDiv = document.createElement("div");
			addClass(msgDiv, "mcxui-dialog-msg");
			addClass(msgDiv, "animation-" + opts.animationType + "-in");
			msgDiv.innerHTML = msg;
			
			for(var k in opts.style){
				msgDiv.style[k] = opts.style[k];
			}
			
			layer.initHint(msgDiv, opts);
		},
		tips: function(content, target, options){
			var opts = {
				time: 3,
				direction: "right",
				animationType: "zoom",
				style: {}
			};
			opts = extend(opts, options);
			opts.target = target || "";
			
			var dir = {left:"right", right:"left", top:"bottom", bottom:"top"};
			
			var tipsDiv = document.createElement("div");
			var tipsWrapper = document.createElement("div");
			var tipsArrow = document.createElement("div");
			var tipsContent = document.createElement("div");
			
			addClass(tipsDiv, "mcxui-dialog-tips");
			addClass(tipsDiv, "animation-" + opts.animationType + "-in");
			addClass(tipsWrapper, "tips-wrapper");
			addClass(tipsArrow, "tips-arrow-" + dir[opts.direction]);
			
			tipsContent.innerHTML = content;
			tipsDiv.appendChild(tipsWrapper);
			tipsWrapper.appendChild(tipsArrow);
			tipsWrapper.appendChild(tipsContent);
			
			for(var k in opts.style){
				tipsDiv.style[k] = opts.style[k];
				//set arrow border color
				if(k == "backgroundColor"){
					if(opts.direction == "left" || opts.direction == "right"){
						tipsArrow.style.borderBottomColor = opts.style[k];
					}else{
						tipsArrow.style.borderRightColor = opts.style[k];
					}
				}
			}
			
			layer.initHint(tipsDiv, opts);
		},
		loading: function(options){
			var opts = {
				src: "img",
				hint: "",
				type: 1,
				animationType: "zoom"
			};
			opts = extend(opts, options);
			
			var bgDiv = document.createElement("div");
			var loadDiv = document.createElement("div");
			var loadImg = document.createElement("img");
			var loadHint = document.createElement("div");
			
			addClass(bgDiv, "mcxui-dialog-loading-bg");
			addClass(loadDiv, "mcxui-dialog-loading");
			addClass(loadDiv, "animation-" + opts.animationType + "-in");
			
			if(opts.hint){
				addClass(loadDiv, "mcxui-dialog-loading-hint");
				loadHint.innerHTML = opts.hint;
			}
			
			loadImg.src = opts.src + "/loading-" + opts.type + ".gif";
			
			loadDiv.appendChild(loadImg);
			loadDiv.appendChild(loadHint);
			
			var body = document.getElementsByTagName("body")[0];
			body.appendChild(bgDiv);
			body.appendChild(loadDiv);
			
			loadDiv.style.top = (document.documentElement.clientHeight - loadDiv.offsetHeight) / 2 + "px";
			loadDiv.style.left = (document.documentElement.clientWidth - loadDiv.offsetWidth) / 2 + "px";
			
			this.loadElement.push(bgDiv);
			this.loadElement.push(loadDiv);
		},
		closeLoading: function(){
			layer.close(this.loadElement);
			this.loadElement = [];
		}
	};
	
	/*
	 * form
	 */
	var form = {
		init: function(){
			this.initSelect();
			this.initCheckbox();
			this.initRadioButton();
		},
		initSelect: function(){
			var selects = document.querySelectorAll(".mcxui-select");
			for(var i = 0; i < selects.length; i++){
				var select = selects[i];
				if(select.previousSibling && 
					hasClass(select.previousSibling, "mcxui-select-wrap")) continue;
				this.createSelect(select);
			}
		},
		initCheckbox: function(){
			var allCheckboxArray = [];
			var checkboxs = document.querySelectorAll(".mcxui-checkbox");
			for(var i = 0; i < checkboxs.length; i++){
				var ckbox = checkboxs[i];
				if(ckbox.previousSibling && 
					hasClass(ckbox.previousSibling, "mcxui-checkbox-wrap")) continue
				
				var ckboxWrapElem = document.createElement("div");
				var ckboxElem = document.createElement("i");
				addClass(ckboxWrapElem, "mcxui-checkbox-wrap");
				if(ckbox.checked == true){
					addClass(ckboxElem, "icon-checkbox-checked");
				}else{
					addClass(ckboxElem, "icon-checkbox-unchecked");
				}
				ckboxWrapElem.appendChild(ckboxElem);
				
				var title = ckbox.getAttribute("title");
				if(title != null){
					var ckboxTextElem = document.createElement("span");
					ckboxTextElem.innerHTML = title;
					ckboxWrapElem.appendChild(ckboxTextElem);
				}
				
				if(ckbox.disabled == true){
					addClass(ckboxWrapElem, "disabled");
				}else{
					on(ckboxWrapElem, "click", function(e){
						var target = e.target || e.srcElement;
						if(target.tagName == "SPAN"){
							target = target.parentNode.querySelector("i");
						}else if(target.tagName == "DIV"){
							target = target.querySelector("i");
						}
						var checkboxDom = target.parentNode.nextSibling;
						if(hasClass(target, "icon-checkbox-unchecked")){
							removeClass(target, "icon-checkbox-unchecked");
							addClass(target, "icon-checkbox-checked");
							if(checkboxDom.tagName == "INPUT" && checkboxDom.type == "checkbox"){
								checkboxDom.checked = true;
							}
							
							//check all
							var group = target.getAttribute("mcxui-group");
							if(group != null){
								var elements = form.getElements(allCheckboxArray, group);
								for(var i = 0; i < elements.length; i++){
									var elem = elements[i];
									removeClass(elem, "icon-checkbox-unchecked");
									if(!hasClass(elem, "icon-checkbox-checked"))
									addClass(elem, "icon-checkbox-checked");
								}
								var groupCks = document.querySelectorAll("input[type='checkbox'][mcxui-allcheck][name='"+group+"']");
								checkAll(groupCks);
							}
						}else{
							removeClass(target, "icon-checkbox-checked");
							addClass(target, "icon-checkbox-unchecked");
							if(checkboxDom.tagName == "INPUT" && checkboxDom.type == "checkbox"){
								checkboxDom.checked = false;
							}
							
							//cancel check all
							var group = target.getAttribute("mcxui-group");
							if(group != null){
								var elements = form.getElements(allCheckboxArray, group);
								for(var i = 0; i < elements.length; i++){
									var elem = elements[i];
									removeClass(elem, "icon-checkbox-checked");
									if(!hasClass(elem, "icon-checkbox-unchecked"))
									addClass(elem, "icon-checkbox-unchecked");	
								}
								var groupCks = document.querySelectorAll("input[type='checkbox'][mcxui-allcheck][name='"+group+"']");
								cancelAll(groupCks);
							}
						}
						
					});
					
					var group = ckbox.getAttribute("mcxui-group");
					if(group != null){
						ckboxElem.setAttribute("mcxui-group", group);
					}
					//if the checkbox has mcxui-allcheck property,put it in the allCheckboxArray
					if(ckbox.getAttribute("mcxui-allcheck") != null){
						var name = ckbox.getAttribute("name");
						var elements = form.getElements(allCheckboxArray, name);
						if(elements != null){
							elements.push(ckboxElem);
						}else{
							form.setElements(allCheckboxArray, name, ckboxElem);
						}
					}
				}
				ckbox.parentNode.insertBefore(ckboxWrapElem, ckbox);
			}
		},
		initRadioButton: function(){
			var radioArray = [];
			var radionButtons = document.querySelectorAll(".mcxui-radio");
			for(var i = 0; i < radionButtons.length; i++){
				var radionButton = radionButtons[i];
				if(radionButton.previousSibling 
					&& hasClass(radionButton.previousSibling, "mcxui-radio-wrap")) continue;
				
				var radioWrapElem = document.createElement("div");
				var radioElem = document.createElement("i");
				addClass(radioWrapElem, "mcxui-radio-wrap");
				if(radionButton.checked == true){
					addClass(radioElem, "icon-radio-checked");
				}else{
					addClass(radioElem, "icon-radio-unchecked");
				}
				radioElem.setAttribute("name", radionButton.getAttribute("name"));
				radioWrapElem.appendChild(radioElem);
				
				var title = radionButton.getAttribute("title");
				if(title != null){
					var radioTextElem = document.createElement("span");
					radioTextElem.innerHTML = title;
					radioWrapElem.appendChild(radioTextElem);
				}
				
				if(radionButton.disabled == true){
					addClass(radioWrapElem, "disabled");
				}else{
					on(radioWrapElem, "click", function(e){
						var target = e.target || e.srcElement;
						if(target.tagName == "SPAN"){
							target = target.parentNode.querySelector("i");
						}else if(target.tagName == "DIV"){
							target = target.querySelector("i");
						}
						var radioButtonDom = target.parentNode.nextSibling;
						if(hasClass(target, "icon-radio-unchecked")){
							var radioName = target.getAttribute("name");
							var radios = form.getElements(radioArray, radioName);
							for(var i = 0; i < radios.length; i++){
								var radioElem = radios[i];
								if(!hasClass(radioElem, "icon-radio-unchecked")){
									removeClass(radioElem, "icon-radio-checked");
									addClass(radioElem, "icon-radio-unchecked");
								}
							}
							
							//pitch on the radio button
							removeClass(target, "icon-radio-unchecked");
							addClass(target, "icon-radio-checked");
							if(radioButtonDom.tagName == "INPUT" && radioButtonDom.type == "radio"){
								radioButtonDom.checked = true;
							}
						}
					});
				}
				radionButton.parentNode.insertBefore(radioWrapElem, radionButton);
				
				//put the element in the array
				var name = radionButton.getAttribute("name");
				var radios = form.getElements(radioArray, name);
				if(radios != null){
					radios.push(radioElem);
				}else{
					form.setElements(radioArray, name, radioElem);
				}
			}
		},
		createSelect: function(select){
			var selectWrap = document.createElement("div");
			var arrow = document.createElement("i");
			var selectText = document.createElement("input");
			var optionContainer = document.createElement("div");
			selectText.type = "text";
			selectText.readOnly = true;
			//binding select's name and multiple property
			optionContainer.setAttribute("name", select.getAttribute("name"));
			optionContainer.setAttribute("multiple", select.multiple);
			
			addClass(selectWrap, "mcxui-select-wrap");
			addClass(selectText, "select-input");
			addClass(arrow, "select-arrow");
			addClass(optionContainer, "mcxui-options");
			
			selectWrap.appendChild(arrow);
			selectWrap.appendChild(selectText);
			selectWrap.appendChild(optionContainer);
			
			on(selectText, "focus", function(e){
				var target = e.target || e.srcElement;
				target.nextSibling.style.display = "block";
				
				removeClass(target.previousSibling, "arrow-rotate-anticlockwise");
				addClass(target.previousSibling, "arrow-rotate-clockwise");
			});
			on(selectText, "blur", function(e){
				var target = e.target || e.srcElement;
				
				removeClass(target.previousSibling, "arrow-rotate-clockwise");
				addClass(target.previousSibling, "arrow-rotate-anticlockwise");
				setTimeout(function(){
					target.nextSibling.style.display = "none";
				}, 150);
			});
			
			var str = [];
			var options = select.options;
			for(var j = 0; j < options.length; j++){
				var option = options[j];
				var optionElem = document.createElement("div");
				optionElem.setAttribute("value", option.value);
				optionElem.innerHTML = option.text;
				addClass(optionElem, "mcxui-option");
				if(option.selected == true){
					str.push(option.text);
					addClass(optionElem, "selected");
				}
					
				optionContainer.appendChild(optionElem);
				
				on(optionElem, "click", function(e){
					var target = e.target || e.srcElement;
					var selectName = target.parentNode.getAttribute("name");
					var selectedValue = target.getAttribute("value");
					var selectElement = document.querySelector("select[name='" + selectName + "']");
					var multiple = target.parentNode.getAttribute("multiple");
					//if select is multiple
					if(multiple == "true"){
						var previousSibling = target.parentNode.previousSibling;
						//if current option is selected,remove it
						if(hasClass(target, "selected")){
							var values = previousSibling.value.split(",");
							if(values.length != 1){
								for(var i = 0; i < values.length; i++){
									var value = values[i];
									if(value == target.innerHTML){
										values.splice(i, 1);
										removeClass(target, "selected");
										break;
									}
								}
								previousSibling.value = values.join(",");
								//set option's selected = false
								form.cancelOption(selectElement, selectedValue);
							}
						}else{
							var separator = ",";
							if(previousSibling.value.length == 0)
								separator = "";
							previousSibling.value = previousSibling.value + separator + target.innerHTML;
							addClass(target, "selected");
							
							//set option's selected = true
							form.selectOption(selectElement, selectedValue, multiple);
						}
					}else{
						//set the input value
						target.parentNode.previousSibling.value = target.innerHTML;
						var siblings = target.parentNode.children;
						for(var i = 0; i < siblings.length; i++){
							removeClass(siblings[i], "selected");
						}
						addClass(target, "selected");
						
						//set option's selected = true
						form.selectOption(selectElement, selectedValue, multiple);
						
						//trigger change event
						triggerChangeEvent(selectElement);
					}
				});
			}
			
			if(select.multiple != true){
				selectText.value = select.options[select.selectedIndex].text;
			}else{
				selectText.value = str.join(",");
			}
			
			select.parentNode.insertBefore(selectWrap, select);
		}
	};
	form.selectOption = function(select, value, multiple){
		var options = select.options;
		for(var i = 0; i < options.length; i++){
			var option = options[i];
			if(multiple == "false"){
				if(option.value == value){
					option.selected = true;
				}else{
					option.selected = false;
				}
			}else{
				if(option.value == value){
					option.selected = true;
				}
			}
		}
	};
	form.cancelOption = function (select, value){
		var options = select.options;
		for(var i = 0; i < options.length; i++){
			var option = options[i];
			if(option.value == value){
				option.selected = false;
				break;
			}
		}
	};
	function triggerChangeEvent(target){
		if(document.createEvent){
			//IE9+ or other browser
			var htmlEvent = document.createEvent("HTMLEvents");
			htmlEvent.initEvent("change", true, true);
			target.dispatchEvent(htmlEvent);
		}else{
			//IE8
			target.fireEvent("onchange");
		}
	};
	form.getElements = function(array, key){
		for(var i = 0; i < array.length; i++){
			var arr = array[i];
			if(arr.key == key){
				return arr.elements;
			}
		}
		return null;
	};
	form.setElements = function(array, key, element){
		var obj = {};
		obj.key = key;
		obj.elements = [];
		obj.elements.push(element);
		array.push(obj);
	};
	function checkAll(checkboxs){
		for(var i = 0; i < checkboxs.length; i++){
			var ckb = checkboxs[i];
			ckb.checked = true;
		}
	};
	function cancelAll(checkboxs){
		for(var i = 0; i < checkboxs.length; i++){
			var ckb = checkboxs[i];
			ckb.checked = false;
		}
	};
	
	
	var mcxui = {
		accordion: {init: function(id){
			new Accordion(id);
		}},
		dialog: dialog,
		form: {
			init: function(){
				form.init();
			},
			select: function(elem){
				var selectElement = typeof elem == "object" ? elem : document.getElementById(elem);
				//if it has create select tag, remove it
				if(selectElement.previousSibling != null
					&& hasClass(selectElement.previousSibling, "mcxui-select-wrap")){
					selectElement.parentNode.removeChild(selectElement.previousSibling);
				}
				selectElement.style.display = "none";
				form.createSelect(selectElement);
			}
		},
		nav: {init: function(id){
			new Nav(id);
		}},
		pagination: {init: function(id, options){
			new Pagination(id, options);
		}},
		"switch": {init: function(id){
			return new Switch(id);
		}},
		tab: {init: function(id, options){
			return new Tab(id, options);
		}},
		tree: {init: function(id, options, data){
			return new Tree(id, options, data);
		}}
	};
	window.mcxui = mcxui;
	
	on(window, "load", function(){
		form.init();
	});
})(window);
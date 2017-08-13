(function(){
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
		
	var mcxui = {
		tab: {
			init: function(id, options){
				return new Tab(id, options);
			}
		}
	}
	window.mcxui = mcxui;
})(window);

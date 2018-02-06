(function(window){
	function Nav(id) {
		this.context = document.getElementById(id);
		var items = this.context.querySelectorAll(".nav-item>a");
		
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var navChild = getSibling(item, "nav-child", "class")[0];
			if (navChild) {
				if (!hasClass(item, "nav-expandable")) addClass(item, "nav-expandable");
				if (!hasClass(navChild, "hide")) addClass(navChild, "hide");
				if (hasClass(item, "nav-expand")) {
					removeClass(item, "nav-expandable");
					addClass(item, "nav-collapsable");
					addClass(item, "choose");
					addClass(item.parentNode, "nav-current");
					removeClass(navChild, "hide");
					addClass(navChild, "show");
				}
				var _this = this;
				on(item, "click", function(e) {
					if (e.preventDefault) {
						e.preventDefault();
					} else {
						e.returnValue = false;
					}
					_this._itemClick(e.target || e.srcElement);
				});
			}else{
				on(item, "click", function(e) {
					_this._linkItemClick(e.target || e.srcElement);
				});
			}
		}
	};
	Nav.prototype = {
		constructor: Nav,
		_itemClick: function(target) {
			var sibling = getSibling(target, "nav-child", "class")[0];
			if (hasClass(sibling, "hide")) {
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
			} else {
				removeClass(target, "nav-collapsable");
				addClass(target, "nav-expandable");
				
				removeClass(target, "choose");
				//removeClass(target.parentNode, "nav-current");
				
				removeClass(sibling, "show");
				//addClass(sibling, "hide");
				
				sibling.style.overflow = "hidden";
				expacollAnimate(sibling, sibling.offsetHeight, 0, "collapse",
				function() {
					sibling.style.height = "";
					sibling.style.overflow = "auto";
					
					removeClass(target.parentNode, "nav-current");
					addClass(sibling, "hide");
				});
			}
		},
		_linkItemClick: function(target) {
			var activeItem = this.context.querySelector("a.nav-active");
			if (activeItem)
				removeClass(activeItem, "nav-active");
			addClass(target,  "nav-active");
		}
	};
	function expacollAnimate(target, initH, targetH, type, callback) {
		target.style.height = initH + "px";
		var step = 0;
		var i = setInterval(function() {
			if (type == "expand"){
				step += 10;
			} else if (type == "collapse") {
				step -= 10;
			}
			target.style.height = initH + step + "px";
			
			if (type == "expand") {
				if (step >= targetH) {
					target.style.height = targetH + "px";
					clearInterval(i);
					callback();
				}
			} else if (type == "collapse") {
				if((initH + step) <= targetH){
					target.style.height = targetH + "px";
					clearInterval(i);
					callback();
				}
			}
		}, 20);
	};
	function getSibling(elem, selector, type) {
		type = type == undefined ? "html" : type;
		var siblingElements = [];
		var siblings = elem.parentNode.children;
		for (var i = 0; i < siblings.length; i++) {
			switch (type) {
				case "html":
					if (siblings[i].nodeName == selector.toUpperCase()) {
						siblingElements.push(siblings[i]);
					}
				break;
				case "class":
					if (siblings[i].className.indexOf(selector) != -1) {
						siblingElements.push(siblings[i]);
					}
				break;
			}
		}
		return siblingElements;
	};
	
	var mcxui = {
		nav: {
			init: function(id) {
				new Nav(id);
			}
		}
	}
	window.mcxui = mcxui;
})(window);

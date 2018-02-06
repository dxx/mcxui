(function(window){
	function Switch(id) {
		this.switchElem = document.getElementById(id);
		this.switchBtn = this.switchElem.querySelector(".switch-button");
		this.animationEndName = getAnimationEndName(this.switchBtn);
		
		var _this = this;
		on(this.switchBtn, "click", function() {
			_this._switchClick();
		});
		
		function animation() {
			_this._switch();
		}
		
		if (this.animationEndName) on(this.switchBtn , this.animationEndName, animation);
		
		if (hasClass(this.switchElem, "switch-on")) {
			this.isOpen = true;
		} else {
			this.isOpen = false;
		}
		this.toggleCallback = function(status){};
	};
	Switch.prototype = {
		constructor: Switch,
		_switchClick: function() {
			//whether support animation 
			if (!this.animationEndName) {
				this._switch();
				return;
			}
			if (hasClass(this.switchElem , "switch-on")) {
				addClass(this.switchBtn , "animation-off");
				addClass(this.switchElem, "switching");
			} else {
				addClass(this.switchBtn , "animation-on");
				addClass(this.switchElem, "switching");
			}
		},
		_switch: function() {
			if (hasClass(this.switchElem, "switch-on")) {
				removeClass(this.switchElem, "switch-on");
				removeClass(this.switchBtn, "animation-off");
				addClass(this.switchElem, "switch-off");
				this.isOpen = false;
			} else {
				removeClass(this.switchElem, "switch-off");
				removeClass(this.switchBtn, "animation-on");
				addClass(this.switchElem, "switch-on");
				this.isOpen = true;
			}
			removeClass(this.switchElem, "switching");
			this.toggleCallback(this.isOpen);
		},
		on: function() {
			if (!this.isOpen) {
				if (this.animationEndName) {
					addClass(this.switchBtn , "animation-on");
					addClass(this.switchElem, "switching");
				} else {
					this._switch();
				}
			}
		},
		off: function() {
			if (this.isOpen) {
				if (this.animationEndName) {
					addClass(this.switchBtn , "animation-off");
					addClass(this.switchElem, "switching");
				} else {
					this._switch();
				}
			}
		},
		toggle: function(callback) {
			if (callback) {
				this.toggleCallback = callback;
			} else {
				this._switchClick();
			}
		}
		
	};
	
	var mcxui = {
		switch: {
			init: function(id) {
				return new Switch(id);
			}
		}
	}
	window.mcxui = mcxui;
})(window);

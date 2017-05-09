(function(window){
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
	
	var mcxui = {
		dialog: dialog
	}
	window.mcxui = mcxui;
})(window);

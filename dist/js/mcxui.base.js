function hasClass(e, c) {
	var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
	return re.test(e.className);
};
function addClass(e, c) {
	var newclass = e.className.split(" ");
	if (e.className == "") newclass = [];
	newclass.push(c);
	e.className = newclass.join(" ");
};
function removeClass(e, c) {
	var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
	e.className = e.className.replace(re, " ");
};
var isSupportAddEventListener = !!document.addEventListener;
function on(dom, eventType, callback) {
	if (isSupportAddEventListener) {
		dom.addEventListener(eventType, callback);
	} else {
		dom.attachEvent("on" + eventType, callback);
	}
};
function off(dom, eventType, fun) {
	if (isSupportAddEventListener) {
		dom.removeEventListener(eventType, fun);
	} else {
		dom.detachEvent("on" + eventType, fun);	
	}
};
function extend(source, target) {
	for (var key in target) {
		source[key] = target[key];
	}
	return source;
};
function getAnimationEndName(dom) {
	var cssAnimation = ["animation", "webkitAnimation"];
	var animationEnd = {
		"animation":"animationend",
		"webkitAnimation":"webkitAnimationEnd"
	};
	for (var i = 0; i < cssAnimation.length; i++) {
		if (dom.style[cssAnimation[i]] != undefined) {
			return animationEnd[cssAnimation[i]];
		}
	}
	return undefined;
}

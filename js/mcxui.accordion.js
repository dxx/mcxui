(function(window){
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
	
	var mcxui = {
		accordion: {
			init: function(id){
				new Accordion(id);
			}
		}
	}
	window.mcxui = mcxui;
})(window);

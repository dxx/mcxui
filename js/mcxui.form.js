(function(window){
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
					hasClass(ckbox.previousSibling, "mcxui-checkbox-wrap")) continue;
				
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
						checkboxDom.checked = !checkboxDom.checked;
                        checkboxDom.click();
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
						radioButtonDom.click();
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
					var selectedValue = target.getAttribute("value");
					var selectElement = target.parentNode.parentNode.nextSibling;
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
		}
	};
	
	on(window, "load", function(){
		form.init();
	});
	
	window.mcxui = mcxui;
})(window);
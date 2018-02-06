(function(window){
	function Tree(id, options, data) {
		this.options = {
			enableLink: true,
			enableCheck: false,
			treeClick: function(tree){},
			checkboxClick: function(treeId, treeName, checked){}
		}
		this.options = extend(this.options, options);
		this.data = (data && data instanceof Array) ? data : [];
		this.checkedNodes = [];
		if (this.data.length > 0) {
			this.context = this._initView(this.context);
			document.getElementById(id).appendChild(this.context);
		} else {
			this.context = document.getElementById(id);
		}
		
		this._initBehavior();
	};
	
	Tree.prototype = {
		constructor: Tree,
		_initView: function() {
			var data = this.data;
			var treeUl = document.createElement("ul");
			addClass(treeUl, "mcxui-tree");
			for (var i = 0; i < data.length; i++) {
				var treeObj = data[i];
				if (treeObj.parentId == 0) {
					var treeItem = document.createElement("li");
					var treeIndicate = document.createElement("i");
					var treeNode = document.createElement("a");
					var treeIco = document.createElement("i");
					var treeNodeName = document.createElement("span");
					
					addClass(treeItem, "tree-item");
					addClass(treeItem, "data-item");
					addClass(treeIndicate, "tree-icon");
					addClass(treeNode, "tree-node");
					if (treeObj.expand == true) addClass(treeNode, "tree-expand");
					addClass(treeIco, "tree-icon");
					addClass(treeNodeName, "tree-name");
					treeNode.id = treeObj.id;
					if (treeObj.url != undefined) treeNode.href = treeObj.url;
					treeNodeName.innerHTML = treeObj.name;
					
					treeNode.appendChild(treeIco);
					treeNode.appendChild(treeNodeName);
					treeItem.appendChild(treeIndicate);
					
					if (this.options.enableCheck == true) {
						var treeCheckBox = document.createElement("span");
						addClass(treeCheckBox, "tree-checkbox");
						if ("checked" in treeObj && treeObj.checked == true) {
							addClass(treeCheckBox, "checked");
							
							var tree = {id:0, name:"", checked:false, url:""};
							tree.id = treeObj.id;
							tree.name = treeObj.name;
							tree.checked = treeObj.checked;
							tree.url = treeObj.url;
							this.checkedNodes.push(tree);
						} else {
							addClass(treeCheckBox, "unchecked");
							treeObj.checked = false;
						}
						treeItem.appendChild(treeCheckBox);
					}
					
					treeItem.appendChild(treeNode);
					
					//recursive sub element
					var child = Tree.structureTreeView(data, treeObj.id, this.options.enableCheck, this.checkedNodes);
					if (child) treeItem.appendChild(child);
					
					treeUl.appendChild(treeItem);
				}
			}
			return treeUl;
		},
		_initBehavior : function() {
			var _this = this;
			var indicates = this.context.querySelectorAll(".tree-item > .tree-icon");
			for (var i = 0; i < indicates.length; i++) {
				var indicate = indicates[i];
				var sibs = getSibling(indicate, "ul", "html");
				var treeNode = getSibling(indicate, "tree-node", "class")[0];
				if (sibs.length > 0) {
					addClass(indicate, "expandable");
					addClass(sibs[0], "hidden");
					addClass(treeNode.querySelector("i"), "folder");
					
					if (hasClass(treeNode, "tree-expand")) {
						removeClass(indicate, "expandable");
						removeClass(sibs[0], "hidden");
						removeClass(treeNode.querySelector("i"), "folder");
						
						addClass(indicate, "collapsable");
						addClass(sibs[0], "show");
						addClass(treeNode.querySelector("i"), "folder-open");
					}
					
					//set click event
					on(indicate, "click", this._indicateClick);
					
				} else {
					removeClass(indicate, "expandable");
					removeClass(indicate, "collapsable");
					addClass(treeNode.querySelector("i"), "text");
				}
				if (this.options.enableLink == false) {
					on(treeNode, "click", function(e) {
						if (e.preventDefault) e.preventDefault();
						else e.returnValue = false;
						_this._treeNodeClick(e.target || e.srcElement);
					});
				}
			}
			
			//whether enableCheck is true,binding checkbox click event 
			if (this.data.length > 0 && this.options.enableCheck == true) {
				var checkboxs = this.context.querySelectorAll(".tree-item > .tree-checkbox");
				for (var i = 0; i < checkboxs.length; i++) {
					var ckbox = checkboxs[i];
					on(ckbox, "click", function(e) {
						_this._checkboxClick(e.target || e.srcElement);
					});
				}
			}
		},
		_indicateClick: function(e) {
			var target = e.target || e.srcElement;
			
			var childTree = getSibling(target, "ul", "html")[0];
			var treeNode = getSibling(target, "tree-node", "class")[0];
			var foldIco = treeNode.querySelector("i");
			if (hasClass(childTree, "hidden")) {
				removeClass(childTree, "hidden");
				addClass(childTree, "show");
				removeClass(target, "expandable");
				addClass(target, "collapsable");
				removeClass(foldIco, "folder");
				addClass(foldIco, "folder-open");
			} else {
				removeClass(childTree, "show");
				addClass(childTree, "hidden");
				removeClass(target, "collapsable");
				addClass(target, "expandable");
				removeClass(foldIco, "folder-open");
				addClass(foldIco, "folder");
			}
		},
		_treeNodeClick: function(target) {
			var treeNode;
			if (target.tagName != "A") {
				treeNode = target.parentNode;
			} else {
				treeNode = target;
			}
			var tree = {id:0, name:"", url:""};
			tree.id = treeNode.getAttribute("id");
			tree.name = treeNode.querySelector("span").innerHTML;
			tree.url = treeNode.getAttribute("href");
			
			this.options.treeClick(tree);
		},
		_checkboxClick: function(target) {
			var treeNode = getSibling(target, "tree-node", "class")[0];
			var tree = {};
			if (hasClass(target, "checked")) {
				removeClass(target, "checked");
				addClass(target, "unchecked");
				tree = Tree.checkChildTree(treeNode, false, this.checkedNodes);
				Tree.checkParentTree(treeNode, false, this.checkedNodes);
			} else {
				removeClass(target, "unchecked");
				addClass(target, "checked");
				tree = Tree.checkChildTree(treeNode, true, this.checkedNodes);
				Tree.checkParentTree(treeNode, true, this.checkedNodes);
				this.checkedNodes.push(tree);
			}
			this.options.checkboxClick(tree.id, tree.name, tree.checked);
		},
		getCheckedNodes: function() {
			return this.checkedNodes;
		},
		getUncheckedNodes: function() {
			var uncheckedNodes = [];
			for (var i = 0; i < this.data.length; i ++) {
				var dataNode = this.data[i];
				var find = false;
				for (var j = 0; j < this.checkedNodes.length; j++) {
					var checkedNode = this.checkedNodes[j];
					if (dataNode.id == checkedNode.id) {
						find = true;
						break;
					}
				}
				if (!find) uncheckedNodes.push(dataNode);
			}
			if (this.checkedNodes.length > 0) return uncheckedNodes;
			else return this.data;
		}
	};
	Tree.structureTreeView = function(data, parentId, enableCheck, checkedNodes) {
		var childTreeUl = document.createElement("ul");
		addClass(childTreeUl, "tree-child");
		var hasChild = false;
		for (var i = 0; i < data.length; i++) {
			var treeObj = data[i];
			if (treeObj.parentId != 0 && treeObj.parentId == parentId) {
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
				if (treeObj.url != undefined) treeNode.href = treeObj.url;
				treeNodeName.innerHTML = treeObj.name;
				treeNode.appendChild(treeIco);
				treeNode.appendChild(treeNodeName);
				treeItem.appendChild(treeIndicate);
				
				if (enableCheck == true) {
					var treeCheckBox = document.createElement("span");
					addClass(treeCheckBox, "tree-checkbox");
					if ("checked" in treeObj && treeObj.checked == true) {
						addClass(treeCheckBox, "checked");
						var tree = {id:0, name:"", checked:false, url:""};
						tree.id = treeObj.id;
						tree.name = treeObj.name;
						tree.checked = treeObj.checked;
						tree.url = treeObj.url;
						checkedNodes.push(tree);
					} else {
						addClass(treeCheckBox, "unchecked");
						treeObj.checked = false;
					}
						
					treeItem.appendChild(treeCheckBox);
				}
				
				treeItem.appendChild(treeNode);
				
				var child = Tree.structureTreeView(data, treeObj.id, enableCheck);
				if (child) treeItem.appendChild(child);
				
				childTreeUl.appendChild(treeItem);
				hasChild = true;
			}
		}
		if (hasChild) return childTreeUl; else return undefined;
	};
	Tree.checkChildTree = function(treeNode, checked, checkedNodes) {
		var tree = {id:0, name:"", checked:false, url:""};
		tree.id = treeNode.getAttribute("id");
		tree.name = treeNode.querySelector("span").innerHTML;
		tree.url = treeNode.getAttribute("href");
		tree.checked = checked;
		var treeChilds = getSibling(treeNode, "tree-child", "class");
		if (treeChilds.length > 0) {
			var children = treeChilds[0].children;
			for (var i = 0; i < children.length; i++) {
				var cxb = children[i].querySelector("span.tree-checkbox");
				var childNode = children[i].querySelector("a.tree-node");
				if (checked) {
					removeClass(cxb, "unchecked");
					if (!hasClass(cxb, "checked")) {
						addClass(cxb, "checked");
					}
					
					var t = Tree.checkChildTree(childNode, checked, checkedNodes);
					//push sub tree in the checkednodes
					if (!Tree.isCheckedTree(checkedNodes, t.id))
						checkedNodes.push(t);
				} else {
					removeClass(cxb, "checked");
					if (!hasClass(cxb, "unchecked")) {
						addClass(cxb, "unchecked");
					}
					Tree.checkChildTree(childNode, checked, checkedNodes);
				}
			}
		}
		//remove the unchecked node
		if (checked == false) {
			for (var j = 0; j < checkedNodes.length; j++) {
				var checkedNode = checkedNodes[j];
				if (checkedNode.id == tree.id) {
					checkedNodes.splice(j, 1);
				}
			}
		}
		return tree;
	};
	Tree.checkParentTree = function(treeNode, checked, checkedNodes) {
		var treeChild = treeNode.parentNode.parentNode;
		
		var parentNodes = getSibling(treeChild, "tree-node", "class");
		if (parentNodes.length > 0) {
			var tree = {id:0, name:"", checked:false, url:""};
			var parentNode = parentNodes[0];
			tree.id = parentNode.getAttribute("id");
			tree.name = parentNode.querySelector("span").innerHTML;
			tree.url = parentNode.getAttribute("href");
			tree.checked = checked;
			
			var parentCheckbox = getSibling(treeChild, "tree-checkbox", "class")[0];
			if (checked) {
				removeClass(parentCheckbox, "unchecked");
				if (!hasClass(parentCheckbox, "checked")) {
					addClass(parentCheckbox, "checked");
				}
				
				if (!Tree.isCheckedTree(checkedNodes, tree.id))
					checkedNodes.push(tree);
				
				Tree.checkParentTree(parentCheckbox, checked, checkedNodes);
				return tree;
			}
		}
		return undefined;
	};
	Tree.isCheckedTree = function(trees, treeId) {
		var exist = false;
		for (var i = 0; i < trees.length; i++) {
			var checkedNode = trees[i];
			if (checkedNode.id == treeId) {
				exist = true;
				break;
			}
		}
		return exist;
	};
	function getSibling(elem, selector, type) {
		type = type == undefined ? "html" : type;
		var siblingElements = [];
		var siblings = elem.parentNode.children;
		for (var i = 0; i < siblings.length; i++) {
			switch(type) {
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
		tree: {
			init: function(id, options, data) {
				return new Tree(id, options, data);
			}
		}
	}
	window.mcxui = mcxui;
})(window);

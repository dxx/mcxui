(function(window){
	function Pagination(id, options) {
		this.options = {
			showSkipPage: true,
			showFirstLast: true,
			pageNumber: 1,
			pageSize: 10,
			totalCount: 10,
			pages: 5,
			form: "",
			pageParam: {
				pageNumber: "pageNumber",
				pageSize: "pageSize"
			}
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
		if (options.ajax) extend(ajax, options.ajax);
		this.options.ajax = ajax;
		this.container = document.getElementById(id);
		this.totalPage = this.options.totalCount % this.options.pageSize == 0 ?
			this.options.totalCount / this.options.pageSize : parseInt(this.options.totalCount / this.options.pageSize) + 1;
		this.pages = [];
		
		this._init();
	};
	Pagination.prototype = {
		constructor: Pagination,
		_init: function() {
			var opts = this.options;
			var operation = document.createElement("div");
			addClass(operation, "pagination-operation");
			addClass(this.container, "mcxui-pagination");
			if (this.totalPage > 1) {
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
				firstLeaveout.innerHTML = lastLeaveout.innerHTML = "...";
				
				addClass(first, "first");
				addClass(last, "last");
				addClass(previous, "previous");
				addClass(next, "next");
				addClass(firstLeaveout, "leaveout");
				addClass(lastLeaveout, "leaveout");
				
				operation.appendChild(previous);
				if (this.options.showFirstLast == true)
				operation.appendChild(first);
				operation.appendChild(firstLeaveout);
				
				if (opts.pageNumber > 1) {
					if (opts.pageNumber <= opts.pages)
					firstLeaveout.style.display = "none";
				} else {
					first.style.display = "none";
					firstLeaveout.style.display = "none";
				}
				
				var ltLimit = gtLimit = 0;
				if (this.options.pageNumber % this.options.pages == 0) {
					ltLimit = parseInt(this.options.pageNumber / this.options.pages - 1) * this.options.pages + 1;
					gtLimit = ltLimit + (this.options.pages - 1);
				} else {
					ltLimit = parseInt(this.options.pageNumber / this.options.pages) * this.options.pages + 1;
					gtLimit = ltLimit + (this.options.pages - 1);
					if (gtLimit > this.totalPage) {
						gtLimit = this.totalPage;
					}
				}
				var _this = this;
				var loopPage = this.totalPage < this.options.pages ? this.totalPage : this.options.pages
				for (var i = 0; i < loopPage; i++) {
					var page = document.createElement("div");
					if (ltLimit + i > gtLimit) {
						page.innerHTML = "";
						page.style.display = "none";
					} else {
						var currentPage = ltLimit + i;
						page.innerHTML = currentPage;
						if (opts.pageNumber == currentPage) {
							var current = document.createElement("span");
							current.innerHTML = currentPage;
							addClass(current, "current");
							page.appendChild(current);
						}
					}
					addClass(page, "page");

					operation.appendChild(page);
					on(page, "click", function(e) {
						_this._page(e.target || e.srcElement);
					})
					this.pages.push(page);
				}
				
				operation.appendChild(lastLeaveout);
				if (this.options.showFirstLast == true)
				operation.appendChild(last);
				operation.appendChild(next);
				
				//paging pagination
				var limit = (parseInt(this.totalPage / opts.pages) - 1) * opts.pages;
				if (this.totalPage % opts.pages != 0) {
					limit = parseInt(this.totalPage / opts.pages) * opts.pages;
				}
				this.lastLimit = limit;
				
				if (opts.pageNumber < this.totalPage) {
					if (opts.pageNumber > limit)
					lastLeaveout.style.display = "none";
				} else {
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
				
				if (this.options.showFirstLast == true) {
					on(first, "click", function(e) {
						_this._first();
					});
					on(last, "click", function(e) {
						_this._last();
					});
				}
				on(previous, "click", function(e) {
					_this._previous();
				});
				on(next, "click", function(e) {
					_this._next();
				});
				
				if (this.options.showSkipPage == true) {
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
					on(skipButton, "click", function(e) {
						_this._skipPage();
					});
					on(skipPage, "blur", function(e) {
						var t = e.target || e.srcElement;
						if (/\d/.test(t.value)) {
							if (parseInt(t.value) < 1)
							t.value = 1;
							else if (parseInt(t.value) > _this.totalPage)
							t.value = _this.totalPage;
						}
					});
				}
			}
		},
		_first: function() {
			if (this.options.form == "") {
				var page = {
					pageNumber: 1,
					pageSize: this.options.pageSize,
					totalCount: this.options.totalCount,
					totalPage: this.totalPage
				};
				if (this.options.ajax.url != "") {
					this._ajax(page, "first");
				} else {
					this._selectPage("first");
				}
			} else {
				this.options.pageNumber = 1;
				this._formSubmit();
			}
		},
		_last: function() {
			if (this.options.form == "") {
				var page = {
					pageNumber: this.totalPage,
					pageSize: this.options.pageSize,
					totalCount: this.options.totalCount,
					totalPage: this.totalPage
				};
				if (this.options.ajax.url != "") {
					this._ajax(page, "last");
				} else {
					this._selectPage("last");
				}
			} else {
				this.options.pageNumber = this.totalPage;
				this._formSubmit();
			}
		},
		_previous: function() {
			var currentPage = this.options.pageNumber - 1;
			if (currentPage >= 1){
				if (this.options.form == "") {
					var page = {
						pageNumber: currentPage,
						pageSize: this.options.pageSize,
						totalCount: this.options.totalCount,
						totalPage: this.totalPage
					};
					if (this.options.ajax.url != "") {
						this._ajax(page, "previous");
					} else {
						this._selectPage("previous");
					}
				} else {
					this.options.pageNumber = currentPage;
					this._formSubmit();
				}
			} else {
				this.options.pageNumber = 1;
			}
		},
		_next: function() {
			var currentPage = this.options.pageNumber + 1;
			if (currentPage <= this.totalPage) {
				if (this.options.form == "") {
					var page = {
						pageNumber: currentPage,
						pageSize: this.options.pageSize,
						totalCount: this.options.totalCount,
						totalPage: this.totalPage
					};
					if (this.options.ajax.url != "") {
						this._ajax(page, "next");
					} else {
						this._selectPage("next");
					}
				} else {
					this.options.pageNumber = currentPage;
					this._formSubmit();	
				}
			} else {
				this.options.pageNumber = this.totalPage;
			}
		},
		_page: function(target) {
			if (this.options.form == "") {
				var page = {
					pageNumber: parseInt(target.innerHTML),
					pageSize: this.options.pageSize,
					totalCount: this.options.totalCount,
					totalPage: this.totalPage
				};
				if (this.options.ajax.url != "") {
					this._ajax(page, "page", target);
				} else {
					this._selectPage("page", target);
				}
			} else {
				this.options.pageNumber = parseInt(target.innerHTML);
				this._formSubmit();
			}
		},
		_skipPage: function() {
			var skipInput = this.container.querySelector(".skip-page");
			if (/\d/.test(skipInput.value)) {
				if (this.options.form == "") {
					var page = {
						pageNumber: parseInt(skipInput.value),
						pageSize: this.options.pageSize,
						totalCount: this.options.totalCount,
						totalPage: this.totalPage
					};
					if (this.options.ajax.url != "") {
						this._ajax(page, "skip", skipInput);
					} else {
						this._selectPage("skip", skipInput);
					}
				} else {
					this.options.pageNumber = parseInt(skipInput.value);
					this._formSubmit();
				}
			} else {
				alert("请输入数字");
				skipInput.value = this.options.pageNumber;
			}
		},
		_selectPage: function(op, pageTarget) {
			if (op == "first") {
				this.options.pageNumber = 1;
				
				if (this.options.showSkipPage == true) {
					this.skipPage.value = 1;
				}
				
				//show the last
				this.last.style.display = "inline-block";
				//hide the first
				this.first.style.display = "none";
				
				this.firstLeaveout.style.display = "none";
				
				if (this.options.pageNumber <= this.lastLimit) {
					this.lastLeaveout.style.display = "inline-block";
				}
				
				this._changePage();
			} else if (op == "last") {
				this.options.pageNumber = this.totalPage;
				
				if (this.options.showSkipPage == true) {
					this.skipPage.value = this.totalPage;
				}
				
				//show the first
				this.first.style.display = "inline-block";
				//hide the last
				this.last.style.display = "none";
				
				this.lastLeaveout.style.display = "none";
				
				if (this.options.pageNumber - this.options.pages >= 1) {
					this.firstLeaveout.style.display = "inline-block";
				}
				this._changePage();
			} else if (op == "previous") {
				//get the span at the previous page postition and appended to the new position
				this.options.pageNumber = this.options.pageNumber - 1;
				if ((this.options.pageNumber) % this.options.pages != 0) {
					var index = (this.options.pageNumber) % this.options.pages;
					var current = this.pages[index].querySelector("span.current");
					current.innerHTML = this.options.pageNumber;
					this.pages[index - 1].appendChild(current);
				}
				
				if (this.options.pageNumber <= 1) {
					//hide the first
					this.first.style.display = "none";
				} else if (this.options.pageNumber + 1 <= this.totalPage) {
					//show the last
					this.last.style.display = "inline-block";
				}
				
				if (this.options.pageNumber <= this.lastLimit) {
					this.lastLeaveout.style.display = "inline-block";
				}
				 
				if (this.options.pageNumber <= this.options.pages) {
					this.firstLeaveout.style.display = "none";
				}
				
				//change pages
				if (this.options.pageNumber % this.options.pages == 0) {
					this._changePage();
				}
				
				if (this.options.showSkipPage == true) {
					this.skipPage.value = this.options.pageNumber;
				}
			} else if (op == "next") {
				this.options.pageNumber = this.options.pageNumber + 1;
				if ((this.options.pageNumber - 1) % this.options.pages != 0) {
					var index = (this.options.pageNumber - 1) % this.options.pages;
					var current = this.pages[index - 1].querySelector("span.current");
					current.innerHTML = this.options.pageNumber;
					this.pages[index].appendChild(current);
				}
				
				if (this.options.pageNumber >= this.totalPage) {
					//hide the last
					this.last.style.display = "none";
				} else if (this.options.pageNumber - 1 >= 1) {
					//show the first
					this.first.style.display = "inline-block";
				}
				
				if (this.options.pageNumber > this.options.pages) {
					this.firstLeaveout.style.display = "inline-block";
				}
				
				if (this.options.pageNumber > this.lastLimit) {
					this.lastLeaveout.style.display = "none";
				}
				
				//change pages
				if ((this.options.pageNumber - 1) % this.options.pages == 0) {
					this._changePage();
				}
				
				if (this.options.showSkipPage == true) {
					this.skipPage.value = this.options.pageNumber;
				}
			} else if (op == "page") {
				var pageNumber = this.options.pageNumber;
				this.options.pageNumber = parseInt(pageTarget.innerHTML);
				var index = pageNumber % this.options.pages == 0 ? this.options.pages : pageNumber % this.options.pages;
				var current = this.pages[index - 1].querySelector("span.current");
				current.innerHTML = this.options.pageNumber;
				var currentIndex = this.options.pageNumber % this.options.pages == 0 ? this.options.pages : this.options.pageNumber % this.options.pages;
				this.pages[currentIndex - 1].appendChild(current);
				
				if (this.options.showSkipPage == true) {
					this.skipPage.value = this.options.pageNumber;
				}
				
				if (this.options.pageNumber == 1) {
					this.first.style.display = "none";
				} else {
					this.first.style.display = "inline-block";
				}
				if (this.options.pageNumber == this.totalPage) {
					this.last.style.display = "none";
				} else {
					this.last.style.display = "inline-block";
				}
			} else if (op == "skip") {
				var pageNumber = this.options.pageNumber;
				this.options.pageNumber = parseInt(pageTarget.value);
				var index = pageNumber % this.options.pages == 0 ? this.options.pages : pageNumber % this.options.pages;
				var current = this.pages[index - 1].querySelector("span.current");
				current.innerHTML = this.options.pageNumber;
				var currentIndex = this.options.pageNumber % this.options.pages == 0 ? this.options.pages : this.options.pageNumber % this.options.pages;
				this.pages[currentIndex - 1].appendChild(current);
				
				if (this.options.pageNumber == 1) {
					this.first.style.display = "none";
				} else {
					this.first.style.display = "inline-block";
				}
				if (this.options.pageNumber == this.totalPage) {
					this.last.style.display = "none";
				} else {
					this.last.style.display = "inline-block";
				}
				
				if (this.options.pageNumber > this.options.pages) {
					this.firstLeaveout.style.display = "inline-block";
				} else {
					this.firstLeaveout.style.display = "none";
				}
				
				if (this.options.pageNumber > this.lastLimit) {
					this.lastLeaveout.style.display = "none";
				} else {
					this.lastLeaveout.style.display = "inline-block";
				}
				
				//change pages
				this._changePage();
			}
		},
		_changePage: function() {
			var ltLimit = gtLimit = 0;
			if (this.options.pageNumber % this.options.pages == 0) {
				ltLimit = parseInt(this.options.pageNumber / this.options.pages - 1) * this.options.pages + 1;
				gtLimit = ltLimit + (this.options.pages - 1);
			} else {
				ltLimit = parseInt(this.options.pageNumber / this.options.pages) * this.options.pages + 1;
				gtLimit = ltLimit + (this.options.pages - 1);
				if (gtLimit > this.totalPage) {
					gtLimit = this.totalPage;
				}
			}
			for (var i = 0; i < this.pages.length; i++) {
				var page = this.pages[i];
				if (ltLimit + i > gtLimit) {
					page.innerHTML = "";
					page.style.display = "none";
				} else {
					page.innerHTML = ltLimit + i;
					page.style.display = "inline-block";
					if (ltLimit + i == this.options.pageNumber) {
						page.innerHTML = page.innerHTML + '<span class="current">' + (ltLimit + i) + '</span>';
					}
				}
			}
		},
		_formSubmit: function() {
			var pageForm = document.getElementById(this.options.form);
			if (pageForm) {
				var pageParam = this.options.pageParam;
				var numberInput = pageForm.querySelector("input[type='hidden'][name='" + pageParam.pageNumber + "']");
				var sizeInput = pageForm.querySelector("input[type='hidden'][name='" + pageParam.pageSize + "']");
				if (numberInput == null && sizeInput == null) {
					numberInput = document.createElement("input");
					sizeInput = document.createElement("input");
					numberInput.type  = "hidden";
					sizeInput.type  = "hidden";
					numberInput.name = pageParam.pageNumber;
					sizeInput.name = pageParam.pageSize;
					pageForm.insertBefore(sizeInput, pageForm.firstChild);
					pageForm.insertBefore(numberInput, pageForm.firstChild);
				}
				numberInput.value = this.options.pageNumber;
				sizeInput.value = this.options.pageSize;
				
				if (pageForm.onsubmit) {
					if(pageForm.onsubmit() != false)
					pageForm.submit();
				} else {
					pageForm.submit();
				}
			}
		},
		_ajax: function(page, opt, target) {
			var ajax = this.options.ajax;
			var url = ajax.url;
			var pageParam = this.options.pageParam;
			var data = {};
			this.options.ajax.before(data);
			if (ajax.type.toUpperCase() == "POST") {
				data[pageParam.pageNumber] = page.pageNumber;
				data[pageParam.pageSize] = page.pageSize;
				
				if (this.options.ajax.contentType == "application/x-www-form-urlencoded") {
					var params = [];
					for (var key in data) {
						params.push(key + "=" + data[key]);
					}
					data = params.join("&");
				} else {
					var jsonData = "{";
					for (var key in data) {
						jsonData += "\"" + key + "\":\"" + data[key] + "\",";	
					}
					if (jsonData.indexOf(",") != -1) {
						jsonData = jsonData.substring(0, jsonData.length - 1);
					}
					jsonData += "}";
					data = jsonData;
				}
			} else {
				var p = [];
				for (var key in data) {
					p.push(key + "=" + data[key]);
				}
				p.push(pageParam.pageNumber + "=" + page.pageNumber);
				p.push(pageParam.pageSize + "=" + page.pageSize);
				var param = p.join("&");
				
				var separator = "";
				if (ajax.url.indexOf("?") != -1) {
					if (ajax.url.indexOf("=") != -1) {
						separator = "&";
					}
				} else {
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
				success: function(data) {
					ajax.success(data, page);
					if (opt == "first") {
						_this._selectPage("first");
					} else if (opt == "last") {
						_this._selectPage("last");
					} else if (opt == "previous") {
						_this._selectPage("previous");
					} else if (opt == "next") {
						_this._selectPage("next");
					} else if (opt == "page") {
						_this._selectPage("page", target);
					} else if (opt == "skip") {
						_this._selectPage("skip", target);
					}
				},
				failure: ajax.failure
			});
		}
	};
	function sendAjax(param) {
		var xmlHttpRequest;
		try {
			// Firefox, Opera 8.0+, Safari
			xmlHttpRequest = new XMLHttpRequest();
		} catch(e) {
			try {
				// Internet Explorer
				xmlHttpRequest = new ActiveXObject("Msxml2.XMLHTTP");
			} catch(e) {
				try {
					xmlHttpRequest = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (e) {
					throw new Error("你的浏览器过时了");
				}
			}
		}
		xmlHttpRequest.onreadystatechange = function() {
			if (xmlHttpRequest.readyState == 4) {  //finish
				if (xmlHttpRequest.status == 200) {
					param.success(xmlHttpRequest.responseText);
				} else {
					param.failure();
				}
			}
		};
		//open asynchronous request
		xmlHttpRequest.open(param.type.toUpperCase(), param.url, true);
		
		xmlHttpRequest.setRequestHeader("Content-Type", param.contentType + "; charset=UTF-8");
		
		var data = null;
		if(param.type.toUpperCase() == "POST") {
			data = param.data;
		}
		xmlHttpRequest.send(data);
	};
	
	var mcxui = {
		pagination: {
			init: function(id, options) {
				new Pagination(id, options);
			}
		}
	}
	window.mcxui = mcxui;
})(window);
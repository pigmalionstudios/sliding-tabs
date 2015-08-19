define(["dijit/registry",
		"dojo/dom-attr",
		"dojo/fx/Toggler",
		"dojo/dom",
		"dojo/dom-style",
		"dojo/dom-class",
		"dojo/query"
		], function(registry, domAttr, Toggler, dom, domStyle, domClass, query){

			var Uti = function() {

				return {
			
					logObject: function(obj) {
						var str = "";

						for (var p in obj) {
							if (obj.hasOwnProperty(p)) {
								str += p + "::" + obj[p] + "\n";
								
							}
						}
								
						console.log(str);
								
					},

					show: function(id, show) {							
						var prop;	
						
						if (show) 
							prop = "display: block;";
						else 
							prop = "display: none;";	
							
						domAttr.set(id, "style", prop);					
					},		
					
					show_animated: function(id, show) {						
						var toggler = new Toggler({
							node: id
							/*
							showDuration: 3000,
							hideDuration: 5000,
							showFunc: coreFx.wipeIn,
							hideFunc: coreFx.wipeOut
							*/
						});		

						if (show)
							toggler.show();
						else 
							toggler.hide();
					},
					
					toggle: function(id) {		
						var prop;
						
						if (Uti.esVisible(id))
							prop = "display: block;";
						else 
							prop = "display: none;";			
						
						domAttr.set(id, "style", prop);
					},	

					esVisible: function(domId) {
						var style = domAttr.get(domId, "style");

						return !Uti.variableInicializada(style) ||
								(Uti.contiene(style, "opacity: 1") || Uti.contiene(style, "display: block"));
					},
					//posicion de la ocurrencia de str2 en str1
					contiene: function(str1, str2) {
						return (str1.toUpperCase().indexOf(str2.toUpperCase()) >= 0);
					},
					
					getWidgetValue: function(id) {
						return registry.byId(id).get("value");
					},

					setWidgetValue: function(id, value) {
						return registry.byId(id).set("value", value);
					},
					
					getValue: function(id) {
						return dom.byId(id).value;
					},

					setValue: function(id, value) {
						dom.byId(id).value = value;
					},		
					//una mera comparacion de strings, probablemente no sea la forma correcta de comparar fechas
					fechaEsMenor: function(f1, f2) {
						return f1 < f2;
					},

					variableInicializada: function(variable) {
						return variable !== null && variable !== undefined;
					},


		            getPropertyWithoutPX: function(nodeID, property) {
		               var propertyValue = domStyle.get(nodeID, property);

		               return Uti.removePXFromString(propertyValue);
		            },

		            removePXFromString: function(str) {
		               var re = /px$/;

		               str = str + "";
		               return str.replace(re, "");
		            },

		            setProperty: function(nodeID, propertyName, propertyValue) {
		            	domStyle.set(nodeID, propertyName, propertyValue);
		            }, 

	            	removeStyle: function(nodeId, newstyle) {
						domClass.remove(nodeId, newstyle);
					}, 

	            	addStyle: function(nodeId, newstyle) {
						domClass.add(nodeId, newstyle);
					}, 

	            	replaceStyles: function(nodeId, newstyle, removeThisStyleOnly) {

						if (removeThisStyleOnly)
							domClass.remove(nodeId, removeThisStyleOnly); 
						else
							domClass.remove(nodeId);

						domClass.add(nodeId, newstyle);
					}, 

	            	replaceStylesInAllSubnodes: function(parentNodeID, newstyle, removeThisStyleOnly) {
						var parent = dom.byId(parentNodeID);
						var nodesFound = query("." + removeThisStyleOnly, parent);
						var currNode;

						for (var i = 0; i < nodesFound.length; i++) {
							currNode = nodesFound[i];
							Uti.replaceStyles(currNode, newstyle, removeThisStyleOnly);
						}
					},

					openUrlOnSystemBrowser: function(url) {

						if (url) {
							window.open(url, "_system");						
						}
					},

					detectAnchorClick: function(e) {
						e.preventDefault();
						e.stopPropagation();
						
						var node = e.srcElement;
						var nodeName = node.nodeName.toLowerCase();
						var parentNode;
						var parentNodeName;

						if (nodeName === "a") {										
							Uti.openUrlOnSystemBrowser(node.href);
						} else {
							parentNode = node.parentNode;
							parentNodeName = parentNode.nodeName.toLowerCase();

							if (parentNodeName === "a") {
								Uti.openUrlOnSystemBrowser(parentNode.href);
							} else {
								parentNode = parentNode.parentNode;
								parentNodeName = parentNode.nodeName.toLowerCase();

								if (parentNodeName === "a") {
									Uti.openUrlOnSystemBrowser(parentNode.href);
								}
							}
						}
					}
					
				};
			}();

			return Uti;
	
    });

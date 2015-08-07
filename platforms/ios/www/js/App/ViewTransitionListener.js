define(["dojo/dom", "Config", "Utilities"], 
	function(dom, Config, Utilities) {
		var currTabID;
		var currHeaderStyle = Config.HEADER_STYLES[Config.MIN_TAB_ID];

		return {

			viewTransitioned: function(tabIDParam){					
				currTabID = tabIDParam;

				var newStyle = Config.HEADER_STYLES[currTabID];
				var currTab = dom.byId(currTabID + "");

				Utilities.replaceStyles("floatHeader", newStyle, currHeaderStyle);
				currHeaderStyle = newStyle;

			},

			aboutIsActive: function() {
				return currTabID === Config.ABOUT_TAB_ID;				
			},

			favListIsActive: function() {
				return currTabID === Config.FAVS_TAB_ID;				
			},

			getCurrentHeaderStyle: function() {
				return currHeaderStyle;
			}

		};

});
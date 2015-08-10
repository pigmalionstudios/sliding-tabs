define(["dojo/dom", "Utilities"], 
	function(dom, Utilities) {
		var currTabID;
		var currHeaderStyle = "color_main";
		var ABOUT_TAB_ID = 1006;
		var FAVS_TAB_ID = 1005;
		var HEADER_STYLES = {"1001" : "color_main", "1002" : "color_news", "1003" : "color_popular", 
            "1004" : "color_favorites", "1005" : "color_configuration", "1006" : "color_about"
        	/*, "1007" : "color_social", "1008" : "color_rate_us"*/};

		return {

			viewTransitioned: function(tabIDParam){					
				var newStyle = HEADER_STYLES[tabIDParam];

				currTabID = tabIDParam;

				if (newStyle) {
					Utilities.replaceStyles("floatHeader", newStyle, currHeaderStyle);
					currHeaderStyle = newStyle;
				}
				
			},

			aboutIsActive: function() {
				return currTabID === ABOUT_TAB_ID;				
			},

			favListIsActive: function() {
				return currTabID === FAVS_TAB_ID;				
			},

			getCurrentHeaderStyle: function() {
				return currHeaderStyle;
			}

		};

});
console.log("UIListener");

define(["dojo/ready", "dojo/dom", "dojo/on", "dojo/query", "dojo/dom-attr", "Config", "DetailView", "Utilities", "dojo/NodeList-traverse"], 
	function(ready, dom, on, query, domAttr, Config, DetailView, Utilities) {

	ready(function() {

		on(dom.byId("backBtn"), "touchstart", exitDetailView);
		on(dom.byId("page_main"), "click", enterMainDetailView);
		on(dom.byId("detail_btn_news"), "click", enterNewsDetailView);
		on(dom.byId("detail_btn_popular"), "click", enterPopularDetailView);
		on(dom.byId("detail_btn_favorites"), "click", enterFavoritesDetailView);
		on(dom.byId("spinner"), "touchstart", spinaround);
		on(dom.byId("page_about"), "click", Utilities.detectAnchorClick);


		DetailView.setUIListener(IntLis);
		IntLis.detailViewIsActive(false);
		

        var configItems1 = query(dom.byId("page_config")).children();
        var configItems = query(dom.byId("page_config")).children(".config_item");

        for (var i = configItems.length - 1; i >= 0; i--) {                
			on(configItems[i], "click", onConfigItemTapped);
        }

	});

	function onConfigItemTapped(e) {
		var nodeConfigValue = query(e.currentTarget).children(".configValueRight").first()[0];

		nodeConfigValue.innerHTML = nodeConfigValue.innerHTML === "Yes" ? "No" : "Yes";
	}

	// USE THIS FUNCTION TO ANIMATE THE SPINNER, WHILE MAKING AN AJAX CALL, FOR EXAMPLE. 
	function spinaround() {
		Utilities.addStyle("spinner", "spinner_spinning");

		setTimeout(function() {
			Utilities.removeStyle("spinner", "spinner_spinning");
		}, 3500);

	}

	function exitDetailView() {
		DetailView.show(false);
	}

	function enterMainDetailView() {
		DetailView.show(true, Config.getDummyText(0));
	}

	function enterNewsDetailView() {
		DetailView.show(true, Config.getDummyText(1));
	}

	function enterPopularDetailView() {
		DetailView.show(true, Config.getDummyText(2));
	}

	function enterFavoritesDetailView() {
		DetailView.show(true, Config.getDummyText(3));
	}

	var IntLis = function() {
		
		return {
			detailViewIsActive: function(isActive) {

				if (isActive) {

					if (Config.IS_ANDROID()) {
						Config.setBackButtonAction(exitDetailView);
					}

				} else {
					
					if (Config.IS_ANDROID()) {
						Config.setBackButtonAction_PromptToExit();
					}
				}
				
			}


		};

	}();

	return IntLis;

});

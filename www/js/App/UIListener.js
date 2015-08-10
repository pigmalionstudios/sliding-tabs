console.log("UIListener");

define(["dojo/ready", "dojo/dom", "dojo/on", "dojo/query", "dojo/dom-attr", "dijit/registry", "Config", "DetailView", "Utilities"], 
	function(ready, dom, on, query, domAttr, registry, Config, DetailView, Utilities) {

	ready(function() {

		setupSwitches();
		on(dom.byId("backBtn"), "click", exitDetailView);
		on(dom.byId("page_main"), "click", enterMainDetailView);
		on(dom.byId("detail_btn_news"), "click", enterNewsDetailView);
		on(dom.byId("detail_btn_popular"), "click", enterPopularDetailView);
		on(dom.byId("detail_btn_favorites"), "click", enterFavoritesDetailView);
		on(dom.byId("spinner"), "click", spinaround);

		DetailView.setUIListener(IntLis);
		IntLis.detailViewIsActive(false);
		
	});

	// USE THIS FUNCTION TO ANIMATE THE SPINNER, WHILE MAKING AN AJAX CALL, FOR EXAMPLE. 
	function spinaround() {
		Utilities.addStyle("spinner", "spinner_spinning");

		setTimeout(function() {
			Utilities.removeStyle("spinner", "spinner_spinning");
		}, 3500);

	}

	function setupSwitch(active, nodeID) {

		if (active) {
			registry.byId(nodeID).set("value", "on");
		}
		else {
			registry.byId(nodeID).set("value", "off");
		}

	}

	function setupSwitches() {
		setupSwitch(true, "switch3G");
		setupSwitch(false, "switchWifi");
		setupSwitch(true, "switchNotificaciones");
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

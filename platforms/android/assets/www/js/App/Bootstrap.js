define(["dojo/ready",
		"dojo/dom",
		"dojo/on",
		"Config",
		"UIListener",
		"Utilities",
		"SwipeManager",
		"PagesLayoutManager"
		], function(ready, dom, on, Config, UIListener, 
			Utilities, SwipeManager, PagesLayoutManager) {
			
			SwipeManager.setPagesLayoutManager(PagesLayoutManager);			
						
			ready(function(){
				var splash_timeout = 5000;
				
				document.documentElement.style.webkitTouchCallout = "none";
				document.documentElement.style.webkitUserSelect = "none";
				
				SwipeManager.refreshMenuWidth();
				PagesLayoutManager.resizePages();

				if (!Config.IS_ANDROID()) {
					setTimeout(navigator.splashscreen.hide, splash_timeout);
				}

			});		

});
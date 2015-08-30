define(["dojo/ready",
		"Config",
		"SwipeManager",
		"PagesLayoutManager",
		"UIListener"
		], function(ready, Config, SwipeManager, PagesLayoutManager) {
			
			SwipeManager.setPagesLayoutManager(PagesLayoutManager);			
						
			ready(function(){
				var splash_timeout = 5000;
				
				document.documentElement.style.webkitTouchCallout = "none";
				document.documentElement.style.webkitUserSelect = "none";
				
				SwipeManager.refreshMenuWidth();
				PagesLayoutManager.resizePages();

			});		

});
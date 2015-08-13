console.log("PagingManager");

define(["dojo/on", 
	"dojo/dom-class", "dojo/dom-construct", "dojo/dom", "Config", "Utilities"], 
	function(on, domClass, domConstruct, dom, Config, Utilities) {
		var pullToRefreshPanelId = "mensaje_cargando";
		var nextPageIsLoading = false;
		var STYLE_HOW_TO_PAGE_1 = "comoActualizar_paso1";
		var STYLE_HOW_TO_PAGE_2 = "comoActualizar_paso2";
		var STYLE_LOADING = "cargando";
		var currentStyle = STYLE_HOW_TO_PAGE_1;
		var page_counter = 0;//just to simulate a final page scenario
		
		function resetMessage() {
			setMessagePanelStyle(STYLE_HOW_TO_PAGE_1);
		}
		
		function setMessagePanelStyle(style) {

			if (currentStyle != style) {
				domClass.replace(pullToRefreshPanelId, style, currentStyle);
				currentStyle = style;

			}
			
		}

		function requestNextPage() {
			nextPageIsLoading = true;
			
			//You usually will write down here your ajax code to get the next page.
			//In the failure/success callback you need to execute PagingManager.enablePaging();
			
			setTimeout(function() {
				PagingManager.enablePaging();
			}, 1000);
		}

		var PagingManager = function() {

			return {
				onPagingGesture: function() {	
					
					if (PagingManager.canPage()) {
							console.log("get next page, disabling paging!");
						
						PagingManager.nextPage();
					}

				},

				canPage: function() {
					var canPag = false;
					
					if (!nextPageIsLoading) {
						canPag = true;
					}			

					return canPag;
				},

				enablePaging: function() {
					console.log("enablePaging!!!");
					resetMessage();
					nextPageIsLoading = false;
				},

				nextPage: function() {
					page_counter++;
					setTimeout(function() {						
						var isLastPage = page_counter > 15;
						
						requestNextPage(); 

						if (!isLastPage) {
							setMessagePanelStyle(STYLE_LOADING);
						}

						Utilities.show(pullToRefreshPanelId, !isLastPage);			
					}, 500);

				},

				releaseToPage: function() {
					setMessagePanelStyle(STYLE_HOW_TO_PAGE_2);
				},	  
				
				pullToPage: function() {
					setMessagePanelStyle(STYLE_HOW_TO_PAGE_1);
				}

			};
		}();

		return PagingManager;
});
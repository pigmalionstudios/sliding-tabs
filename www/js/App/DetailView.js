define(["dojo/on", "dojo/dom", "dojo/dom-attr", "dojo/dom-class", "Utilities", "ViewTransitionListener"], 
	function(on, dom, domAttr, domClass, Utilities, VTListener) {
	var UIListener;
	var listaFeedsVisible;
	var DetailView = function() {

		return {

			show: function(showDetail, text) {

				if (showDetail) {

					domClass.add("header_detail", "header " + VTListener.getCurrentHeaderStyle());
					domAttr.set("detail_body", "innerHTML", text);					

				} 				
				
				else {
					domClass.remove("header_detail");
					domAttr.set("detail_body", "innerHTML", "");					
				}

				Utilities.show("detail", showDetail);
				Utilities.show("master", !showDetail);

				listaFeedsVisible = !showDetail;
				
				UIListener.detailViewIsActive(showDetail);				
			},

			setUIListener: function(ifl) {
				UIListener = ifl;
			}

		};

	}();

	return DetailView;
});
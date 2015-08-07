define(["Utilities"], 
   function(Utilities) {


      var PagesLayoutManager = function() {

         return {

            resizePages: function() {
               var newMarginTopForPages = Utilities.getPropertyWithoutPX("floatHeader", "height");
               var winInnerHeight = Utilities.removePXFromString(window.innerHeight);
               var newHeightForPages = winInnerHeight - newMarginTopForPages;

               Utilities.setProperty("pages", "margin-top", newMarginTopForPages + "px");
               Utilities.setProperty("pages", "height", newHeightForPages + "px");
            }       
         };

      }();

      return PagesLayoutManager;
});
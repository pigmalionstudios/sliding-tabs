define(["dojo/ready", "dojo/dom-construct", "dojo/dom", "dojo/dom-attr", 
	"dojo/dom-class", "dijit/registry", "Utilities"], 
	function(ready, domConstruct, dom, domAttr, domClass, registry, Utilities) {

	var	isIOS;
	var	isAndroid;
	var isBlackberry10;
	var isAndroidV41x_Or_Superior;
	var backButtonAction;
	var menuButtonAction;
	var isIOSWithRenderingIssue;
	var dummyTextArray;

	ready(function() {
							console.log("CONFIG READY---");

		dummyTextArray = {};
		dummyTextArray[0] = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Typi non habent claritatem insitam; est usus legentis in iis qui facit eorum claritatem. Investigationes demonstraverunt lectores legere me lius quod ii legunt saepius. Claritas est etiam processus dynamicus, qui sequitur mutationem consuetudium lectorum. Mirum est notare quam littera gothica, quam nunc putamus parum claram, anteposuerit litterarum formas humanitatis per seacula quarta decima et quinta decima. Eodem modo typi, qui nunc nobis videntur parum clari, fiant sollemnes in futurum.";
		dummyTextArray[1] = "This is a dummy text for the NEWS SECTION of the app. You can put anything you want here, not just text!";
		dummyTextArray[2] = "This is a dummy text for the POPULAR SECTION of the app. You can put anything you want here, not just text!";
		dummyTextArray[3] = "This is a dummy text for the FAVORITES SECTION of the app. You can put anything you want here, not just text!";
		identifyPlatform();
		
		if (Config.IS_ANDROID()) {

			backButtonAction = function() {};
			document.addEventListener("backbutton", backButtonAction, false);
			Config.setBackButtonAction_PromptToExit();
			
		}

	});

	function identifyPlatform() {				
		var platformName = device.platform;
		
		isIOS = Utilities.contiene(platformName, "IOS");
		isAndroid = Utilities.contiene(platformName, "ANDROID") || Utilities.contiene(platformName, "Generic");//Generic para Ripple
		
		isAndroidV41x_Or_Superior = false;
   
        var versionMajor = parseInt(device.version[0]);
        var versionMiddle = parseInt(device.version[2]);
   
		if (isAndroid) {
			isAndroidV41x_Or_Superior =  (versionMajor >= 4) && (versionMiddle >= 1);

        } else if (isIOS) {
            isIOSWithRenderingIssue = versionMajor == 5 && versionMiddle == 1;
            
        } else {
        	var versionMajorBB10_Str = device.version.substring(0, 2);
        	var versionMajorBB10 = parseInt(versionMajorBB10_Str);

        	isBlackberry10 = (versionMajorBB10 >= 10);

        	            				console.log("versionMajorBB10_Str: " + versionMajorBB10_Str);

        }
						
						console.log("platform name: " + platformName);
						console.log("O.S. Version: " + device.version);
						console.log("versionMajor: " + versionMajor);
						console.log("versionMiddle: " + versionMiddle);
						console.log("isIOS? " + isIOS);
						console.log("isAndroid? " + isAndroid + " version " + device.version);
						console.log("isAndroidV41x_Or_Superior? " + isAndroidV41x_Or_Superior);
						console.log("isBlackberry10? " + isBlackberry10);    
						
	}
	
	var Config = function() {
		return {		
			IS_IOS: function() {return isIOS;},
            IS_IOS_WITHBAD_RENDERING_ISSUE: function() {return isIOSWithRenderingIssue;},
			IS_ANDROID: function() {return isAndroid;},
			IS_BB10: function() {return isBlackberry10;},
			IS_ANDROID_V41_OR_SUPERIOR: function() {return isAndroidV41x_Or_Superior;},			
			setBackButtonAction: function(paramFunction) {
				if (Config.IS_ANDROID()) {
					document.removeEventListener("backbutton", backButtonAction, false);
					backButtonAction = paramFunction;
					document.addEventListener("backbutton", backButtonAction, false);					
				}
			},
					
			setBackButtonAction_PromptToExit: function() {
				Config.setBackButtonAction(function() {
			
					navigator.notification.confirm(
						"¿Realmente querés salir?",// message
						function(buttonIndex){
							if (buttonIndex == 2) 
								{}
							else
								navigator.app.exitApp();
					    },  // callback
					    "Atención",// title
					    "Sí, No"// buttonName
					);
				}); 
			
			},

			setMenuButtonAction: function(func) {

				if (menuButtonAction)
					document.removeEventListener("menubutton", menuButtonAction, false);

				menuButtonAction = func;
				document.addEventListener("menubutton", menuButtonAction, false);
			},
			ABOUT_TAB_ID: 1006,
			FAVS_TAB_ID: 1005,
			MIN_TAB_ID: 1001,
            MAX_TAB_ID: 1006,
            TABS_NUMBER: 6,
            HEADER_STYLES: {"1001" : "color_main", "1002" : "color_news", "1003" : "color_popular", 
            "1004" : "color_favorites", "1005" : "color_configuration", "1006" : "color_about"
        	/*, "1007" : "color_about", "1008" : "color_about", "1009" : "color_about"*/},

            getDummyText: function(key) {
            	return dummyTextArray[key];
            }
		};	
	}();
	
	return Config;
});

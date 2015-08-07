define(["dojo/ready", "dojo/dom", "dojo/on", "dojox/gesture/tap", "Config", "Utilities", "ViewTransitionListener"],
    function (ready, dom, on, tap, Config, Utilities, VTListener) {
        var pages;
        var startDrag_X, endDrag_X, startDrag_Y;
        var MIN_TOLERANCE_X_FOR_SWIPE = 40;
        var TRANSITION_TIME = 300;
        var currentX_Offset = 0;
        var currentX_OffsetTabs = 0;
        var swipeStarted = false;
        var scrollStarted = false;
        var dragStarted = false;
        var cancelPullUp = false;
        var dragCounter;
        var ViewTransitionListener, PagesLayoutManager;
        var overscrolling;
        var movInfo = {};
        var swipeableTabs;
        var prevSelectedTabId;
        var menuTotalWidth = -1;
        var maxOffset, lastPageFirstTabId;
        var remainingOffset = 0;
        var swipe_Left;
        var MAX_SWIPE_OFFSET = -window.innerWidth * (Config.MAX_TAB_ID - Config.MIN_TAB_ID);
        var TABS_NUMBER = Config.MAX_TAB_ID - Config.MIN_TAB_ID + 1;
        var TAB_WIDTH_OFFSET = 29;

        ready(function () {
            var page_width = window.innerWidth + "px";

            if (!Config.IS_IOS()) {
                setMovementInfo();
            }

            pages = dom.byId("pages");
            swipeableTabs = dom.byId("swipeableTabs");
            prevSelectedTabId = Config.MIN_TAB_ID;

            Utilities.setProperty("page_main", "width", page_width);
            Utilities.setProperty("page_news", "width", page_width);
            Utilities.setProperty("page_popular", "width", page_width);
            Utilities.setProperty("page_favorites", "width", page_width);
            Utilities.setProperty("page_config", "width", page_width);
            Utilities.setProperty("page_about", "width", page_width);
            Utilities.setProperty(pages, "width", (window.innerWidth * (TABS_NUMBER + 1)) + "px");

            on(swipeableTabs, "click", tabSelected);
            on(pages, "touchstart", touchstartListener);
            on(pages, "touchmove", Config.IS_IOS() ? touchMoveListener_IOS : touchMoveListener_Android);
            on(pages, "touchend", Config.IS_IOS() ? touchEndListener_IOS : touchEndListener_Android);

        });

        function setMenuWidth() {
            var children = swipeableTabs.children;
            var childrenCount = children.length;
            var currNode;
            var widthCurrNode;
            var j = childrenCount - 1;
            var isBeyondMaxOffset = false;
            var currTotalWidth = 0;

            menuTotalWidth = 80;
            
            for (var i = 0; i < childrenCount; ++i) {
                currNode = children[i];
                widthCurrNode = getTabWidth(currNode.id);
                menuTotalWidth += widthCurrNode;
            }

            Utilities.setProperty(swipeableTabs, "width", menuTotalWidth + "px");
       
            while (j >= 0 && !isBeyondMaxOffset) {
                currNode = children[j];
                widthCurrNode = Utilities.getPropertyWithoutPX(currNode, "width");
                currTotalWidth += parseInt(widthCurrNode);

                if (currTotalWidth > window.innerWidth) {

                    isBeyondMaxOffset = true;
                    currNode = children[j + 4];
                    lastPageFirstTabId = currNode.id;
                    maxOffset = -1 * (menuTotalWidth - currTotalWidth);

                } else { 
                    --j; 
                }    

            }
            

        }

        function getTabWidth(tabID) {

            if (tabID && tabID !== "") {
                var currTab = dom.byId(tabID + "");
                var tabWidth = Utilities.getPropertyWithoutPX(currTab, "width");

                return parseInt(tabWidth) + TAB_WIDTH_OFFSET;   
            }
            
            return 0;
        }

        function evaluateCondition(tabId1, tabId2, evaluarPorMenorOIgual) {

            return evaluarPorMenorOIgual ? (tabId1 < tabId2) : (tabId1 >= tabId2);

        }

        function prevTabSelected() {
            
            if (prevSelectedTabId > Config.MIN_TAB_ID) {
                selectTabById(prevSelectedTabId - 1);
            }
            
        }

        function nextTabSelected() {
            
            if (prevSelectedTabId < Config.MAX_TAB_ID) {
                selectTabById(prevSelectedTabId + 1);
            }
            
        }

        function tabSelected(e) {
            var tabId = parseInt(e.srcElement.id);

            selectTabById(tabId, true);
        }

        function selectTabById(tabId, swipeScreenToo) {
            if (!isNaN(tabId) && tabId !== prevSelectedTabId) {
                   
                swipe_Left = tabId < prevSelectedTabId;

                var exit = false;
                var swipeTotalWidth = 0;
                var anchoSelectedTab = getTabWidth(tabId);
                var firstTabSelected = tabId === Config.MIN_TAB_ID;
                var distanceBetweenTabs;

                Utilities.setProperty("currTabSelected", "width", anchoSelectedTab + "px");

                if (menuTotalWidth === -1)
                    setMenuWidth();


                if (firstTabSelected) {

                    swipeTotalWidth = currentX_OffsetTabs;

                } else {


                    if (prevSelectedTabId === Config.MIN_TAB_ID) {

                        currentX_OffsetTabs = 30;

                    }

                    var tabIdAux = swipe_Left ? (prevSelectedTabId - 1) : prevSelectedTabId;

                    while (evaluateCondition(tabIdAux, tabId, !swipe_Left) && !exit) {
                        
                        swipeTotalWidth += getTabWidth(tabIdAux);
                        swipe_Left ? --tabIdAux : ++tabIdAux;

                    }

                    if (swipe_Left)
                        swipeTotalWidth *= -1;

                }

                distanceBetweenTabs = Math.abs(prevSelectedTabId - tabId);
                swipeTabs(swipeTotalWidth, TRANSITION_TIME);
                Utilities.setProperty(tabId + "", "opacity", "1");
                Utilities.setProperty(prevSelectedTabId + "", "opacity", "0.5");

                if (swipeScreenToo) {
                    swipe_Left ? SwipeManager.swipeLeft(TRANSITION_TIME, distanceBetweenTabs) : 
                                 SwipeManager.swipeRight(TRANSITION_TIME, distanceBetweenTabs);
                }

                Utilities.setProperty("currTabSelected", "left", firstTabSelected ? "0px" : 35 + remainingOffset + "px");
                prevSelectedTabId = tabId;
                VTListener.viewTransitioned(tabId);

            }
        }

        function touchstartListener(evt) {
            resetTouchFlags(true);
            startDrag_X = evt.clientX || evt.pageX;
            startDrag_Y = evt.clientY || evt.pageY;
        }

        function setMovementInfo(evt) {

            if (evt) {
                var endDrag_X_ = evt.clientX || evt.pageX;
                var endDrag_Y_ = evt.clientY || evt.pageY;
                var diffX = startDrag_X - endDrag_X_;
                var diffY_ = startDrag_Y - endDrag_Y_;
                var scrolledUp_, scrolledDown_, swipedLeft_, swipedRight_;
                var aux;

                if (diffY_ !== 0 && diffX !== 0) {

                    dragCounter++;

                    if (dragCounter == 1) {

                        aux = (Math.abs(diffY_) /*- 10*/ - Math.abs(diffX));
                        scrollStarted = aux > 0;

                        scrolledUp_ = scrollStarted && diffY_ < 0;
                        scrolledDown_ = scrollStarted && diffY_ > 0;
                        swipedLeft_ = !scrollStarted && diffX < 0;
                        swipedRight_ = !scrollStarted && diffX > 0;

                        movInfo = {
                            "scrolledUp": scrolledUp_,
                            "scrolledDown": scrolledDown_,
                            "swiped": swipedLeft_ || swipedRight_
                        };
                    }
                }

                movInfo.xDelta = diffX;
                movInfo.yDelta = diffY_;
/*

                console.log("--------------MovementInfo INICIO--------------");
                console.log("scrolledUp: " + movInfo.scrolledUp);
                console.log("scrolledDown: " + movInfo.scrolledDown);
                console.log("swiped: " + movInfo.swiped);
                console.log("xDelta: " + movInfo.xDelta);
                console.log("--------------MovementInfo FIN--------------");
*/
            } else {
                movInfo = {
                    "scrolledUp": false,
                    "scrolledDown": false,
                    "swiped": false,
                    "xDelta": 0,
                    "yDelta": 0,
                };
            }
        }

        function touchMoveListener_IOS(evt) {
            if (!cancelPullUp) {

                var endDrag_X_ = evt.clientX || evt.pageX;
                var endDrag_Y_ = evt.clientY || evt.pageY;
                var diffX = startDrag_X - endDrag_X_;
                var diffY_ = startDrag_Y - endDrag_Y_;
                var aux;

                if (diffY_ !== 0 || diffX !== 0) {
                    dragCounter++;
                    if (dragCounter == 1) {
                        aux = (Math.abs(diffY_) /*- 10*/ - Math.abs(diffX));
                        scrollStarted = aux > 0;
                    }
                }

                if (dragStarted) {

                    if (!scrollStarted) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        swipe(currentX_Offset - diffX, 0, 0);
                    }

                }
            }
        }

        function touchMoveListener_Android(evt) {

            if (!cancelPullUp) {

                setMovementInfo(evt);

                if (movInfo.swiped) {
                    evt.stopPropagation();
                    evt.preventDefault();
                    swipe(currentX_Offset - movInfo.xDelta, 0, 0);
                }
            }
        }

        function touchEndListener_IOS(evt) {

            endDrag_X = evt.clientX || evt.pageX;
            var diffX = startDrag_X - endDrag_X;

            if (!scrollStarted && swipeStarted) {
                if (diffX > MIN_TOLERANCE_X_FOR_SWIPE) {
                    SwipeManager.swipeRight();
                    nextTabSelected();
                } else if (diffX < -MIN_TOLERANCE_X_FOR_SWIPE) {
                    SwipeManager.swipeLeft();
                    prevTabSelected();
                } else {
                    cancelSwipe();
                }
            }

            resetTouchFlags(false);

        }

        function touchEndListener_Android() {

            if (movInfo.swiped) {
                if (movInfo.xDelta > MIN_TOLERANCE_X_FOR_SWIPE) {
                    SwipeManager.swipeRight();
                    nextTabSelected();
                } else if (movInfo.xDelta < -MIN_TOLERANCE_X_FOR_SWIPE) {
                    SwipeManager.swipeLeft();
                    prevTabSelected();
                } else {
                    cancelSwipe();
                }
            }

            resetTouchFlags(false);
            setMovementInfo();
        }

        function resetTouchFlags(flag) {
            swipeStarted = flag;
            scrollStarted = false;
            dragStarted = flag;
            dragCounter = 0;
            overscrolling = false;
        }

        function swipeTabs(x, speed) {
            var duration = (speed / 1000).toFixed(1) + "s";
            var oldOffset = remainingOffset;

            swipeableTabs.style.webkitTransitionDuration = duration;
            
            if (swipe_Left) {
                 remainingOffset += x;              
            } 
            
            var offsetIsSubZero = remainingOffset <= 0;

            if (offsetIsSubZero || !swipe_Left) {
                currentX_OffsetTabs -= x;

                if (swipe_Left && offsetIsSubZero) {
                    currentX_OffsetTabs -= oldOffset;
                }

                if (currentX_OffsetTabs <= maxOffset) {

                    if (swipe_Left) {
                        remainingOffset -= maxOffset - currentX_OffsetTabs;
                    } else {
                        remainingOffset += maxOffset - currentX_OffsetTabs;
                    }
                    
                    currentX_OffsetTabs = maxOffset;

                } else {
                    remainingOffset = 0;
                }

                swipeableTabs.style.webkitTransform = "translate3d(" + currentX_OffsetTabs + "px, 0px,0px)";

            }

            
        }

        function cancelSwipe() {
            swipe(currentX_Offset, 0, TRANSITION_TIME);
        }

        function swipe(x, y, speed) {
            if (x >= MAX_SWIPE_OFFSET && x <= 0) {
                var duration = (speed / 1000).toFixed(1) + "s";
                pages.style.webkitTransitionDuration = duration;
                pages.style.webkitTransform = "translate3d(" + x + "px," + y + "px, 0px)";
            }
        }

        function swipeLateral(swipeToLeft, time, multiplier) {

            if (!time)
                time = TRANSITION_TIME;

            if (!multiplier)
                multiplier = 1;

            if (swipeToLeft) {
                
                if (prevSelectedTabId > Config.MIN_TAB_ID) {
                    currentX_Offset += window.innerWidth * multiplier;
                }

            } else if (prevSelectedTabId < Config.MAX_TAB_ID) {
                currentX_Offset -= window.innerWidth * multiplier;
            }

            swipe(currentX_Offset, 0, time);

        }

        var SwipeManager = function () {
            return {

                swipeLeft: function (time, multiplier) {
                    swipeLateral(true, time, multiplier);
                },

                swipeRight: function (time, multiplier) {
                    swipeLateral(false, time, multiplier);                        
                },

                setViewTransitionListener: function (vtl) {
                    ViewTransitionListener = vtl;
                },

                setPagesLayoutManager: function (plm) {
                    PagesLayoutManager = plm;
                },

                refreshMenuWidth: function() {

                    setTimeout(function() {
                        var w = getTabWidth(prevSelectedTabId);

                        Utilities.setProperty("currTabSelected", "width", w + "px");
                        setMenuWidth();

                    }, 200);

                }

            };
        }();

        return SwipeManager;
    });

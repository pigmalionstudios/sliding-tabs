define(["dojo/ready", "dojo/dom", "dojo/on", "Config", "Utilities", "ViewTransitionListener", "PagingManager",
    "dojo/query", "dojo/dom-attr", "dojo/dom-construct", "dojo/NodeList-traverse"],
    function (ready, dom, on, Config, Utilities, VTListener, PagingManager, query, domAttr, domConstruct) {
        var pages;
        var startDrag_X, endDrag_X, startDrag_Y, startDrag_X_Tabs;
        var INSTANTANEOUS_TRANSITION_TIME = "0s";
        var MIN_TOLERANCE_X_FOR_SWIPE = 40;
        var PAGE_TRANSITION_TIME = "0.3s";
        var TAB_TRANSITION_TIME = PAGE_TRANSITION_TIME;
        var ENABLE_MANUAL_DRAG_ON_TABS = true; //this feature is still in beta, but go ahead and try it!
        var ENABLE_PULL_TO_REFRESH = true; //this feature is still in beta, but go ahead and try it!
        var currentX_Offset = 0;
        var currentX_OffsetTabs = 0;
        var currentX_OffsetTabsDragging = 0;
        var swipeStarted = false;
        var scrollStarted = false;
        var dragStarted = false;
        var cancelPullUp = false;
        var screenWasScrolledOrSwiped;
        var ViewTransitionListener, PagesLayoutManager;
        var overscrolling;
        var movInfo = {};
        var swipeableTabs, selectableTabs, tabsDraggingStarted;
        var prevSelectedTabId;
        var menuTotalWidth = -1;
        var tabsMaxOffset;
        var currTabSelectedOffsetLeft = 0;
        var swipe_Left;
        var lastManualTabSwipeDistance = 0;
        var MAX_SWIPE_OFFSET, MIN_TAB_ID, MAX_TAB_ID;
        var TAB_WIDTH_OFFSET = 29;
        var MIN_TAB_ID_OFFSET = 30;
        var DELTA_MIN_PARA_PAGINAR = -40;
        var CURR_SELECTED_TAB_BASE_OFFSET = 35;
        var MENU_BASE_WIDTH = 80;
        var evaluateScrollDown, evaluateScrollOnDemand;
        var transformY, overScrollJustStarted;
        var pagingGestureDetected = false;
        var lastTabSwipeWasTriggeredByTabSelection = true;
        var tabsWidth = {};

        ready(function () {
            var page_width = window.innerWidth + "px";
            var pages_array, tabs_array, firstTab, lastTab;

            pages = dom.byId("pages");
            swipeableTabs = dom.byId("swipeableTabs");
            selectableTabs = dom.byId("selectableTabs");

            pages_array = query(pages).children();
            tabs_array = query(selectableTabs).children(".tab");

            if (pages_array.length == tabs_array.length) {

                firstTab = tabs_array.first()[0];
                lastTab = tabs_array.last()[0];
                MIN_TAB_ID = parseInt(domAttr.get(firstTab, "id"));
                MAX_TAB_ID = parseInt(domAttr.get(lastTab, "id"));

                MAX_SWIPE_OFFSET = -window.innerWidth * (tabs_array.length - 1);

                prevSelectedTabId = MIN_TAB_ID;

                if (!Config.IS_IOS()) {
                    setMovementInfo();
                }

                for (var i = pages_array.length - 1; i >= 0; i--) {                
                    Utilities.setProperty(pages_array[i], "width", page_width);
                }

                Utilities.setProperty(pages, "width", (window.innerWidth * (tabs_array.length + 1)) + "px");

                on(selectableTabs, "click", tabSelected);

                if (ENABLE_MANUAL_DRAG_ON_TABS) {
                    on(swipeableTabs, "touchstart", touchstartListener_Tabs);
                    on(swipeableTabs, "touchmove", touchMoveListener_Tabs);
                    on(swipeableTabs, "touchend", touchEndListener_Tabs);
                }

                on(pages, "touchstart", touchstartListener);
                on(pages, "touchmove", Config.IS_IOS() ? touchMoveListener_IOS : touchMoveListener_Android);
                on(pages, "touchend", Config.IS_IOS() ? touchEndListener_IOS : touchEndListener_Android);


                if (ENABLE_PULL_TO_REFRESH) {
                    setupPullToRefresh("page_main");
                } else {
                    domConstruct.destroy("mensaje_cargando");
                }

            } else {

                navigator.notification.alert(
                    "The pages count (currently, " + pages_array.length + ") must match the tabs count (currently, " + tabs_array.length + ") . Check your index.html",// message
                    function() {}, // callback
                    "THIS IS A MESSAGE FOR YOU, DEV!",
                    "Ok"
                );

            }

        });

        function setupPullToRefresh(nodeId) {
            var node = dom.byId(nodeId);

            on(node, "touchend", touchEndListener_OverScrollBottom);

            if (Config.IS_IOS()) {
                on(node, "touchmove", touchMoveListener_OverScrollBottom_IOS);
                evaluateScrollDown = function () {};
                evaluateScrollOnDemand = function () {};
                transformY = function (y) {
                    return y;
                };

            } else {
                on(node, "touchmove", touchMoveListener_OverScrollBottom_Android);
                on(node, "touchstart", touchstartListener_OverScrollBottom);

                evaluateScrollDown = function () {
                    swipe(currentX_Offset, 0, PAGE_TRANSITION_TIME);
                };
                evaluateScrollOnDemand = function (y) {
                    swipe(currentX_Offset, y, INSTANTANEOUS_TRANSITION_TIME);
                };
                transformY = function (y, evt) {
                    var transformedY;

                    evt.stopPropagation();
                    evt.preventDefault();

                    if (y <= 0 && y >= -50) { //hasta -33

                        transformedY = (2 / 3) * y;

                    } else if (y < -50 && y >= -140) { //hasta -69

                        transformedY = -13 + (4 / 10) * y;

                    } else if (y < -140 && y >= -230) { //hasta -96

                        transformedY = -27 + (3 / 10) * y;

                    } else if (y < -230 && y >= -380) { //hasta -111

                        transformedY = -68 + (1 / 8) * y;

                    } else {

                        transformedY = -77 + (1 / 10) * y;

                    }

                    return transformedY;
                };
            }
        }

        function setMenuWidth() {
            var children = selectableTabs.children;
            var currNode;
            var widthCurrNode;
            var j = children.length - 1;
            var rightOffsetToPivotTab = 0;

            menuTotalWidth = MENU_BASE_WIDTH;
            
            for (; j >= 0; --j) {
                currNode = children[j];
                widthCurrNode = saveTabWidth(currNode);
                menuTotalWidth += widthCurrNode;

                if (rightOffsetToPivotTab === 0 && menuTotalWidth > window.innerWidth) {
                    rightOffsetToPivotTab = menuTotalWidth;
                }
            }

            tabsMaxOffset = -1 * (menuTotalWidth - rightOffsetToPivotTab);

            Utilities.setProperty(selectableTabs, "width", menuTotalWidth + "px");    
        }

        function saveTabWidth(node) {
            var w;

            if (node && node.id && node.id !== "") {
                var tabWidthWithoutOffset = Utilities.getPropertyWithoutPX(node, "width");
                w = parseInt(tabWidthWithoutOffset) + TAB_WIDTH_OFFSET;
                tabsWidth[node.id] = w;   
            }
            else {
                w = 0;
            }

            return w;
        }

        function getTabWidth(tabID) {
            var w = tabsWidth[tabID];

            if (!w) {
                w = 0;
            }
            
            return w;
        }

        function compareTabs(tabId1, tabId2, evaluarPorMenorOIgual) {
            return evaluarPorMenorOIgual ? (tabId1 < tabId2) : (tabId1 >= tabId2);
        }

        function prevTabSelected() {
            
            if (prevSelectedTabId > MIN_TAB_ID) {
                selectTabById(prevSelectedTabId - 1);
            }
            
        }

        function nextTabSelected() {
            
            if (prevSelectedTabId < MAX_TAB_ID) {
                selectTabById(prevSelectedTabId + 1);
            }
            
        }

        function tabSelected(e) {
            selectTabById(parseInt(e.srcElement.id), true);
        }

        function setSelectedTabWidth(tabId) {
            Utilities.setProperty("currTabSelected", "width", getTabWidth(tabId) + "px");
        }

        function selectTabById(tabId, swipeScreenToo) {

            if (!isNaN(tabId) && tabId !== prevSelectedTabId) {
                var swipeTotalWidth = 0;
                var firstTabSelected = tabId === MIN_TAB_ID;
                var distanceBetweenTabs;

                swipe_Left = tabId < prevSelectedTabId;
                setSelectedTabWidth(tabId);

                if (menuTotalWidth === -1) {
                    setMenuWidth();
                }

                if (firstTabSelected) {
                    swipeTotalWidth = currentX_OffsetTabs - currTabSelectedOffsetLeft;
                } else {

                    if (prevSelectedTabId === MIN_TAB_ID) {
                        currentX_OffsetTabs = MIN_TAB_ID_OFFSET;
                    }

                    var tabIdAux = swipe_Left ? (prevSelectedTabId - 1) : prevSelectedTabId;

                    while (compareTabs(tabIdAux, tabId, !swipe_Left)) {
                        
                        swipeTotalWidth += getTabWidth(tabIdAux);
                        
                        if (swipe_Left) {
                            --tabIdAux;
                        } else { 
                            ++tabIdAux;
                        }

                    }

                    if (swipe_Left) {
                        swipeTotalWidth *= -1;
                    }

                }

                distanceBetweenTabs = Math.abs(prevSelectedTabId - tabId);
                swipeTabs(swipeTotalWidth, TAB_TRANSITION_TIME);
                Utilities.setProperty(tabId + "", "opacity", "1");
                Utilities.setProperty(prevSelectedTabId + "", "opacity", "0.5");

                if (swipeScreenToo) {
                    swipeLateral(swipe_Left, PAGE_TRANSITION_TIME, distanceBetweenTabs);
                }

                setCurrTabSelectedOffsetLeft(firstTabSelected, currTabSelectedOffsetLeft);
                prevSelectedTabId = tabId;
                VTListener.viewTransitioned(tabId);

                if (ENABLE_MANUAL_DRAG_ON_TABS && !lastTabSwipeWasTriggeredByTabSelection) {
                    domConstruct.place("currTabSelected", "floatHeader");
                    lastTabSwipeWasTriggeredByTabSelection = true;
                }

            }
        }

        function setCurrTabSelectedOffsetLeft(firstTabSelected, offset) {
            Utilities.setProperty("currTabSelected", "left", firstTabSelected ? "0px" : (CURR_SELECTED_TAB_BASE_OFFSET + offset) + "px");
        }

        /*OVERSCROLL METHODS*/
        function touchstartListener_OverScrollBottom() {
            //console.log("touchstartListener_OverScrollBottom");
            overScrollJustStarted = true;
        }

        function handleOverscrollMovement(y, evt) {

            if (y <= 0) {

                var transformedY = transformY(y, evt);
                evaluateScrollOnDemand(transformedY);
                cancelPullUp = true;

                //console.log("transformedY: " + transformedY);

                if (transformedY < DELTA_MIN_PARA_PAGINAR) {
                    PagingManager.releaseToPage();
                    pagingGestureDetected = true;
                } else {
                    pagingGestureDetected = false;
                    PagingManager.pullToPage();
                }
            }

        }

        function overScrollDetected(evt) {
            return (evt.currentTarget.offsetHeight + evt.currentTarget.scrollTop) >= evt.currentTarget.scrollHeight;
        }

        function touchMoveListener_OverScrollBottom_IOS(evt) {

            if (PagingManager.canPage() && scrollStarted && overScrollDetected(evt)) {
                var endDrag_Y_ = evt.clientY || evt.pageY;
                var diffY = -1 * (startDrag_Y - endDrag_Y_);

                handleOverscrollMovement(diffY, evt);
            }

        }

        function touchMoveListener_OverScrollBottom_Android(evt) {

            if (PagingManager.canPage() && overScrollDetected(evt)) {

                setMovementInfo(evt);

                if (overscrolling || movInfo.scrolledDown) {

                    overscrolling = true;
                    handleOverscrollMovement(-movInfo.yDelta, evt);

                }
            }

        }

        function touchEndListener_OverScrollBottom() {

            if (cancelPullUp) {

                evaluateScrollDown();

                if (pagingGestureDetected) {
                    //console.log("NEXT PAGE!!!!");
                    PagingManager.onPagingGesture();
                    pagingGestureDetected = false;
                }

                cancelPullUp = false;
            }

        }

       /*OVERSCROLL METHODS*/
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

                if (diffY_ !== 0 && diffX !== 0 && !screenWasScrolledOrSwiped) {

                    var aux = (Math.abs(diffY_) - Math.abs(diffX));
                    scrollStarted = aux > 0;

                    var scrolledUp_ = scrollStarted && diffY_ < 0;
                    var scrolledDown_ = scrollStarted && diffY_ > 0;
                    var swipedLeft_ = !scrollStarted && diffX < 0;
                    var swipedRight_ = !scrollStarted && diffX > 0;

                    movInfo = {
                        "scrolledUp": scrolledUp_,
                        "scrolledDown": scrolledDown_,
                        "swiped": swipedLeft_ || swipedRight_
                    };
                
                    screenWasScrolledOrSwiped = true;
                }

                movInfo.xDelta = diffX;
                movInfo.yDelta = diffY_;

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


        function touchstartListener_Tabs(evt) {
            startDrag_X_Tabs = evt.clientX || evt.pageX;
            tabsDraggingStarted = true;
        }

        function touchEndListener_Tabs(evt) {
            var endDrag_X = evt.clientX || evt.pageX;
            var diffX = startDrag_X_Tabs - endDrag_X;
            
            if (diffX !== 0) {
                currentX_OffsetTabsDragging -= diffX;

                if (currentX_OffsetTabsDragging > 0) {
                    currentX_OffsetTabsDragging = 0;
                }

                lastManualTabSwipeDistance = diffX;
            }

            tabsDraggingStarted = false;
        }

        function touchMoveListener_Tabs(evt) {
            var endDrag_X_ = evt.clientX || evt.pageX;
            var diffX = startDrag_X_Tabs - endDrag_X_;

            evt.stopPropagation();
            evt.preventDefault();

            swipeTabsDragging(currentX_OffsetTabsDragging - diffX);
        }


        function swipeTabsDragging(x) {

            if (x >= tabsMaxOffset && x <= 0) {

                if (tabsDraggingStarted && lastTabSwipeWasTriggeredByTabSelection) {

                    domConstruct.place("currTabSelected", "swipeableTabs");
                    setCurrTabSelectedOffsetLeft(prevSelectedTabId === MIN_TAB_ID, currTabSelectedOffsetLeft - currentX_OffsetTabs);
                    swipeableTabs.style.webkitTransitionDuration = INSTANTANEOUS_TRANSITION_TIME;
                    lastTabSwipeWasTriggeredByTabSelection = false;
                    tabsDraggingStarted = false;

                }

                swipeableTabs.style.webkitTransform = "translate3d(" + x + "px, 0px,0px)";            

            }

        }


        function touchMoveListener_IOS(evt) {

            if (!cancelPullUp) {

                var endDrag_X_ = evt.clientX || evt.pageX;
                var endDrag_Y_ = evt.clientY || evt.pageY;
                var diffX = startDrag_X - endDrag_X_;
                var diffY_ = startDrag_Y - endDrag_Y_;

                if (diffY_ !== 0 || diffX !== 0 && !screenWasScrolledOrSwiped) {
                    var aux = (Math.abs(diffY_) - Math.abs(diffX));

                    scrollStarted = aux > 0;                    
                    screenWasScrolledOrSwiped = true;
                }

                if (dragStarted) {

                    if (!scrollStarted) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        swipe(currentX_Offset - diffX, 0, INSTANTANEOUS_TRANSITION_TIME);
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
                    swipe(currentX_Offset - movInfo.xDelta, 0, INSTANTANEOUS_TRANSITION_TIME);
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
            screenWasScrolledOrSwiped = false;
            overscrolling = false;
        }

        function swipeTabs(x) {
            var oldOffset = currTabSelectedOffsetLeft;

            swipeableTabs.style.webkitTransitionDuration = TAB_TRANSITION_TIME;
            
            if (swipe_Left) {
                currTabSelectedOffsetLeft += x;              
            } 
            
            var offsetIsSubZero = currTabSelectedOffsetLeft <= 0;
            var checkManualTabSlideInLastTabs = (lastManualTabSwipeDistance !== 0) && !offsetIsSubZero;

            if (offsetIsSubZero || !swipe_Left || checkManualTabSlideInLastTabs) {
                currentX_OffsetTabs -= x;

                if (swipe_Left) {

                    if (offsetIsSubZero) {
                        currentX_OffsetTabs -= oldOffset;
                    } else if (lastManualTabSwipeDistance !== 0) {
                        currentX_OffsetTabs += x;
                    }

                }

                if (currentX_OffsetTabs <= tabsMaxOffset) {

                    if (swipe_Left) {
                        currTabSelectedOffsetLeft -= tabsMaxOffset - currentX_OffsetTabs;
                    } else {
                        currTabSelectedOffsetLeft += tabsMaxOffset - currentX_OffsetTabs;
                    }
                    
                    currentX_OffsetTabs = tabsMaxOffset;

                } else {
                    currTabSelectedOffsetLeft = 0;
                }

                currentX_OffsetTabsDragging = currentX_OffsetTabs;
                lastManualTabSwipeDistance = 0;
                swipeableTabs.style.webkitTransform = "translate3d(" + currentX_OffsetTabs + "px, 0px,0px)";
 
            }

            
        }

        function cancelSwipe() {
            swipe(currentX_Offset, 0, PAGE_TRANSITION_TIME);
        }

        function swipe(x, y, duration) {
            if (x >= MAX_SWIPE_OFFSET && x <= 0) {
                pages.style.webkitTransitionDuration = duration;
                pages.style.webkitTransform = "translate3d(" + x + "px," + y + "px, 0px)";

                console.log("swipe: " + x + " - duration: " + duration);
            }
        }

        function swipeLateral(swipeToLeft, time, multiplier) {

            if (!time) {
                time = PAGE_TRANSITION_TIME;
            }

            if (!multiplier) {
                multiplier = 1;
            }

            if (swipeToLeft) {
                
                if (prevSelectedTabId > MIN_TAB_ID) {
                    currentX_Offset += window.innerWidth * multiplier;
                }

            } else if (prevSelectedTabId < MAX_TAB_ID) {
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
                        setMenuWidth();
                        setSelectedTabWidth(prevSelectedTabId);
                    }, 200);

                }

            };
        }();

        return SwipeManager;
    });

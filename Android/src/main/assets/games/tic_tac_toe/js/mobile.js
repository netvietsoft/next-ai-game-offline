var resizeTimer;
/*!
 * 
 * START MOBILE CHECK - This is the function that runs for mobile event
 * 
 */function checkMobileEvent(){($.browser.mobile||isTablet)&&($(window).off("orientationchange").on("orientationchange",(function(event){$("#canvasHolder").hide(),$("#rotateHolder").hide(),clearTimeout(resizeTimer),resizeTimer=setTimeout(checkMobileOrientation,1e3)})),checkMobileOrientation())}
/*!
 * 
 * MOBILE ORIENTATION CHECK - This is the function that runs to check mobile orientation
 * 
 */function checkMobileOrientation(){var isLandscape=!1;window.innerWidth>window.innerHeight&&(isLandscape=!0),$.editor.enable?viewport.isLandscape=edit.isLandscape:viewport.isLandscape=isLandscape,changeViewport(viewport.isLandscape),resizeGameFunc(),$("#canvasHolder").show()}
/*!
 * 
 * TOGGLE ROTATE MESSAGE - This is the function that runs to display/hide rotate instruction
 * 
 */function toggleRotate(con){con?$("#rotateHolder").fadeIn():$("#rotateHolder").fadeOut(),resizeGameFunc()}
var stageWidth,stageHeight=0,isLoaded=!1;
/*!
 * 
 * LOADER RESIZE - This is the function that runs to centeralised loader when resize
 * 
 */
function resizeLoaderFunc(){stageWidth=$(window).width(),stageHeight=$(window).height(),$("#mainLoader").css("left",checkContentWidth($("#mainLoader"))),$("#mainLoader").css("top",checkContentHeight($("#mainLoader")))}
/*!
 * 
 * BROWSER DETECT - This is the function that runs for browser and feature detection
 * 
 */
/*!
 * 
 * DOCUMENT READY
 * 
 */
$((function(){var resumeAudioContext=function(){try{"suspended"===createjs.WebAudioPlugin.context.state&&(createjs.WebAudioPlugin.context.resume(),window.removeEventListener("click",resumeAudioContext))}catch(e){console.error("There was an error while trying to resume the SoundJS Web Audio context..."),console.error(e)}};window.addEventListener("click",resumeAudioContext),"file"===window.location.protocol.substr(0,4)&&alert("To install the game just upload folder 'game' to your server. The game won't run locally with some browser like Chrome due to some security mode."),$(window).resize((function(){resizeLoaderFunc()})),resizeLoaderFunc(),checkBrowser()}));var browserSupport=!1,isTablet;function checkBrowser(){var canvasEl;isTablet=/ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(navigator.userAgent.toLowerCase()),deviceVer=getDeviceVer(),document.createElement("canvas").getContext&&(browserSupport=!0),browserSupport?isLoaded||(isLoaded=!0,initPreload()):$("#notSupportHolder").show()}
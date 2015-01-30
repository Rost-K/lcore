//Pushstate/hashbang handling
module.exports = {
    start: function () {
        //var prevHREF
        var handleAClick = function(e) {
            var filter = '[href^="#"], [href^="http:"], [href^="javascript:"], [href^="https:"]';
            if ($(this).is(filter)) return true;

            var routeStripper = /^[#\/]|\s+$/g;
            var rootStripper = /^\/+|\/+$/g;
            var href = $(this).attr('href');
            var i = href.indexOf("#");
            var path = href;
            e.preventDefault();
            if (i != -1) {
               path = href.substring(0, i);
            }
            if (path.length){
                e.preventDefault();
                core.routeURL(path);
            }
        }
        popped = false;
        initialURL = location.href;
        var handlePopState = function(e) {
            var initialPop = !popped && location.href == initialURL;
            popped = true;
            if ( initialPop ) return;
            var routeStripper = /^[#\/]|\s+$/g;
            var rootStripper = /^\/+|\/+$/g;
            var returnLocation = history.location || document.location;
            returnLocation = returnLocation.toString().replace(/^.*\/\/[^\/]+/, '');
            core.routeURL(returnLocation, true);
        }

        $(window).on('popstate', handlePopState);
        $(document).on("click", "a[href]", handleAClick);
    }

}

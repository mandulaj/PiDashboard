$(document).ready(function() {

    $("#widgets").owlCarousel({
        items: 6,
        itemsDesktop: [1199,4],
        itemsDesktopSmall: [979,3],
        itemsTablet: [768,2],
        itemsMobile: [479,1],
        navigation: true
    });

    $("#widget-button").click(function(){
        var w = $("#widgets");
        if(w.height())
        {
            w.css("height", "0px");
        }
        else
        {
            w.css("height", "215px");
        }
    })
});
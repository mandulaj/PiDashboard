window.pidash = {

    widgets: [
        {
            id: "#wg-cpuInfo",
            title: "CPU info!!!!",
            description: "<p>Get general info about your Pi's central processor.</p>",
        }   
    ],
    widgetsDown: false,
    wObjects:[]
}


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
            window.pidash.widgetsDown = false;
        }
        else
        {
            window.pidash.widgetsDown = true;
            w.css("height", "215px");
        }
    })
    
    for (var i = 0; i < window.pidash.widgets.length; i++)
    {
        window.pidash.wObjects.push(new Widget({
            id: window.pidash.widgets[i].id,
            title: window.pidash.widgets[i].title,
            description: window.pidash.widgets[i].description
        }));
        
        window.pidash.wObjects[i].render();
    }
    
});


function Widget(specs)
{
    var self = this;
    this.element = $(specs.id);
    this.id = specs.id; 
    this.title = specs.title;
    this.description = specs.description;
    
    this.element.find(".widget-top").mousedown(function(){
        self.element.parent().draggable()
    })
}

Widget.prototype.render = function()
{
    this.element.find(".widget-name").html(this.title)
    this.element.find(".widget-content").html(this.description)
}
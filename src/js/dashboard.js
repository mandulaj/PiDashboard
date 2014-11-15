window.pidash = {

  widgets: [{
      position: 0,
      id: "wg-cpuInfo",
      title: "CPU info",
      image: "cpuInfo.jpg",
      description: "<p>Get general info about your Pi's central processor.</p>",
      inCarousel: true
    }, {
      position: 1,
      id: "wg-ramInfo",
      title: "RAM info",
      image: "ramInfo.jpg",
      description: "<p>Is the Pi running slow? See how is your Pi's memory doing.</p>",
      inCarousel: true
    },

  ],
  widgetsDown: false,
  wObjects: []
};


$(document).ready(function() {
  'use strict';

  $("#widgets").owlCarousel({
    items: 6,
    itemsDesktop: [1199, 4],
    itemsDesktopSmall: [979, 3],
    itemsTablet: [768, 2],
    itemsMobile: [479, 1],
    navigation: true
  });

  var carousel = $("#widgets").data('owlCarousel');

  $("#widget-button").click(function() {
    var w = $("#widgets");
    if (w.height()) {
      w.css("height", "0px");
      window.pidash.widgetsDown = false;
    } else {
      window.pidash.widgetsDown = true;
      w.css("height", "273px");
    }
  });

  for (var i = 0; i < window.pidash.widgets.length; i++) {
    window.pidash.wObjects.push(new Widget(window.pidash.widgets[i], carousel));
  }

  $("#widgets").droppable({});

  $("#widgets").on("drop", function(event, ui) {
    console.log(ui);
    carousel.addItem(ui.draggable[0].outherHTML);
  });
});


function Widget(specs, parent) {
  'use strict';
  var self = this;
  this.position = specs.position;
  this.inCarousel = specs.inCarousel;
  this.id = specs.id;
  this.title = specs.title;
  this.description = specs.description;

  if (this.inCarousel) {
    parent.addItem(this.renderCarouselWidget());
  } else {

  }
  this.element = $("#" + specs.id);

  this.element.find(".widget-top").mousedown(function() {
    if (self.inCarousel) {
      console.log("Mouse");
      self.element.detach().appendTo("body");
      self.element.draggable({
        appendTo: "body"
      });
      var carousel = $("#widgets").data("owlCarousel");
      carousel.removeItem(self.position);
      self.inCarousel = false;
      $("#widgets").css("height", "273px");
    }
  });
}

Widget.prototype.renderCarouselWidget = function() {
  'use strict';
  return '<div class="widget" id=' + this.id + '> <div class="widget-top"><span class="widget-menu glyphicon glyphicon-align-justify"></span> <span class="widget-name">' + this.title + '</span></div> <div class="widget-content">' + this.description + '</div></div>';
};

Widget.prototype.renderWidget = function() {
  'use strict';
};
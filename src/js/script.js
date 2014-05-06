var RPi
function RaspberryPi(model)
{
    this.model = $( ".pi" );
    this.rotateX = 70;
    this.rotateY = 0;
    this.rotateZ = 40;


    this.traqball = new Traqball({
        stage: "stage",
        axis: [0.5,1,0,0.25],
        prespective: 1000
    });
    
    this.initSelf()
}

RaspberryPi.prototype.initSelf = function()
{
    var thisObj = this;
    
    $("#default_button").click(function(){
        thisObj.defaultPosition()
    });
}

RaspberryPi.prototype.defaultPosition = function()
{
    this.traqball.disable()
    this.model.addClass( "picontainer_mover" );
    this.model.css( "-webkit-transform", "rotateX(58deg) rotateY(0deg) rotateZ(45deg)");
    this.model.css( "transform", "rotateX(58deg) rotateY(0deg) rotateZ(45deg)" );
    var thisObj = this;
    setTimeout(function(){
        thisObj.model.removeClass( "picontainer_mover" );
        thisObj.traqball.activate();
    },500)
    
}

$(".sd").click(function(){
    this.addClass("sdout");
    alert("Hello")
})

$(document).ready(function()
{
    RPi = new RaspberryPi(".pi");
});

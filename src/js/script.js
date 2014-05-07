var RPi;

function RaspberryPi(model, 3dstage)
{
    this.model = $( model );
    this.rotateX = 70;
    this.rotateY = 0;
    this.rotateZ = 40;


    this.traqball = new Traqball({
        stage: 3dstage,
        //axis: [0.5,1,0,0.25],
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
});

function HWComponenet( id, rpi )
{
    this.parentRPi = rpi;
    this.element = $( id );
    this.moverClass = id+"-mover;"
    this.out = false;
}

HWComponent.prototype.animateOut = function()
{
    this.element.addClass(this.moverClass);
    this.out - true;
}


HWComponent.prototype.animateIn = function()
{
    this.element.removeClass(this.moverClass);
    this.out = false;
}

$(document).ready(function()
{
    RPi = new RaspberryPi(".pi", "stage");
});

var RPi;

function RaspberryPi(model, stage3d)
{
    this.model = $( model );
    this.rotateX = 70;
    this.rotateY = 0;
    this.rotateZ = 40;


    this.traqball = new Traqball({
        stage: stage3d,
        //axis: [0.5,1,0,0.25],
        prespective: 1000
    });
    
    this.components = {
        ethernet:   new HWComponent("ethernet", this),
        usb:        new HWComponent("usb", this),
        cpu:        new HWComponent("cpu", this),
        ram:        new HWComponent("ram", this),
        sd:         new HWComponent("sd", this)
    }
    this.initSelf();
}

RaspberryPi.prototype.initSelf = function()
{
    var thisObj = this;
    
    $("#default_button").click(function(){
        thisObj.defaultPosition();
    });   
};

RaspberryPi.prototype.defaultPosition = function()
{
    this.traqball.disable();
    this.model.addClass( "picontainer_mover" );
    this.model.css( "-webkit-transform", "rotateX(58deg) rotateY(0deg) rotateZ(45deg)");
    this.model.css( "transform", "rotateX(58deg) rotateY(0deg) rotateZ(45deg)" );
    var thisObj = this;
    setTimeout(function(){
        thisObj.model.removeClass( "picontainer_mover" );
        thisObj.traqball.activate();
    },500);
    

};

$(".sd").click(function(){
    this.addClass("sdout");
    alert("Hello");
});

function HWComponent( id, rpi )
{
    var thisObj = this;
    this.parentRPi = rpi;
    this.element = $("."+id );
    this.moverClassOut = id + "-mover-out";
    this.moverClassIn = id + "-mover-in";
    this.moverClassExt = id + "-ext";
    this.out = false;
    
    this.element.click(function () 
    {
        if (thisObj.out === false)
        {
            thisObj.parentRPi.defaultPosition();
            thisObj.parentRPi.traqball.disable();
            setTimeout(function() {
                thisObj.animateOut();
            }, 500);
        }
        else
        {
            thisObj.animateIn();
            setTimeout(function() {
                thisObj.parentRPi.traqball.activate();
            }, 500);
        }
    });
}

HWComponent.prototype.animateOut = function()
{
    var thisObj = this;
    this.element.addClass(this.moverClassOut);
    console.log("an" + this);
    this.element.bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
        console.log("animationOut end");
        console.log(thisObj);
        thisObj.element.addClass(thisObj.moverClassExt);
        thisObj.element.removeClass(thisObj.moverClassOut);
        thisObj.element.unbind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd");
    });
    this.out = true;    
};    

HWComponent.prototype.animateIn = function()
{
    var thisObj = this;
    this.element.removeClass(this.moverClassExt);
    this.element.addClass(this.moverClassIn);
    
    this.element.bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
        thisObj.element.removeClass(thisObj.moverClassIn);
        thisObj.element.unbind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd");
    });
    this.out = false;
};

$(document).ready(function()
{
    RPi = new RaspberryPi(".pi", "stage");
});

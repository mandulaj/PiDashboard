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
    
    this.sd = new HWComponent(".sd", this);
    this.initSelf();
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

function HWComponent( id, rpi )
{
    this.parentRPi = rpi;
    this.element = $( id );
    this.moverClassOut = id + "-mover-out";
    this.moverClassIn = id + "-mover-in";
    this.moverClassExt = id + "-ext";
    this.out = false;
}

HWComponent.prototype.animateOut = function()
{
    this.element.addClass(this.moverClassOut);
    this.element.addEventListener("animationend", this.elOut);
    this.out = true;    
}    

HWComponent.prototype.elOut = function() {
    console.log("animationOut end");
    this.addClass(this.moverClassExt);
    this.removeClass(this.moverClassOut);
    this.element.removeEventListener("animationend", this.elOut);
}



HWComponent.prototype.animateIn = function()
{
    this.elemetn.removeClass(this.moverClassExt);
    this.element.addClass(this.moverClassIn);
    this.element.addEventListener("animationend", this.elIn);
    this.out = false;
}

 HWComponent.prototype.elIn = function() {
     console.log("animationIn end");
     this.removeClass(this.moverClassIn);
     this.element.removeEventListener("animationend", this.elIn);
 }



$(document).ready(function()
{
    RPi = new RaspberryPi(".pi", "stage");
});

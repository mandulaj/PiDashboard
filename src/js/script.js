var RPi;

function RaspberryPi(model, stage3d)
{
    'use strict'
    var thisObj = this;
    this.model = $( model );
    this.rotateX = 70;
    this.rotateY = 0;
    this.rotateZ = 40;
    this.connected = true;
    this.infoBox = $(".info-content")
    
    this.processes = [];
    /*
    this.angHome  = angular.module("home",[]);
    this.angHome.controller('tableShowCtrl', function ( $scope ){
        $scope.procs = [];
        $scope.update = function(){
            $scope.procs = thisObj.processes;
        }
        //
        setInterval(function(){
            $scope.update();
            $scope.$apply();
        },1000)
        
    })

    
    */
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
    };
    
    /*
    this.ledsControl = {
        
        leds: [
            $("led1"),
            $("led2"),
            $("led3"),
            $("led4"),
            $("led5")
        ],
        ledTimer: setTimer(function(){
            if()
        },10)
    }*/
    
    
    
    this.initSelf();
    
    
    this.socket = io("/sysStat", {
      'query': 'token=' + sessionStorage.getItem("socketIOtoken")
    });
    this.socket.on("info", function(data){
        console.log(data)
        this.processes = data.processes;
    })

    this.socket.on("error", function(error) {
        console.log("error")
        if (error.type == "UnauthorizedError" || error.code == "invalid_token") {
            console.log("Invalid token")

        }
    })
    
}

RaspberryPi.prototype.initSelf = function ()
{
    'use strict'
    var thisObj = this;
    
    $("#default_button").click(function (){
        thisObj.defaultPosition();
    });  
    $("#logout_button").click(function(){
        sessionStorage.setItem("socketIOtoken", "")
    })
};

RaspberryPi.prototype.defaultPosition = function ()
{
    'use strict'
    //this.traqball.disable();
    this.model.addClass( "picontainer_mover" );
    this.model.css( "-webkit-transform", "rotateX(58deg) rotateY(0deg) rotateZ(45deg)");
    this.model.css( "transform", "rotateX(58deg) rotateY(0deg) rotateZ(45deg)" );
    var thisObj = this;
    setTimeout(function(){
        thisObj.model.removeClass( "picontainer_mover" );
        //thisObj.traqball.activate();
    },500);
    

};

RaspberryPi.prototype.hideAll = function()
{
    'use strict'
    for(var key in this.components)
    {
        var comp = this.components[key];
        if(comp.out)
        {
            comp.animateIn();
        }
    }
}

RaspberryPi.prototype.renderInfo = function(comp)
{
    if( comp == null)
    {
        this.infoBox.html("<div id='default_info_content'>Click one of the components on the model to get information about it.</div>")
    }
    else
    {
        this.infoBox.html("")
    }
}

function HWComponent( id, rpi )
{
    'use strict'
    var thisObj = this;
    this.parentRPi = rpi;
    this.id = id;
    this.element = $("."+id );
    this.moverClassOut = id + "-mover-out";
    this.moverClassIn = id + "-mover-in";
    this.moverClassExt = id + "-ext";
    this.out = false;
    

    
    this.element.click(function () 
    {
        thisObj.parentRPi.traqball.disable();
        
        if (thisObj.out === false)
        {
            thisObj.parentRPi.hideAll();
            thisObj.parentRPi.renderInfo(thisObj.id);
            if (thisObj.id == "cpu")
            {
                thisObj.parentRPi.components.ram.animateOut();
            }
            if (thisObj.id == "ram")
            {
                thisObj.parentRPi.components.cpu.animateOut();
            }
            
            thisObj.parentRPi.defaultPosition();
            setTimeout(function() {
                thisObj.animateOut();
            }, 500);
        }
        else
        {
            thisObj.parentRPi.renderInfo(null);
            if (thisObj.id == "cpu")
            {
                thisObj.parentRPi.components.ram.animateIn();
            }
            if (thisObj.id == "ram")
            {
                thisObj.parentRPi.components.cpu.animateIn();
            }
            thisObj.animateIn();
            setTimeout(function() {
                thisObj.parentRPi.traqball.activate();
                console.log("Activated")
            }, 500);
        }
    });
}

HWComponent.prototype.animateOut = function()
{
    'use strict'
    var thisObj = this;
    this.element.addClass(this.moverClassOut);
    this.element.bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){
        thisObj.element.addClass(thisObj.moverClassExt);
        thisObj.element.removeClass(thisObj.moverClassOut);
        thisObj.element.unbind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd");
    });
    this.out = true;    
};    

HWComponent.prototype.animateIn = function()
{
    'use strict'
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




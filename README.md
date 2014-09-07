[PiDashboard.js](https://github.com/zpiman/PiDashboard.js "PiDashboard.js") - Have your Pi under control
==============

Monitoring server for Raspberry Pi
# This Project has just started. **DOESN'T WORK YET!!!!** clone when this line is removed!! I will try to do this as fast as possible.


##What is it?

This project aims at delivering a beautiful interface for monitoring and controlling your raspberry pi remotely from anywhere. Want to check the temperature? No problem. Want to have a quick `top` overview of your pi? Just open a browser and type the IP of your Raspberry computer. We will do the rest and provide you with a beautiful and rich experience.

###Demo

Try a sort of working demo version of [PiDashboard.js](http://zpiman.github.io/PiDashboard.js)

##How to install?

From GitHub

```bash
    $ git clone git://github.com/zpiman/PiDashboard.js
    $ cd PiDashboard.js
    $ 
    $ # download & install all deps
    $ npm install
    $ 
    $ # download the client plugins
    $ bower install
    $ 
    $ # compile all the scripts and css
    $ gulp
```
###Useful links
* [Node.js](http://nodejs.org/)
    * [nodejs - GitHub](https://github.com/joyent/node)
    * [node - latest **binary** version for Raspberry Pi](https://gist.github.com/adammw/3245130)
* [Raspberry Pi Website](http://www.raspberrypi.org/)
    * [Raspberry Pi OS Downloads](http://www.raspberrypi.org/downloads)

##How to start the server?
```bash
    $ sudo node server.js &
```
##Usage

####Getting Help
Type `-h` or `--help` to get a small hint about the options.

####Choosing port
The default port is _3141_ so when the server starts without any parameters you should be able to access it at `https://localhost:3141`.
With `-p xxxx` the server launches on the specific port. However it is recommended to leave this in its default state except you know what you are doing.
The port can be customized in the `config/config.json` file.

####Running SSL
By default the server launches as an encrypted https server. If you plan to control your Pi over the internet it is strongly recommended to use SSL.
Create a `./keys/server.key` and `./keys/server.crt` using openssl. You can self-sign the certificate but get over with the warnings your browser will give you.
Add an `--key` or `--cert` option to specify other path to the files. By default the server looks for both files in the `./keys` directory. You can specify the path for each file after each option like so:
```bash
	$ sudo node PiDashboard.js --key test/keys/key.pem --cert test/keys/cert.pem
```	
Set `forceSSL` in the `config.json` to `false` to run the server in **http://** mode by default however as I said this is not a good idea in case you want to work over the internet. 
The app provides and SSH client which would be an open gate for anyone. Thus I recommend generating a 2048 bit RSA key and getting over with the browser pointing out the self signed certificate. 
However if you want to buy an certificate, go and do so. It will be only for your benefit

##Features
* SSL enabled
* Full live system overview
* CPU, GPU, RAM load & temperature
* Fun and slick GUI
* Custom Dashboard page with useful widgets
* Web SSH client
* Mobile compatibility
* Responsiveness
* Low resource requirements
* Process overview
* Useful graphs and time logs

##Changelog

######v0.0.2
* Added index.html file with a 3D Raspberry Pi model
* Base Framework for animating 3D elements

######v0.0.1
* Alpha testing
* + Help menu
* + SSL
* + Port configuration
* + `config.json` configuration file

##TODO
* update lib/PiDash.js to work with more then one client connection

##Credits
* [Jakub Mandula](https://github.com/zpiman/ "zpiman")


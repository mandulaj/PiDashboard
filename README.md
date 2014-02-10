[PiDashboard.js](https://github.com/zpiman/PiDashboard.js "PiDashboard.js") - Have your Pi under control
==============

Monitoring server for Raspberry Pi
###### This Project has just started. The first release will not happen until in about 2 weeks from now. _(10.2.2014)_


##What is it?

This project aims at delivering a beautiful interface for monitoring and controlling your raspberry pi remotely from anywhere. Want to check the temperature? No problem. Want to have a quick `top` overview of your pi? Just open a browser and type the IP of your Raspberry computer. We will do the rest and provide you with a beautiful and rich experience.

##How to install?

From GitHub

```bash
    $ git://github.com/zpiman/PiDashboard.js
    $ cd PiDashboard.js
    $ npm install -g
```
###Useful links
* [Node.js](http://nodejs.org/)
    * [nodejs - GitHub](https://github.com/joyent/node)
    * [node - latest **binary** version for Raspberry Pi](https://gist.github.com/adammw/3245130)
* [Raspberry Pi Website](http://www.raspberrypi.org/)
    * [Raspberry Pi OS Downloads](http://www.raspberrypi.org/downloads)

##How to start the server?
```bash
    $ sudo node PiDashboard.js &
```
##Usage

####Getting Help
Type `-h` or `--help` to get a small hint about the options.

####Choosing port
The default port is _3141_ so when the server starts without any parameters you should be able to access it at `localhost:3141`.
With `-p xxxx` the server launches on the specific port. However it is recommended to leave this in its default state except you know what you are doing.
If the port is not availabe a backup port `9090` is used. The ports can be customized in the `config.json` file.

####Running SSL
By default the server launches  as an unencrypted http/tcp server. If you plan to contol your Pi over the internet it is strongly recommended to use SSL.
Create a `./key.pem` and `cert.pem` using openssl. You can self-sign the certificate but get over with the warnings your browser will give you.
Add an `--key` or `--cert` option. By default the server looks for both files in the `./keys` directory. You can specify the path for each file after each option like so:
```bash
	$ sudo node PiDashboard.js --key test/keys/key.pem --cert test/keys/cert.pem
```	
Set `forceSSL` in the `config.json` to `true` to run the server in **https://** mode by default.

##Changelog
  
######v0.0.1
* Alpha testing
* ~~**No commits before main framework is done!!**~~
* + Help menu
* + SSL
* + Port configuration
* + `config.json` configuration file

######v0.0.2
* Added index.html file with a 3D Raspberry Pi model
* Base Framework for animating 3D elements

##Credits
* [Jakub Mandula](https://github.com/zpiman/ "zpiman")


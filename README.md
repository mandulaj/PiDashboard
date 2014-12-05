[PiDashboard](https://github.com/zpiman/PiDashboard "PiDashboard") - Have your Pi under control
==============

Monitoring server for Raspberry Pi

##What is it?

This project aims at delivering a beautiful interface for monitoring and controlling your Raspberry Pi remotely from anywhere. Want to check the temperature? No problem. Want to have a quick `top` overview of your Pi? Just open a browser and type the IP of your Raspberry Pi. We will do the rest and provide you with a beautiful and rich experience.

<p align="center">
  <a href="http://zpiman.github.io/PiDashboard">
    <img src="http://s1.postimg.org/pqef20he7/rpi.png" width= "50%" >
  </a>
</p>

###Demo

Try a sort of working demo version of [PiDashboard](http://zpiman.github.io/PiDashboard)

##How to install?

Via `npm`

```bash
    $ sudo npm install -g pi-dashboard
    $
    $ sudo PiDash
```

From GitHub

```bash
    $ git clone https://github.com/zpiman/PiDashboard
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


####Getting Help
Type `-h` or `--help` to get a small hint about the options.

####Choosing port
The default port is _3141_ so when the server starts without any parameters you should be able to access it at `https://localhost:3141`.
With `-p xxxx` the server launches on the specific port. It is recommended to leave this in its default state except you know what you are doing.
The port can be customized in the `config/config.json` file.

####Running SSL
By default the server launches as an encrypted https server. If you plan to control your Pi over the internet it is strongly recommended to use SSL.
Create a `./keys/server.key` and `./keys/server.crt` using openssl. We provide a small shell script to do this for you. You can self-sign the certificate but get over with the warnings your browser will give you.
You can specify the path for each file in the `config.json` file.

Set `forceSSL` in the `config.json` file to `false` to run the server in **http://** mode. However as I said, this is not a good idea in case you want to work over the internet.
The app provides and SSH client which would be an open gate for anyone. Thus I recommend generating a 2048 bit RSA key and getting over with the browser pointing out the self signed certificate.
If you want to buy an certificate, go and do so. It will be only for your benefit

##Features
* Easy to install and use
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

######v0.0.9
* Published PiDash on `npm`

######v0.0.7
* Too many updates to list here :)

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
* bring myself to work :P

##Credits
* [Jakub Mandula](https://github.com/zpiman/ "zpiman")

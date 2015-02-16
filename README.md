SELDON MOVIE DEMO
=================

A front end web site to provide a movie demo. This is one component of the Seldon VM see [http://docs.seldon.io/vm.html](http://docs.seldon.io/vm.html)

To view the movie images you will need an [http://embed.ly/](http://embed.ly/) key.
Replace the text ```<EMBEDLY_KEY_HERE>``` in ```app/scripts/controllers/main.js```

# Requirements 

Node - [http://nodejs.org](http://nodejs.org)
NPM - Node Package Manager
(I recommend installing these using your preferred OS package manager, such as apt or brew)

Also:
yo - the scaffolding tool from Yeoman
bower - the package management tool
grunt - the build tool

More info: [http://yeoman.io/learning/index.html](http://yeoman.io/learning/index.html)

# Getting Started 

Quick install:
```
npm -v      (to check npm is installed. I'm running 2.1.14)
npm install -g yo bower grunt-cli
npm install
bower install
```

This is an AngularJS project and all of the relevant dependancies are in the project directory (via Yeoman): [https://angularjs.org](https://angularjs.org)

The front end is using Bootstrap: [http://getbootstrap.com](http://getbootstrap.com)

To run the project locally during development (create a server at localhost:9000):

```
grunt serve
```

To build the project into /dist:

```
grunt build
```






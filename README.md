# **Story Narration** for IBM Bluemix
Developed at [RPI Cognitive Science Department][], a web application for exploring and narrating over knowledge graphs. It's main goal is to integrate cutting-edge narration technologies into an interactive website.

The project is a spin-off of [Knowledge Explorer][], a desktop app for building knowledge graphs. The app supports both AIMind XML format and [Knowledge API JSON Graph Structure](https://github.com/rellink/knowledge-api/wiki/Graph-Structure).

![Screenshot](https://cloud.githubusercontent.com/assets/891585/23149568/c56b31a8-f7ba-11e6-8154-11f36813bc63.PNG)

## How can you try it?
Just go to [https://rellink.mybluemix.net][], hosted by IBM Bluemix.

## Features
+ Visualize knowledge graph, with concepts colorized based on their degrees.
+ Display each concept's description, incoming and outgoing relationships.
+ Search by concept's name.
+ Make analogy from any pair of concept and visualize the result.

## Narration technologies
+ [Analogy][] - by [Craig Carlson][]

## Technology stack
+ jQuery
+ sigma.js
+ Node.js & Express

## Run the app locally
1. [Install Node.js][]
+ cd into this project's root directory
+ Run `npm install` to install the app's dependencies
+ Run `npm start` to start the app
+ Access the running app in a browser at <http://localhost:6001>

## Deploy to Bluemix
[![Deploy to Bluemix](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/rellink/story-narration) <- Simply hit the button

## Contributors
+ [Kasi Chonpimai][] - Developer
+ [Dr. Mei Si][] - Supervisor

[Knowledge Explorer]: https://github.com/smiled0g/knowledge-explorer
[RPI Cognitive Science Department]: http://www.cogsci.rpi.edu/
[https://rellink.mybluemix.net]: https://rellink.mybluemix.net
[Analogy]: https://github.com/rellink/analogy
[Install Node.js]: https://nodejs.org/en/download/

[Craig Carlson]: https://github.com/carlsc2
[Kasi Chonpimai]: https://github.com/smiled0g
[Dr. Mei Si]: http://si.hass.rpi.edu/

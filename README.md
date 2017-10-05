# [Awwwards](https://www.awwwards.com/) Analysis
[![Known Vulnerabilities](https://snyk.io/test/github/rubychi/awwwards-analysis/badge.svg)](https://snyk.io/test/github/rubychi/awwwards-analysis)
[![NSP Status](https://nodesecurity.io/orgs/rubychi/projects/d87aa7de-02c5-4c87-8f00-fdb5440c0f57/badge)](https://nodesecurity.io/orgs/rubychi/projects/d87aa7de-02c5-4c87-8f00-fdb5440c0f57)

This is a rough estimation for analyzing how active the participants are by dividing their submission by total population of each country in six award sections

## [Live Demo](https://awwwards-analysis.herokuapp.com/)

You can see a complete working example [here](https://awwwards-analysis.herokuapp.com/)

## Features

* Present analysis results of six award sections

  * Nominees
  * Honorable Mention
  * Developer Award
  * Site Of The Day
  * Site Of The Month
  * Site Of The Year

* Sort result by country name or by  percentage derived from dividing the submission by total population of each country

### Upcoming

* Visualize data on the world map

## Getting Started

Follow the instructions below to set up the environment and run this project on your local machine

### Prerequisites

* Node.js

### Installing

1. Download ZIP or clone this repo
```
> git clone https://github.com/rubychi/awwwards-analysis.git
```

2. Install dependencies via NPM
```
> npm install
```

3. Install gulp package globally to execute gulp command on your machine
```
> npm install gulp -g
```

4. Build a production version of the website (all files will be put inside the folder "docs")
```
> gulp build
```

5. Start the server and the service
```
> node server.js
```

6. See it up and running on http://localhost:3000

### To recrawl data, type the following command<br>
```
> gulp recrawl
```

## Deployment

1. Deploy to Heroku
```
> heroku create
> git push heroku master
```

2. Set up config vars for telling Heroku to use gulp in devDevependencies
```
> heroku config:set NPM_CONFIG_PRODUCTION=false
```

2. Open the app in the browser
```
> heroku open
```

### Alternatively

click this button to deploy to your Heroku server

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/rubychi/awwwards-analysis)

## Built With
### Frontend

* jquery
* d3 (v4)
* normalize.css
* materialize.css
* postcss

### Backend

* express
* compression
* helmet

### Utils

* gulp
* axios
* async-retry
* cheerio

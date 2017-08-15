# Awwwards Analysis

This is a rough estimation for analyzing how active the participants are in each country by dividing their submission by the total population of the country in each award section.

## [Live Demo](https://rubychi.github.io/awwwards-analysis/)

You can see a complete working example [here](https://rubychi.github.io/awwwards-analysis/)

## Features

* Present analysis results of six award sections

  * Nominees
  * Honorable Mention
  * Developer Award
  * Site Of The Day
  * Site Of The Month
  * Site Of The Year

* Sort result by country name or by  percentage derived from dividing the submission by total population of each country

* Responsive web design (RWD)

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

6. See it up and running on http://localhost:8080

## Built With

### Frontend

* jquery
* d3.js
* normalize.css
* materialize.css
* autoprefixer
* postcss

### Backend

* express

### Utils

* gulp
* babel
* axios
* cheerio
* async-retry
* mkdirp-promise

## Contributing

Contributions of any kind are welcome

## Author

**Ruby Chi**

## License

This project is licensed under the MIT License

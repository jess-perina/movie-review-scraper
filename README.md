# Movie Review Scraper

Web scraping Node.js app for finding word associations for critics movie reviews found on Rotten Tomatoes. By parsing reviews and finding the most frequently occuring words in fresh and rotten reviews we can highlighting the most praised and criticized aspects of a film. Ideally getting an sense of the reviewer's feelings in agregate.

Currently a work in progress.

## Getting Started

Clone the repo to your machine. You're all set :)

### Installing

A step by step series of examples that tell you how to get a development env running

1. Install the packages.

```
$ npm install
```

2. Go to index.js file and pass a movie title into the scraper

```
const movieTitle = 'hustlers_2019'
```

If you're looking for current movie options or titles run the following to see a list of movies opening this week and movies topping the box office

```
$ node getLinks.js
```

3. Start up the app

```
$ node index.js
```

Result:

Results are still raw.

```
{ fresh:
   [ [ 'kingsman', 25 ],
     [ 'circle', 17 ],
     [ 'sequel', 16 ],
     [ 'golden', 16 ],
     [ 'fun', 13 ],
     [ 'action', 12 ],
     [ 'vaughn', 11 ],
     [ 'matthew', 8 ],
     [ 'original', 7 ],
     [ 'good', 6 ],
     [ 'predecessor', 6 ],
     [ 'fans', 6 ],
     [ 'spy', 6 ],
     [ 'service', 5 ],
     [ 'violence', 5 ],
     [ 'violent', 4 ] ],
  rotten:
   [ [ 'kingsman', 25 ],
     [ 'circle', 21 ],
     [ 'golden', 21 ],
     [ 'sequel', 15 ],
     [ 'vaughn', 9 ],
     [ 'bloated', 7 ],
     [ 'work', 6 ],
     [ 'matthew', 6 ],
     [ 'action', 6 ],
     [ 'vaughns', 6 ],
     [ 'feels', 5 ],
     [ 'secret', 5 ],
     [ 'service', 5 ],
     [ 'spy', 5 ],
     [ 'bond', 5 ],
     [ 'people', 4 ] ] }
```

## Running the tests

Tests are forthcoming

## Built With

- [Nightmare](http://www.nightmarejs.org/)
- [vo](https://www.npmjs.com/package/vo)

## Still to come

- style - considering a switch to async await
- tests
- adding conditional stop words to remove things like names of actors and directors
- Integration and comparision of critics and audience reviews
- A larger integration of all movies opening / at the top of the box office so users can compare all movies and not look up one movie at a time

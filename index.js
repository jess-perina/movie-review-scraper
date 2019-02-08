const Nightmare =  require('nightmare');
const vo = require('vo');
const fs = require('fs');

const stopWords = require('./stopWords');

const nightmare = Nightmare({ show: true });
const rottenTomatoesURL = 'https://www.rottentomatoes.com/m/'
let movieTitle = 'kingsman_the_golden_circle'

// go to the page
// select view all reviews
// loop
  // grab the review text
  // sort into good and bad reviews
  // if there is a next button click it
// need to deal with last page (there will be no next button)

vo(run)(function(err, result) {
  if (err) throw err;
  console.dir(result);
});

function *run() {
  const movie = `${rottenTomatoesURL}${movieTitle}`;
  let reviewCompare = {fresh: {}, rotten: {}};
  let nextExists = true;
  let currPage = 1;

  // go to the page and select view all reviews
  yield nightmare
  .goto(movie)
  .wait(500)
  .click('.view_all_critic_reviews')
  .wait('body');

  nextExists = yield checkForValidNextButton();

  while (nextExists && currPage <= 12) {
    // grab review text and freshness 
    // add text to the correct reviewCompare object based on freshnness
    let reviewName = yield nightmare
    .evaluate((data) => {
        Array.from(document.querySelectorAll('.review_container')).forEach(review => {
          let freshness = review.querySelector('div').getAttribute('class').split(' ')[3];
          let content = review.getElementsByClassName('the_review')[0].innerText;
          let words = content.replace(/[.,\/#!$%\^&\*'";:{}=\-_`~()]/g, '').toLowerCase().split(/\s+/);

          for (let i = 0; i < words.length; i++){
            if (data[freshness].hasOwnProperty(words[i])){
                data[freshness][words[i]][1]++;
            } else {
                data[freshness][words[i]] = [words[i], 1];
            }
          }
        });

        return {data: data};
    }, reviewCompare);
    reviewCompare = Object.assign(reviewCompare, reviewName.data);

    // if there is a next button click it
    yield nightmare
    .click('span[class="pageInfo"] + a')
    .wait('body');

    currPage++;
    nextExists = yield checkForValidNextButton();
  }
  yield nightmare.end();

  const popularWords = handleResult(reviewCompare);

  return popularWords;
}

// checkForValidNextButton returns a boolean indicating if the current page
// has a valid href leading to the next page
const checkForValidNextButton = () => {
  const result = nightmare.evaluate(() => {
    let href = document.querySelector('span[class="pageInfo"] + a').href;
    return href.charAt(href.length - 1) !== '#';
  });
  return result
}

const handleResult = (reviewCompare) => {
  let commonlyUsedWords = {
    fresh: [],
    rotten: []
  };

  // let commonlyUsedWords = {
  //   critics: {
  //     fresh: [],
  //     rotten: []
  //   },
  //   audience: {
  //     fresh: [],
  //     rotten: []
  //   }
  // }

  // filter out the stop words add non stop words to commonlyUsed words object
  filterOutStopWords(reviewCompare, commonlyUsedWords)

  let sortedFresh = sortReviews(commonlyUsedWords.fresh);
  let sortedRotten = sortReviews(commonlyUsedWords.rotten);

  let popularWords = getMostPopularWords(sortedFresh, sortedRotten, 16)

  // for test purposes to better see what the returned text looked like
  writeResultToFile('reviews.txt', JSON.stringify(popularWords));

  return popularWords;
}

const filterOutStopWords = (reviews, list) => {
  Object.keys(reviews).forEach(freshness => {
    Object.values(reviews[freshness]).forEach(word => {
      let isStopWord = checkIfStopWord(word[0])
      if (!isStopWord) {
        addWordToList(list[freshness], word);
      }
    });
  });
}

const checkIfStopWord = (word) => {
  return stopWords.includes(word);
}

const addWordToList = (list, word) => {
  list.push(word)
}

const sortReviews = (reviews) => {
  return reviews.sort(sortOccurances)
}

// sort most commonly used words to the front
const sortOccurances = (a, b) => b[1] - a[1];

const getMostPopularWords = (sortedFresh, sortedRotten, quantity) => {
  let popularWords = {
    fresh: sortedFresh.slice(0, quantity),
    rotten: sortedRotten.slice(0, quantity)
  };
  return popularWords
}

const writeResultToFile = (fileName, result) => {
  fs.writeFile(fileName, result, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });
}

// things that need to be done:
  // tweak the stop words for the topic (remove words like film, movie, films, filmmaker, etc.)
  // need to conditionally remove the names of directors and actors
  // currently not getting the last page of reviews
  // pass movie name into function

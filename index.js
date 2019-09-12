const Nightmare = require('nightmare')
const vo = require('vo')
const fs = require('fs')

const stopWords = require('./stopWords')

const nightmare = Nightmare({
  // openDevTools: {
  //   mode: 'detach'
  // },
  show: true
})
const rottenTomatoesURL = 'https://www.rottentomatoes.com/m/'
const movieTitle = 'hustlers_2019'

// go to the page
// select view all reviews
// loop
// grab the review text
// sort into good and bad reviews
// if there is a next button click it
// need to deal with last page (there will be no next button)

vo(run)(function(err, result) {
  if (err) throw err
  console.dir(result)
})

function* run() {
  const movie = `${rottenTomatoesURL}${movieTitle}`
  let reviewCompare = { fresh: {}, rotten: {} }
  let nextExists = true
  let currPage = 1

  // go to the page and select view all reviews
  yield getMovieReviews(movie)

  nextExists = yield checkForValidNextButton()

  while (nextExists && currPage <= 4) {
    // grab review text and freshness
    // add text to the correct reviewCompare object based on freshnness
    let reviewName = yield handleReviews(reviewCompare)
    reviewCompare = Object.assign(reviewCompare, reviewName.data)

    // if there is a next button click it
    yield clickNextButton()

    currPage++
    nextExists = yield checkForValidNextButton()
  }
  yield nightmare.end()

  const popularWords = handleResult(reviewCompare)

  return popularWords
}

function getMovieReviews(movie) {
  return nightmare
    .goto(movie)
    .wait(500)
    .click('.view_all_critic_reviews')
    .wait('body')
}

// checkForValidNextButton returns a boolean indicating if the current page
// has a valid href leading to the next page
// FIX:
function checkForValidNextButton() {
  return nightmare.evaluate(() => {
    try {
      var href = document.querySelector('span[class="pageInfo"] + a').href
    } catch (error) {
      console.log(error, 'movie only has one page of reviews')
      throw new Error('movie only has one page of reviews')
    }
    return href.charAt(href.length - 1) !== '#'
  })
}

function handleReviews(reviewCompare) {
  return nightmare.evaluate(data => {
    Array.from(document.querySelectorAll('.review_container')).forEach(
      review => {
        // let freshness = getFreshness(review);
        // let content = getContent(review);
        // let words = getWords(content);
        let freshness = review
          .querySelector('div')
          .getAttribute('class')
          .split(' ')[3]
        let content = review.getElementsByClassName('the_review')[0].innerText
        let words = content
          .replace(/[.,\/#!$%\^&\*'";:{}=\-_`~()]/g, '')
          .toLowerCase()
          .split(/\s+/)

        // allocateWords(words, freshness, data)
        words.forEach(word => {
          if (data[freshness].hasOwnProperty(word)) {
            data[freshness][word][1]++
          } else {
            data[freshness][word] = [word, 1]
          }
        })
      }
    )

    return { data: data }
  }, reviewCompare)
}

function getFreshness(review) {
  return review
    .querySelector('div')
    .getAttribute('class')
    .split(' ')[3]
}

function getContent(review) {
  return review.getElementsByClassName('the_review')[0].innerText
}

function getWords(content) {
  return content
    .replace(/[.,\/#!$%\^&\*'";:{}=\-_`~()]/g, '')
    .toLowerCase()
    .split(/\s+/)
}

function allocateWords(words, freshness, data) {
  words.forEach(word => {
    if (data[freshness].hasOwnProperty(word)) {
      data[freshness][word][1]++
    } else {
      data[freshness][word] = [word, 1]
    }
  })
}

function clickNextButton() {
  return nightmare.click('span[class="pageInfo"] + a').wait('body')
}

function handleResult(reviewCompare) {
  let commonlyUsedWords = {
    fresh: [],
    rotten: []
  }

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

  let sortedFresh = sortReviews(commonlyUsedWords.fresh)
  let sortedRotten = sortReviews(commonlyUsedWords.rotten)

  let popularWords = getMostPopularWords(sortedFresh, sortedRotten, 16)

  // for test purposes to better see what the returned text looked like
  writeResultToFile('reviews.txt', JSON.stringify(popularWords))

  return popularWords
}

function filterOutStopWords(reviews, list) {
  Object.keys(reviews).forEach(freshness => {
    Object.values(reviews[freshness]).forEach(word => {
      let isStopWord = checkIfStopWord(word[0])
      if (!isStopWord) {
        addWordToList(list[freshness], word)
      }
    })
  })
}

function checkIfStopWord(word) {
  return stopWords.includes(word)
}

function addWordToList(list, word) {
  list.push(word)
}

// sort most commonly used words to the front
const sortOccurances = (a, b) => b[1] - a[1]

function sortReviews(reviews) {
  return reviews.sort(sortOccurances)
}

function getMostPopularWords(sortedFresh, sortedRotten, quantity) {
  let popularWords = {
    fresh: sortedFresh.slice(0, quantity),
    rotten: sortedRotten.slice(0, quantity)
  }
  return popularWords
}

function writeResultToFile(fileName, result) {
  fs.writeFile(fileName, result, err => {
    if (err) throw err
    console.log('The file has been saved!')
  })
}

// things that need to be done:
// tweak the stop words: need to conditionally remove the names of directors and actors
// currently not getting the last page of reviews, which also means no results on movies that have only one page of reviews
// add CLI functionality
// pass movie name into function

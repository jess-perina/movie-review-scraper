const Nightmare =  require('nightmare');
const vo = require('vo');
const fs = require('fs');

// go to the page
// select view all reviews
// loop
  // grab the review text
  // if there is a next button click it
// need to deal with last page (there will be no next button)

vo(run)(function(err, result) {
  if (err) throw err;
});

function *run() {
  const nightmare = Nightmare({ show: true });
  const movie = 'https://www.rottentomatoes.com/m/mother_2017';

  let nextExists = true;
  let currPage = 1;
  let reviews = [];

  // go to the page
  // select view all reviews
  yield nightmare
  .goto(movie)
  .wait(500)
  .click('.view_all_critic_reviews')
  .wait('body');

  // extract this into s function (I think nightmare calls it an action)
  // check to see if the next button has a valid href
  nextExists = yield nightmare.evaluate(() => {
    let href = document.querySelector('span[class="pageInfo"] + a').href;
    return href.charAt(href.length - 1) !== '#';
  });

  // TODO: currently not getting the last page
  while (nextExists && currPage <= 12) {
    // grab the review text
    reviews.push(yield nightmare
      .evaluate(() => {
          let pageReviews = Array.from(document.querySelectorAll('.the_review')).map(el => el.innerText);
          return pageReviews;
        })
    );

    // if there is a next button click it
    yield nightmare
    .click('span[class="pageInfo"] + a')
    .wait('body');

    currPage++;
    nextExists = yield nightmare.evaluate(() => {
      let href = document.querySelector('span[class="pageInfo"] + a').href;
      return href.charAt(href.length - 1) !== '#';
    });
  }

  yield nightmare.end();

  // for test purposes to better see what the returned text looked like
  fs.writeFile('reviews.txt', reviews, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  });

  console.dir(reviews);
}

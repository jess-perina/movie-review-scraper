const Nightmare =  require('nightmare');
const nightmare = Nightmare({ show: false });

  // go to the page
  // gather all the links from top of the box office
const getLinks = nightmare
  .goto('https://www.rottentomatoes.com')
  .wait('body')
  .evaluate(() => {
    const gatherLinks = (category) => Array.from(document.getElementById(category).getElementsByClassName('sidebarInTheaterOpening')).map(movie => movie.querySelector('a').href);

    let openingThisWeek = gatherLinks('homepage-opening-this-week');
    let topOfTheBoxOffice = gatherLinks('homepage-top-box-office');

    return [openingThisWeek, topOfTheBoxOffice];
  })
  .end()
  .then((result) => {
    console.log(result);
  })
  .catch(err => console.error(err));

module.exports = getLinks;

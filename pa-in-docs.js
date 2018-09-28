// Libraries
const nc = require('norch-crawlers')
const request = require('request')
const cheerio = require('cheerio')
const jsonfile = require('jsonfile')
const fs = require('fs');

// Constants
const file = 'urls-pa-in.json'
const  wstream = fs.createWriteStream('docs-pa-in.str')

// Variables
let startIterator = 0
let obj = {}

// Events
wstream.on('finish', function () {
  console.log('file has been written')
})


// Read files with recipes URL's and call crawlRecipe()
jsonfile.readFile(file, function(err, obj) {
  if(err) {
    console.log('Error in jsonfile:\n' + err);
    return;
  }
  //console.dir(obj.urls[1])
  // Call crawl-recipe function
  crawlRecipe(obj.urls, startIterator)
})


// Crawl if any items left in URL array
function crawlRecipe (urlArray, iterator) {
  console.log('url           : ' + urlArray[iterator])
  console.log('arrayLength -1: ' + (urlArray.length - 1))
  console.log('iterator      : ' + iterator)
  // Crawl another if more in array. If not stop
  if (iterator === urlArray.length - 1) {
    console.log('Finished!')
    wstream.end()
    return
  }
  if (iterator < urlArray.length - 1) {
     requestContent (urlArray[iterator], urlArray, iterator)
  }
}

// Get HTML from server
function requestContent (requestUrl, urlArray, iterator) {
  request(requestUrl, nc.headerOptions, function (error, response, body) {
    console.log('error:', error)
    let $ = cheerio.load(body)
    populateObject($, requestUrl, obj)
    let jsonObj = JSON.stringify(obj)
    wstream.write(jsonObj + '\n')
    // Play nice and crawl another page
    iterator++
    sleep(2000).then(() => {
      crawlRecipe(urlArray, iterator)
    })
  })
}

// Cheerio selectors, populating 'obj'
function populateObject ($, requestUrl, obj) {
    //obj.title        = $('.recipeContent h1').text()
    obj.paragraphs  = []
    $('.mw-parser-output > p').each(function (index, element) {
      let paragraph = $(element).text()
      obj.paragraphs.push(paragraph)
    })
    // Is this what we wanted?
    console.dir(obj)
}

// Sleep aka Play nice-function. Time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

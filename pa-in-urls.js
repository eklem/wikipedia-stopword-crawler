// Libraries
const nc = require('norch-crawlers');
const request = require('request')
const cheerio = require('cheerio')


// Variables
let domain = 'https://pa.wikipedia.org/'
let startURL = 'https://pa.wikipedia.org/w/index.php?title=%E0%A8%96%E0%A8%BC%E0%A8%BE%E0%A8%B8:%E0%A8%B8%E0%A8%BE%E0%A8%B0%E0%A9%87_%E0%A8%B8%E0%A8%AB%E0%A8%BC%E0%A9%87&hideredirects=1'
let urls = []
let pageCrawled = 0
const file = 'urls-pa-in.json'
const headerOptions = {
  headers: {
    'User-Agent': 'NorchCrawlersBot/0.0.3 (+https://eklem.github.io/wikipedia-github-crawlers/)',
    'from': 'espen.klem@gmail.com'
  }
}


crawlUrls(startURL, urls)

function crawlUrls(requestUrl, urls) {
  request(requestUrl, headerOptions, function (error, response, body) {
    if (error) {
      console.log('error:', error);
    }
    console.log('Page crawled: ' + requestUrl)
    console.log('statusCode:', response && response.statusCode);

    // Get content and push to array urls[]
    let $ = cheerio.load(body)
    $('div.mw-allpages-body ul.mw-allpages-chunk li a').each(function (index, element) {
      if (!$(element).hasClass('mw-redirect')) {
        urls.push(domain + $(element).attr('href'))
      }
    })

    let nextPage = ''
    var nextPageExists = 0
    $('div.mw-allpages-nav a').each(function (index, element) {
      if (nc.matchStringToPattern($(element).text(),'ਅਗਲਾ ਸਫ਼ਾ') && nextPage === '') {
        nextPageExists++
        nextPage = domain + $(element).attr('href')
      }
    })
    console.log('next page: ' + nextPage)
    console.log('next pag exists: ' + nextPageExists)

    if (nextPageExists > 0) {
      pageCrawled++
      console.log('Pages crawled: ' + pageCrawled)
      nc.playNice(5000).then(() => {
        crawlUrls(nextPage, urls)
      })
    } else if (nextPageExists === 0) {
      console.log(nextPage)
      // Write to file
      nc.writeJSON(urls, file)
    }
  })
}

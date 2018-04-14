// Libraries
const nc = require('norch-crawlers');
const request = require('request')
const cheerio = require('cheerio')


// Variables
let domain = 'http://no.wikipedia.org'
let startURL = 'https://no.wikipedia.org/w/index.php?title=Spesial:Alle_sider&from='
let urls = []
const file = 'no-nb-urls.json'
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
      if (nc.matchStringToPattern($(element),'Neste side') && nextPage === '') {
        nextPageExists++
        nextPage = domain + $(element).attr('href')
      }
    })
    console.log('next page: ' + nextPage)
    console.log('next pag exists: ' + nextPageExists)

    if (nextPageExists > 0) {
      nc.playNice(2000).then(() => {
        crawlUrls(nextPage, urls)
      })
    } else if (nextPageExists === 0) {
      console.log(nextPage)
      // Write to file
      nc.writeJSON(urls, file)
    }
  })
}

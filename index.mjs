import { promises as fs } from 'fs'
import puppeteer from 'puppeteer'
import Queue from 'p-queue'

const headless = true
const numberOfClicksOnLoadMore = 20
const workerCount = 4

async function findExistingTranscript({ filename }) {
    try {
        const stat = await fs.stat(`./transcripts/${filename}.json`)
        return true
    } catch (e) {
        if (e.code === 'ENOENT') {
            return false
        }

        console.error(`uncaught error in findExistingTranscript`, e)
    }
}

async function scrapeEarningCall(url, browser) {
    const page = await browser.newPage()
    await page.goto(url)
    const text = await page.$$eval('.tailwind-article-body > p', paragraphs => {
        return paragraphs.map(d => d.innerText).join('\n\n')
    })
    await page.close()
    return text
}

async function clickLoadMoreCallsUntilEnd(page, maxClicks, clicksSoFar = 0) {
    const loadMoreButtonSelector = 'button[data-url]'
    await page.click(loadMoreButtonSelector)
    await page.waitForNetworkIdle()
    const button = await page.$(loadMoreButtonSelector)
    const hasReachedMaxClicks = clicksSoFar >= maxClicks
    if (button && !hasReachedMaxClicks) {
        return clickLoadMoreCallsUntilEnd(page, maxClicks, clicksSoFar + 1)
    }

    return null
}

async function scrapeEarningCallsMeta(maxClicks = Infinity) {
    const browser = await puppeteer.launch({ headless })
    const page = await browser.newPage()
    await page.goto('https://www.fool.com/earnings-call-transcripts/')

    await clickLoadMoreCallsUntilEnd(page, maxClicks)
    const meta = await page.$$eval('a.text-gray-1100[href^="/earnings/call-transcripts"]', calls => {
        return calls.map(call => {
            const href = call.getAttribute('href')
            const h5 = call.querySelector('h5')
            const h5Text = h5.innerText
            const h5Matches = h5Text.match(/(.*)\s\(([A-Z]*)\)\sQ(\d)\s(\d{4})/)
            const [allMatch, companyName, ticker, quarter, year] = h5Matches
            const div = call.querySelector('div')
            const divText = div.innerText
            const endingPeriod = divText.split('ending ')[1].replace('.', '')

            return {
                href,
                companyName,
                ticker,
                quarter: parseInt(quarter),
                year: parseInt(year),
                endingPeriod
            }
        })
    })

    await browser.close()
    return meta
}


const queue = new Queue({ concurrency: workerCount })
console.log('Searching for earnings call transcripts on fool.com')
console.log(`Will click "Load More" button ${numberOfClicksOnLoadMore} times`)

const calls = await scrapeEarningCallsMeta(numberOfClicksOnLoadMore)
const browser = await puppeteer.launch({ headless })

calls.forEach(call => {
    queue.add(async() => {
        const {
            companyName,
            ticker,
            quarter,
            year,
            href
        } = call
        const filename = href.replace('/earnings/call-transcripts/', '').replace(/\/$/, '').replace(/\//g, '-')
        const sourceUrl = `https://www.fool.com${href}`
        const alreadyExists = await findExistingTranscript({ filename })
        if (alreadyExists) {
            console.log(`Already exists - skipping ${companyName} transcript from FY ${year} Q${quarter}`)
            return
        }
        console.log(`Scraping ${companyName} transcript from FY ${year} Q${quarter}`)
        const content = await scrapeEarningCall(sourceUrl, browser)
        const data = {
            companyName,
            companyTicker: ticker,
            quarter,
            fiscalYear: year,
            sourceUrl,
            content,
        }
        await fs.writeFile(`./transcripts/${filename}.json`, JSON.stringify(data, null, 2))
    })
})

await queue.onIdle()
await browser.close()
console.log('All done!')
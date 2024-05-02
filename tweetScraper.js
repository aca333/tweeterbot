const puppeteer = require("puppeteer");
const path = require("path");

const userDataDir = path.join(__dirname, 'puppeteer_user_data');

async function launchPersistentBrowser() {
    const browser = await puppeteer.launch({
        headless: true, // Run in headless mode suitable for server environments
        userDataDir: userDataDir
    });

    const page = await browser.newPage();
    // await page.setViewport({ width: 1200, height: 800 }); // Setting a larger viewport to mimic desktop browsing

    await page.goto("https://twitter.com/realPengLoo"); // Change the username as needed
    console.log("Navigated to Twitter.");

    // Wait for the tweets to load
    await page.waitForSelector('article[role="article"]');
    console.log("Tweets should be visible now.");

    // Extract tweets
    const tweets = await page.evaluate(() => {
        const tweetNodes = Array.from(
            document.querySelectorAll('article[role="article"]'),
        );
        return tweetNodes.map((node) => {
            console.log("STARTING!!");
            const linkElement = node.querySelector('a[href*="/status/"]');
            const href = linkElement ? linkElement.getAttribute("href") : "";
            const tweetId = href.split("/status/")[1] || ""; // Splitting the URL to extract the tweet ID
            const text = node.querySelector("div[lang]")
                ? node.querySelector("div[lang]").innerText
                : ""; // Ensuring there's a fallback if the selector finds nothing
            const timeElement = node.querySelector("time");
            const datetime = timeElement ? timeElement.getAttribute("datetime") : ""; // Extracting the datetime attribute from the time element

            // Extract view count using aria-label that contains 'views'
            const viewElement = node.querySelector('[aria-label*="views"]');
            const viewText = viewElement
                ? viewElement.getAttribute("aria-label")
                : "0 replies, 0 likes, 0 views, 0 bookmarks";

            // Extract specific numbers using regex
            const replies = parseInt(
                (viewText.match(/(\d+) repl(y|ies)/) || [0, 0])[1],
            );
            const likes = parseInt((viewText.match(/(\d+) lik(e|es)/) || [0, 0])[1]);
            const views = parseInt((viewText.match(/(\d+) view(s)?/) || [0, 0])[1]);
            const bookmarks = parseInt(
                (viewText.match(/(\d+) bookmark(s)?/) || [0, 0])[1],
            );

            return {
                id: tweetId,
                text: text,
                datetime: datetime,
                replies: replies,
                likes: likes,
                views: views,
                bookmarks: bookmarks,
            };
        });
    });

    console.log(tweets);

    await browser.close(); // Close the browser once done
}

launchPersistentBrowser();

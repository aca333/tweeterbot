const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const cors = require("cors");
const app = express();
const port = 3001;

// Set up user data directory for Puppeteer
const userDataDir = path.join(__dirname, 'puppeteer_user_data');

app.use(cors()); // Enable CORS

async function fetchTwitterData(username) {
    const browser = await puppeteer.launch({
        headless: true,
        userDataDir: userDataDir
    });

    const page = await browser.newPage();
    await page.goto(`https://twitter.com/${username}`); // Dynamic username
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
            const linkElement = node.querySelector('a[href*="/status/"]');
            const href = linkElement ? linkElement.getAttribute("href") : "";
            const tweetId = href.split("/status/")[1] || "";
            const text = node.querySelector("div[lang]")
                ? node.querySelector("div[lang]").innerText
                : "";
            const timeElement = node.querySelector("time");
            const datetime = timeElement ? timeElement.getAttribute("datetime") : "";

            const viewElement = node.querySelector('[aria-label*="views"]');
            const viewText = viewElement
                ? viewElement.getAttribute("aria-label")
                : "0 replies, 0 likes, 0 views, 0 bookmarks";
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
    await browser.close();
    return tweets;
}


// Dynamic route to fetch tweets by username
app.get("/tweet/:username", async (req, res) => {
    const { username } = req.params;
    try {
        const data = await fetchTwitterData(username);
        res.json(data);
    } catch (error) {
        console.error("Error fetching tweets for user:", username, error);
        res.status(500).send("Failed to fetch tweets");
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

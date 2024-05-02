require("dotenv").config({ path: __dirname + "/.env" });
const { twitterClient } = require("./twitterClient.js")
const CronJob = require("cron").CronJob;

const tweet = async () => {
    try {
        await twitterClient.v2.tweet("Hello world!");
    } catch (e) {
        console.log(e)
    }
}

const getTweets = async (username) => {
    try {
        // Replace 'twitter' with the target username and specify the number of tweets you want to retrieve
        const tweets = await twitterClient.v1.userTimelineByUsername(username, { count: 5 });

        // Log the text of each tweet
        tweets.forEach(tweet => {
            console.log(tweet.text);
        });
    } catch (e) {
        console.error(e);
    }
}

// Call the function with the username of the user whose tweets you want to retrieve
getTweets('realPengLoo'); // Replace 'twitter' with the actual username

// tweet();



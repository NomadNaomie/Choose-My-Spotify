import re
import tweepy
import logging
import os
import json
import time
import songDB

logging.basicConfig(filename='twotify.log', filemode='w', format='%(name)s - %(levelname)s - %(message)s')
logging.info('Started')
# Twitter API credentials
authDict = json.load(open(os.getcwd()+"\\TwitterAuth.json", "r"))
# Twitter API credentials
consumer_key = authDict["consumer_key"]
consumer_secret = authDict["consumer_secret"]
access_token = authDict["access_token"]
access_token_secret = authDict["access_token_secret"]
bearer_token = authDict["bearer"]

tweetLink = input("Enter the link to the tweet:\n ")
tweetID = tweetLink.split("/")[-1]
tweetName = tweetLink.split("/")[-3]
api = tweepy.API(auth)
client = tweepy.Client(bearer_token=bearer_token,consumer_key=consumer_key,consumer_secret=consumer_secret,access_token=access_token,access_token_secret=access_token_secret)

replies = []
while True:
    response = client.search_recent_tweets(query="to:"+tweetName,expansions="referenced_tweets.id",since_id=tweetID)
    for tweet in response.data:
        if any(int(tweetID) == refs.id for refs in tweet.referenced_tweets):
            if tweet.id not in replies:
                replies.append(tweet.id)
                tweetText = re.sub(r'@'+tweetName, '', tweet.text)
                songDB.suggest(tweetText)
    time.sleep(60*2)
import praw
import os
import Ingest
import threading
import json

caught = []
with open(os.getcwd() + '/RedditCreds.json') as js:
    _CRED = json.load(js)
reddit = praw.Reddit(client_id=_CRED['client_id'],
                     client_secret=_CRED['client_secret'],
                     password=_CRED['password'],
                     user_agent=_CRED['user_agent'],
                     username=_CRED['username'])



link = input("Enter a link to a post:\n ")
subredditName = link.split('/')[4]
t3Name = link.split('/')[6]

subreddit = reddit.subreddit(subredditName)


for c in subreddit.stream.comments():
    with open("caught.txt", "r+") as tx:
        if c.link_id == "t3"+t3Name and str(c.id)+"\n" not in tx.readlines():
            t = threading.Thread(target=Ingest.ingest,args=(c,))
            t.start()
            tx.write(c.id+"\n")

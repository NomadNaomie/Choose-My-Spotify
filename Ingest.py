import songDB,VotingSystem
import praw
_KEYPHRASE = "listen to"
_TERMINATOR = "!"
def ingest(comment):
    if "listen to" in comment.body.lower():
        s = comment.body.lower().split(_KEYPHRASE)[1].split(_TERMINATOR)[0]
        songDB.suggest(s)

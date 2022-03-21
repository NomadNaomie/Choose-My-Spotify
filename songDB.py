import spotipy,os,json
from spotipy.oauth2 import SpotifyOAuth
import logging

logging.basicConfig(filename='songDB.log', filemode='w', format='%(name)s - %(levelname)s - %(message)s')

with open(os.getcwd() + '/SpotifyCreds.json') as js:
    _CRED = json.load(js)
scope = "user-read-playback-state,user-modify-playback-state"
spotify = spotipy.Spotify(client_credentials_manager=SpotifyOAuth(
    client_id=_CRED['client_id'],
    client_secret=_CRED['client_secret'],
    redirect_uri=_CRED['redirect_uri'],
    scope=scope))
logging.info("Logged in")

def suggest(song):
    logging.info("Suggested: " + song)
    if "by" in song.lower():
        song = song.lower().replace(" by "," - ")
    requestSong = spotify.search(q=song)
    try:
        suggestUri = requestSong['tracks']['items'][0]['uri']
        spotify.add_to_queue(uri=suggestUri)
        logging.info("Queued "+song)
    except IndexError:
        logging.warning("Couldn't find track.")

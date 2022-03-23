const express = require('express');
const app = express();
var code = "";
const fs = require('fs');
const bettersqlite3 = require('better-sqlite3');
const db = new bettersqlite3('bot.db');
db.prepare("CREATE TABLE IF NOT EXISTS bans (username TEXT, reason TEXT, channel INTEGER)").run();
db.prepare("CREATE TABLE IF NOT EXISTS cooldowns (channel INTEGER, seconds INTEGER)").run();
app.get("/callback", (req, res) => {
    code = req.query.code;
    spotifyApi.authorizationCodeGrant(code).then
        (function (data) {
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);
            fs.writeFileSync('access_token.txt', data.body['access_token']);
            res.send("<script>window.close();</script>");
        }, function (err) {})
});
app.listen(80);
var SpotifyWebApi = require('spotify-web-api-node');
const tmi = require('tmi.js');
const spotifyAuth = require('./spotifyAuth.json');
var brain = {}

const opts = require('./config.json');
var spotifyApi = new SpotifyWebApi({
    clientId: spotifyAuth.client_id,
    clientSecret: spotifyAuth.client_secret,
    redirectUri: spotifyAuth.redirect_uri
});

const client = new tmi.client(opts);
client.on('message', onMessageHandler);
client.connect();



function onMessageHandler(target, context, msg, self) {
    if (self) return;
    if (msg.startsWith('$request')) {
        var ban = db.prepare("SELECT * FROM bans WHERE userID = ?").get(context.username.toLowerCase());
        if (ban) {
            ban.reason == "No reason given" ? reason = "No reason given" : reason = " for: " + ban.reason;
            client.say(target, "You are banned from using this bot in this channel " + banText);
            return;
        }
        if (brain[context['user-id']] == undefined) {
            roomid = context['room-id'];
            brain[context['user-id']] = [
                { roomid: Date.now() }
            ]

        }
        let cooldown = db.prepare("SELECT seconds FROM cooldowns WHERE channel = ?").get(context['room-id']);
        if (cooldown == undefined) {
            cooldown = 0;
        }
        if (brain[context['user-id']][context['room-id']] == undefined) {
            brain[context['user-id']][context['room-id']] = Date.now()
        }
        if (Date.now() >= brain[context['user-id']][context['room-id']] + cooldown * 1000) {
            brain[context['user-id']] = Date.now();
            var song = msg.substring(9);
            spotifyApi.searchTracks(song)
                .then(function (data) {
                    var track = data.body.tracks.items[0];
                    var trackUri = track.uri;
                    spotifyApi.addToQueue(trackUri);
                    client.say(target, `Added ${track.name} by ${track.artists[0].name} to the queue`);
                })
        }
        else {
            client.say(target, `You can only request a song every ${cooldown} seconds`);
        }
    } else if (msg.startsWith('$ban')) {
        if (msg.split(" ").length >= 2) {
        if (context.mod || target.substring(1) == context['username']) {
            var user = msg.split(" ")[1].toLowerCase();
            if (msg.split(" ").length == 2) {
                var reason = "No reason given";
            } else {
                var reason = msg.split(" ").slice(2).join(" ");
            }
            var channel = context['room-id'];
            db.prepare("INSERT INTO bans (userID, reason, channel) VALUES (?, ?, ?)").run(user, reason, channel);
            client.say(target, `Banned ${user} for ${reason}`);
        } else {
            client.say(target, `You don't have permission to do that`);
        }
        } else {
            client.say(target, `Usage: $ban [user] [reason]`);
        }
    } else if (msg.startsWith('$unban')) {
        if (context.mod || target.substring(1) == context['username']) {
            var user = msg.substring(7);
            var channel = context['room-id'];
            db.prepare("DELETE FROM bans WHERE userID = ? AND channel = ?").run(user, channel);
            client.say(target, `Unbanned ${user}`);
        } else {
            client.say(target, `You don't have permission to do that`);
        }
    } else if (msg.startsWith("$cooldown")) {
        if (msg.length > 10) {
            client.say(target, "Usage: $cooldown <seconds>");
        } else {
            try {
                if (context.mod || target.substring(1) == context['username']) {
                    var seconds = msg.substring(10);
                    var channel = context['room-id'];
                    db.prepare("INSERT INTO cooldowns (userID, channel, seconds) VALUES (?, ?, ?)").run(user, channel, seconds);
                    client.say(target, `Set channel cooldown to ${seconds} seconds`);
                }
            } catch (err) {
                client.say(target, "Usage: $cooldown <seconds>");
            }
        }
    }
}
spotifyApi.setAccessToken(fs.readFileSync('access_token.txt', 'utf8'));
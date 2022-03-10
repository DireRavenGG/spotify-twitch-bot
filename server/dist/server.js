"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const spotify_web_api_node_1 = __importDefault(require("spotify-web-api-node"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
const spotifyApi = new spotify_web_api_node_1.default({
    redirectUri: "http://localhost:3000",
    clientId: "ff65c49480cd41d7b15a16ca1b570129",
    clientSecret: "56cfaffe6e9d4f77bef584caded45f51",
});
const accessTokenFunction = (token) => {
    spotifyApi.setAccessToken(token);
};
const refreshTokenFunction = (refresh) => {
    spotifyApi.setRefreshToken(refresh);
};
// app.post("/refresh", (req, res) => {
//   const refreshToken = req.body.refreshToken;
//   const spotifyApi = new SpotifyWebApi({
//     redirectUri: "http://localhost:3000",
//     clientId: "ff65c49480cd41d7b15a16ca1b570129",
//     clientSecret: "56cfaffe6e9d4f77bef584caded45f51",
//     refreshToken,
//   });
//   spotifyApi.refreshAccessToken().then(
//     function (data) {
//       res.json({
//         accessToken: data.body.access_token,
//         expiresIn: data.body.expires_in,
//       });
//     },
//     function (err) {
//       console.log("could not refresh access token", err);
//     }
//   );
// });
let tokenExpiration;
app.post("/login", (req, res) => {
    let code = req.body.code;
    spotifyApi
        .authorizationCodeGrant(code)
        .then((data) => {
        accessTokenFunction(data.body.access_token);
        refreshTokenFunction(data.body.refresh_token);
        refreshTimerFunction();
        tokenExpiration = new Date().getTime() / 1000 + data.body["expires_in"];
        console.log("Retrieved token. It expires in " +
            Math.floor(tokenExpiration - new Date().getTime() / 1000) +
            " seconds!");
    })
        .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });
});
const refreshTimerFunction = () => {
    let numberOfTimesUpdated = 0;
    const interval = setInterval(function () {
        // console.log(
        //   "Time left: " +
        //     Math.floor(tokenExpiration - new Date().getTime() / 1000) +
        //     " seconds left!"
        // );
        // OK, we need to refresh the token. Stop printing and refresh.
        if (++numberOfTimesUpdated > 3550) {
            clearInterval(interval);
            // Refresh token and print the new time to expiration.
            spotifyApi.refreshAccessToken().then(function (data) {
                accessTokenFunction(data.body.access_token);
                tokenExpiration =
                    new Date().getTime() / 1000 + data.body["expires_in"];
                console.log("Refreshed token. It now expires in " +
                    Math.floor(tokenExpiration - new Date().getTime() / 1000) +
                    " seconds!");
                numberOfTimesUpdated = 0;
                refreshTimerFunction();
            }, function (err) {
                console.log("Could not refresh the token!", err.message);
            });
        }
    }, 1000);
};
// interface Artist {
//   name: string;
// }
// interface SpotifyResult {
//   item: {
//     name: string;
//     external_urls: string;
//     duration_ms: number;
//     progress_ms: number;
//     album: string;
//     images: [];
//     artists: Artist[];
//   };
// }
// artists = [ {name: 'bobby'}, {name: 'alice'}]
app.get("/playback", (req, res) => {
    spotifyApi
        .getMyCurrentPlaybackState()
        .then((result) => {
        const x = result.body.item;
        if (!result.body.item) {
            return res.status(404).send("No music playing");
        }
        res.json({
            duration: result.body.item.duration_ms,
            currentProgress: result.body.progress_ms,
            // setProgress(result.body.progress_ms);
            currentTrack: result.body.item.name,
            songUrl: result.body.item.external_urls.spotify,
            currentArtist: x.artists[0].name,
            image: x.album.images[1],
            playingStatus: result.body.is_playing,
        });
    })
        .catch((err) => {
        console.log(err);
        if (err.statusCode === 429) {
            process.exit();
        }
        res.sendStatus(404);
    });
});
app.listen(3001);
//# sourceMappingURL=server.js.map
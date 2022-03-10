import express, { Request } from "express";
import SpotifyWebApi from "spotify-web-api-node";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

const spotifyApi = new SpotifyWebApi({
  redirectUri: "http://localhost:3000",
  clientId: "ff65c49480cd41d7b15a16ca1b570129",
  clientSecret: "56cfaffe6e9d4f77bef584caded45f51",
});

const accessTokenFunction = (token: string) => {
  spotifyApi.setAccessToken(token);
};
const refreshTokenFunction = (refresh: string) => {
  spotifyApi.setRefreshToken(refresh);
};

let tokenExpiration: number;

app.post("/login", (req, res) => {
  let code = req.body.code;

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      accessTokenFunction(data.body.access_token);
      refreshTokenFunction(data.body.refresh_token);
      refreshTimerFunction();
      tokenExpiration = new Date().getTime() / 1000 + data.body["expires_in"];
      console.log(
        "Retrieved token. It expires in " +
          Math.floor(tokenExpiration - new Date().getTime() / 1000) +
          " seconds!"
      );
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
      spotifyApi.refreshAccessToken().then(
        function (data) {
          accessTokenFunction(data.body.access_token);
          tokenExpiration =
            new Date().getTime() / 1000 + data.body["expires_in"];
          console.log(
            "Refreshed token. It now expires in " +
              Math.floor(tokenExpiration - new Date().getTime() / 1000) +
              " seconds!"
          );
          numberOfTimesUpdated = 0;
          refreshTimerFunction();
        },
        function (err) {
          console.log("Could not refresh the token!", err.message);
        }
      );
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
app.get("/playback", (req: Request<{}, {}, {}>, res) => {
  spotifyApi
    .getMyCurrentPlaybackState()
    .then((result) => {
      const x = result.body.item as SpotifyApi.TrackObjectFull;

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

import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import {
  Box,
  CardContent,
  CardMedia,
  Stack,
  Typography,
  Slider,
} from "@mui/material";
import axios from "axios";



const Dashboard = ({ code }: { code: string }) => {
  const [playbackData, setPlaybackData] = useState();
  const [statusCheese, setStatusCheese] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentStatus, setCurrentStatus] = useState(false);

  useEffect(() => {
    axios
      .post("http://localhost:3001/login", {
        code,
      })
      .then(async () => {
        await getPlayback();
      })
      .catch((err) => {
        console.log(err);
        // window.location = "/";
      });
  }, [code]);

  const getPlayback = async () => {
    return await axios.get("http://localhost:3001/playback", {}).then((res) => {
      setPlaybackData({
        duration: res.data.duration,
        currentProgress: res.data.currentProgress,
        currentTrack: res.data.currentTrack,
        songUrl: res.data.songUrl,
        currentArtist: res.data.currentArtist,
        image: res.data.image.url,
        playingStatus: res.data.playingStatus,
      });
      setProgress(res.data.currentProgress);
      setCurrentStatus(res.data.playingStatus);
    });
  };

  useEffect(() => {
    getPlayback();
  }, [statusCheese]);

  function formatDuration(value: number) {
    const roundedSeconds = parseInt(`${value / 1000}`);
    const minute = Math.floor(roundedSeconds / 60);
    const secondLeft = roundedSeconds - minute * 60;
    return `${minute}:${secondLeft <= 9 ? `0${secondLeft}` : secondLeft}`;
  }

  useEffect(() => {
    if (progress !== playbackData.duration) {
      if (currentStatus) {
        const interval = setInterval(() => {
          setStatusCheese((prevTotalSongs) => (prevTotalSongs += 1));
          setProgress((prevProgress) => {
            return (prevProgress += 1000);
          });
        }, 1000);

        return () => clearInterval(interval);
      } else {
        const interval = setInterval(() => {
          setStatusCheese((prevTotalSongs) => (prevTotalSongs += 1));
        }, 1000);
        return () => clearInterval(interval);
      }
    } else {
      const interval = setInterval(() => {
        setStatusCheese((prevTotalSongs) => (prevTotalSongs += 1));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [progress]);

  return (
    <Card
      sx={{
        display: "flex",
        bgcolor: "rgb(32 33 36)",
        width: "fit-content",
        color: "#fefefe",
      }}
    >
      <Box width={400}>
        <Stack
          direction="column"
          justifyContent="space-between"
          sx={{ height: "100%" }}
        >
          <CardContent>
            <Typography noWrap variant="h4">
              {playbackData.currentTrack}
            </Typography>
            <Typography variant="subtitle1">
              {" "}
              {playbackData.currentArtist}
            </Typography>
          </CardContent>
          <Stack sx={{ padding: 2 }}>
            <Slider
              size="small"
              value={progress}
              min={0}
              max={playbackData.duration}
              step={1}
              sx={{ color: "#fefefe" }}
              onChange={(_, value) => setProgress(value)}
            ></Slider>
            <Stack direction="row" justifyContent="space-between">
              <Typography>{formatDuration(progress)}</Typography>
              <Typography>
                - {formatDuration(playbackData.duration - progress)}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>
      <CardMedia
        component="img"
        image={playbackData.image}
        alt="album cover"
        sx={{
          width: 200,
        }}
      />
    </Card>
  );
};

export default Dashboard;

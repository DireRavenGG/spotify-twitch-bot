import * as React from "react";
import { Button, Stack } from "@mui/material";

const AUTH_URL =
  "https://accounts.spotify.com/authorize?client_id=ff65c49480cd41d7b15a16ca1b570129&response_type=code&redirect_uri=http://localhost:3000&scope=streaming%20user-read-email%20user-read-private%20user-library-read%20user-library-modify%20user-read-playback-state%20user-modify-playback-state%20user-read-currently-playing";

const Login = () => {
  return (
    <Stack alignItems="center">
      <Button href={AUTH_URL}>Login With Spotify</Button>
    </Stack>
  );
};

export default Login;

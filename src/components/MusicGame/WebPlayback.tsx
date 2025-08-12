import React, { useState, useEffect } from "react";
import "./WebPlayback.css";
import { togglePlaybackShuffle, transferPlayback } from "./SpotifyHelpers";

// TODO: Add volume toggle

function WebPlayback({
  token,
  currentTrackId,
  contextUri,
}: {
  token: string;
  currentTrackId: string | null;
  contextUri: string;
}) {
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
  const [isPaused, setIsPaused] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentContextUri, setCurrentContextUri] = useState("");
  const [deviceId, setDeviceId] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.5,
      });

      setPlayer(player);

      // Error handling
      // [Source: https://howik.com/exploring-spotify-web-playback-sdk]
      player.addListener("initialization_error", ({ message }) => {
        console.error(message);
      });
      player.addListener("authentication_error", ({ message }) => {
        console.error(message); //Invalid token scopes.
      });
      player.addListener("account_error", ({ message }) => {
        console.error(message);
      });
      player.addListener("playback_error", ({ message }) => {
        console.error(message);
      });

      player.addListener("ready", async ({ device_id }) => {
        console.log("Ready with Device ID", device_id);

        setDeviceId(device_id);

        await player.activateElement();
        await togglePlaybackShuffle(token, true, device_id);

        await player.getCurrentState().then(async (state) => {
          if (!state) {
            console.error(
              "User is not playing music through the Web Playback SDK"
            );

            await transferPlayback(token, device_id);

            return;
          }

          if (state.context.uri) {
            setCurrentContextUri(state.context.uri);
          }

          // Set the initial isPaused state based on the current player state
          setIsPaused(state.paused);

          // Set loading to false since we're now ready
          setIsLoading(false);
        });
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener(
        "player_state_changed",
        async ({ paused, context }) => {
          setIsPaused(paused);

          if (!!context.uri) {
            setCurrentContextUri(context.uri);
          }
        }
      );

      player.connect();
    };
  }, [token]);

  if (!player) {
    return <></>;
  }

  const buttonText = isPaused ? "PLAY" : "PAUSE";

  return (
    <div className="main-wrapper">
      {isLoading ? (
        <p>Loading..</p>
      ) : (
        <>
          <button
            className="btn-spotify-player"
            onClick={() => player.togglePlay()}
          >
            {buttonText}
          </button>

          <button
            className="btn-spotify-player"
            onClick={() => player.nextTrack()}
          >
            &gt;&gt;
          </button>

          <button
            className="btn-spotify-player"
            onClick={() => console.log("TO IMPLEMENT")}
          >
            GUESS
          </button>
        </>
      )}
    </div>
  );
}

export default WebPlayback;

import React, { useState, useEffect, useRef } from "react";
import "./WebPlayback.css";
import {
  togglePlaybackShuffle,
  transferPlayback,
  getCurrentlyPlayingTrack,
  startOrResumePlayback,
} from "./SpotifyHelpers";
import { TrackInformation } from "./SongCard";

// TODO: Add volume toggle

function WebPlayback({
  token,
  sortedTracks,
  contextUri,
  disabled,
  setCurrentTrackId,
  setSortedTracks,
  onSkip,
  onGuess,
}: {
  token: string;
  sortedTracks: TrackInformation[];
  contextUri: string;
  disabled: boolean;
  setCurrentTrackId: React.Dispatch<React.SetStateAction<string | null>>;
  setSortedTracks: React.Dispatch<React.SetStateAction<TrackInformation[]>>;
  onSkip: () => void;
  onGuess: (callback: () => void) => Promise<void>;
}) {
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
  const [isPaused, setIsPaused] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentContextUri, setCurrentContextUri] = useState("");
  const [deviceId, setDeviceId] = useState("");

  // Ref to track the last track URI to prevent duplicates
  const lastTrackUriRef = useRef<string | null>(null);
  // Ref to store the timeout for debouncing track addition
  const trackAdditionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to track if component is mounted
  const isMountedRef = useRef(true);

  // Helper function to add tracks with debouncing and full information
  const addTrackToSortedTracks = async (trackUri: string) => {
    // Don't add tracks if component is unmounting
    if (!isMountedRef.current) return;

    // Clear any existing timeout
    if (trackAdditionTimeoutRef.current) {
      clearTimeout(trackAdditionTimeoutRef.current);
    }

    // Set a new timeout to debounce track addition
    trackAdditionTimeoutRef.current = setTimeout(async () => {
      // Double-check if component is still mounted
      if (!isMountedRef.current) return;

      try {
        // Fetch full track information including release year
        const playbackState = await getCurrentlyPlayingTrack(token);

        if (playbackState?.item && playbackState.item.uri === trackUri) {
          const track = playbackState.item;

          // Create track info with full details including release year
          const trackInfo: TrackInformation = {
            id: track.uri,
            uri: track.uri,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            albumCoverUrl:
              track.album.images && track.album.images.length > 0
                ? track.album.images[1]?.url || track.album.images[0]?.url || ""
                : "",
            year: track.album.release_date
              ? new Date(track.album.release_date).getFullYear()
              : new Date().getFullYear(),
          };

          // Check if track already exists to prevent duplicates
          if (
            !sortedTracks.some(
              (existingTrack) => existingTrack.id === trackInfo.id
            )
          ) {
            setSortedTracks((prevTracks) => [...prevTracks, trackInfo]);
            console.log("Added new track to sortedTracks:", trackInfo);
          } else {
            console.log(
              "Track already exists in sortedTracks:",
              trackInfo.name
            );
          }
        }
      } catch (error) {
        console.error("Error fetching full track information:", error);
      }
    }, 1000); // 1 second debounce
  };

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

        // Set loading to false since we're now ready
        setIsLoading(false);

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

          // Handle initial track if it exists and it is in the correct context
          if (
            state.track_window.current_track &&
            state.context.uri === contextUri
          ) {
            const initialTrack = state.track_window.current_track;

            // Validate that we have a proper track with required fields
            if (
              initialTrack.uri &&
              initialTrack.name &&
              initialTrack.artists &&
              initialTrack.album
            ) {
              setCurrentTrackId(initialTrack.uri);
              lastTrackUriRef.current = initialTrack.uri;

              // Add the initial track to sortedTracks
              addTrackToSortedTracks(initialTrack.uri);

              console.log("Initial track detected:", initialTrack.name);
            } else {
              console.warn(
                "Incomplete initial track information:",
                initialTrack
              );
            }
          }
        });
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      player.addListener("player_state_changed", async (props) => {
        if (!props) {
          return;
        }

        const { track_window, paused, context } = props;
        setIsPaused(paused);

        if (!!context.uri) {
          setCurrentContextUri(context.uri);
        }

        const { current_track: currentTrack } = track_window;

        // Only update if the track has actually changed
        if (
          currentTrack &&
          currentTrack.uri !== lastTrackUriRef.current &&
          context.uri === contextUri
        ) {
          // Validate that we have a proper track with required fields
          if (
            currentTrack.uri &&
            currentTrack.name &&
            currentTrack.artists &&
            currentTrack.album
          ) {
            setCurrentTrackId(currentTrack.uri);
            lastTrackUriRef.current = currentTrack.uri;

            // Add the new track to sortedTracks with debouncing
            addTrackToSortedTracks(currentTrack.uri);

            console.log("New track detected:", currentTrack.name);
          } else {
            console.warn("Incomplete track information:", currentTrack);
          }
        }
      });

      player.connect();
    };

    // Cleanup function to clear timeout when component unmounts
    return () => {
      isMountedRef.current = false;
      if (trackAdditionTimeoutRef.current) {
        clearTimeout(trackAdditionTimeoutRef.current);
      }
    };
  }, []); // only want to add listeners once

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
            onClick={async () => {
              if (currentContextUri !== contextUri) {
                await startOrResumePlayback(token, contextUri, deviceId);
              } else {
                player.togglePlay();
              }
            }}
          >
            {buttonText}
          </button>

          <button
            className="btn-spotify-player"
            onClick={async () => {
              onSkip();
              await player.nextTrack();
            }}
            disabled={disabled}
          >
            SKIP
          </button>

          <button
            className="btn-spotify-player"
            onClick={async () => {
              await onGuess(async () => {
                await player.nextTrack();
              });
            }}
            disabled={disabled}
          >
            GUESS
          </button>
        </>
      )}
    </div>
  );
}

export default WebPlayback;

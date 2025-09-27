import React, { useState, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import {
  togglePlaybackShuffle,
  transferPlayback,
  getCurrentlyPlayingTrack,
  startOrResumePlayback,
  getRandomTrackFromPlaylist,
} from "./SpotifyHelpers";
import { TrackInformation } from "./SongCard";

// TODO: Add volume toggle
// TODO: Add cleanup funtions for listeners
// TODO: Make sure we don't replay the first random song we add!

// Styled components
const MainWrapper = styled.div`
  /* Main wrapper styles if needed */
`;

const SpotifyButton = styled.button`
  font-family: "Pirata One", "UnifrakturCook", system-ui, "celticBit";
  font-size: 16px;
  background-color: var(--color-button);
  border-radius: 6px;
  padding: 4px 8px;
  margin: 4px;

  &:hover:enabled {
    background-color: var(--color-button-hover);
  }

  &:active:enabled {
    background-color: var(--color-button-active);
  }

  &:disabled {
    background-color: var(--color-button-disabled);
    border-color: var(--color-button-border-disabled);
  }
`;

enum GuessState {
  Correct,
  Incorrect,
  NoGuess,
  Skip,
}

function WebPlayback({
  token,
  sortedTracks,
  contextUri,
  guessDisabled,
  skipDisabled,
  setCurrentTrackId,
  setSortedTracks,
  setGuessState,
  onSkip,
  onGuess,
}: {
  token: string;
  sortedTracks: TrackInformation[];
  contextUri: string;
  guessDisabled: boolean;
  skipDisabled: boolean;
  setCurrentTrackId: React.Dispatch<React.SetStateAction<string | null>>;
  setSortedTracks: React.Dispatch<React.SetStateAction<TrackInformation[]>>;
  setGuessState: React.Dispatch<React.SetStateAction<GuessState>>;
  onSkip: (callback: () => void) => void;
  onGuess: (callback: () => void) => Promise<void>;
}) {
  const [player, setPlayer] = useState<Spotify.Player | undefined>(undefined);
  const [isPaused, setIsPaused] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentContextUri, setCurrentContextUri] = useState("");
  const [deviceId, setDeviceId] = useState("");

  // Ref to track the last track URI to prevent duplicates
  const lastTrackUriRef = useRef<string | null>(null);
  // Ref to store the timeout for debouncing track addition
  const trackAdditionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  // Refs to store current state values for use in listeners
  const hasStartedRef = useRef(false);
  const sortedTracksRef = useRef<TrackInformation[]>([]);
  const currentContextUriRef = useRef<string | null>(null);

  // Keep refs updated with current state values
  useEffect(() => {
    hasStartedRef.current = hasStarted;
  }, [hasStarted]);

  useEffect(() => {
    sortedTracksRef.current = sortedTracks;
  }, [sortedTracks]);

  useEffect(() => {
    currentContextUriRef.current = currentContextUri;
  }, [currentContextUri]);

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
        // Fetch full track information including ORIGINAL release year
        const track = await getCurrentlyPlayingTrack();

        if (track) {
          if (track.uri !== trackUri) {
            // We had to grab an older version of the currently playing track to
            // display the original release year, so we need to update currentTrackId
            // accordingly
            setCurrentTrackId(track.uri);
          }
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
            year: new Date(track.album.release_date).getUTCFullYear(),
          };

          // Check if track already exists to prevent duplicates
          if (
            !sortedTracksRef.current.some(
              (existingTrack) => existingTrack.id === trackInfo.id
            )
          ) {
            setGuessState(GuessState.NoGuess);
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

  const populateEmptySortedTracks = async (deviceId: string) => {
    // if sortedTracks is empty, we should populate the first track
    try {
      // Extract playlist ID from contextUri (remove spotify:playlist: prefix)
      const playlistId = contextUri.replace("spotify:playlist:", "");

      // Get a random track and add it to sortedTracks
      const randomTrack = await getRandomTrackFromPlaylist(playlistId);
      setSortedTracks((prevSortedTracks) => [randomTrack, ...prevSortedTracks]);

      // Skip to the next track so the user can guess where the first track belongs
      // Only try to skip if we have a device and the player is ready
      if (deviceId && player) {
        try {
          await player.nextTrack();
          console.log(
            "Added random track to sortedTracks and skipped to next track:",
            randomTrack.name
          );
        } catch (skipError) {
          console.warn(
            "Could not skip to next track, but random track was added:",
            skipError
          );
        }
      } else {
        console.log("Added random track to sortedTracks:", randomTrack.name);
      }
    } catch (error) {
      console.error("Failed to get random track:", error);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (!!player) {
        return;
      }

      const spotifyPlayer = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.5,
      });

      setPlayer(spotifyPlayer);

      // Error handling
      // [Source: https://howik.com/exploring-spotify-web-playback-sdk]
      spotifyPlayer.addListener("initialization_error", ({ message }) => {
        console.error(message);
      });
      spotifyPlayer.addListener("authentication_error", ({ message }) => {
        console.error(message); //Invalid token scopes.
      });
      spotifyPlayer.addListener("account_error", ({ message }) => {
        console.error(message);
      });
      spotifyPlayer.addListener("playback_error", ({ message }) => {
        console.error(message);
      });

      spotifyPlayer.addListener("ready", async ({ device_id }) => {
        console.log("Ready with Device ID", device_id);

        setDeviceId(device_id);

        // Set loading to false since we're now ready
        setIsLoading(false);

        await spotifyPlayer.activateElement();
        await togglePlaybackShuffle(true, device_id);

        await spotifyPlayer.getCurrentState().then(async (state) => {
          if (!state) {
            console.error(
              "User is not playing music through the Web Playback SDK"
            );

            await transferPlayback(device_id);

            return;
          }

          if (
            state.context.uri &&
            currentContextUriRef.current !== state.context.uri
          ) {
            setCurrentContextUri(state.context.uri);
          }

          // Set the initial isPaused state based on the current player state
          setIsPaused(state.paused);
        });
      });

      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
      });

      spotifyPlayer.addListener("player_state_changed", async (props) => {
        if (!props) {
          return;
        }

        const { track_window, paused, context } = props;
        setIsPaused(paused);

        if (context.uri && currentContextUriRef.current !== context.uri) {
          setCurrentContextUri(context.uri);
        }

        const { current_track: currentTrack } = track_window;

        // Only update if the track has actually changed
        if (
          currentTrack &&
          currentTrack.uri !== lastTrackUriRef.current &&
          context.uri === contextUri &&
          hasStartedRef.current
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

      spotifyPlayer.connect();
    };

    // Cleanup function to clear timeout when component unmounts
    return () => {
      if (player) {
        player.disconnect();
      }

      isMountedRef.current = false;
      if (trackAdditionTimeoutRef.current) {
        clearTimeout(trackAdditionTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only want to add listeners once

  if (!player) {
    return <></>;
  }

  const buttonText = isPaused ? "PLAY" : "PAUSE";

  return (
    <MainWrapper>
      {isLoading ? (
        <p>Loading..</p>
      ) : !hasStarted ? (
        <SpotifyButton
          onClick={async () => {
            setHasStarted(true);
            if (sortedTracks.length === 0) {
              await populateEmptySortedTracks(deviceId);
            }

            if (currentContextUri !== contextUri) {
              await startOrResumePlayback(contextUri, deviceId);
            } else {
              player.togglePlay();
            }
          }}
        >
          START
        </SpotifyButton>
      ) : (
        <>
          <SpotifyButton
            onClick={async () => {
              if (currentContextUri !== contextUri) {
                await startOrResumePlayback(contextUri, deviceId);
              } else {
                player.togglePlay();
              }
            }}
          >
            {buttonText}
          </SpotifyButton>

          <SpotifyButton
            onClick={async () => {
              onSkip(async () => {
                await player.nextTrack();
              });
            }}
            disabled={skipDisabled}
          >
            SKIP
          </SpotifyButton>

          <SpotifyButton
            onClick={async () => {
              await onGuess(async () => {
                await player.nextTrack();
              });
            }}
            disabled={guessDisabled}
          >
            GUESS
          </SpotifyButton>
        </>
      )}
    </MainWrapper>
  );
}

export default WebPlayback;

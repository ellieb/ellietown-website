import React from "react";
import "./MusicGame.css";
import SongGuessingArea from "./SongGuessingArea";
import { TrackInformation } from "./SongCard";

import {
  checkForAccessToken,
  auth,
  startOrResumePlayback,
  pausePlayback,
  getCurrentlyPlayingTrack,
  SpotifyTokenResp,
  CurrentToken,
} from "./SpotifyHelpers";

function MusicGame() {
  const spotifyClientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const contextUri = process.env.REACT_APP_DEFAULT_PLAYLIST_ID;
  const redirectUri = "http://127.0.0.1:3000/fun-stuff";
  const scope = "user-modify-playback-state user-read-currently-playing";
  const [isMusicPlaying, setIsMusicPlaying] = React.useState(false);
  const [currentContextUri, setCurrentContextUri] = React.useState("");
  const [currentTrackInfo, setCurrentTrackInfo] =
    React.useState<TrackInformation | null>({
      album: "Nevermind",
      albumCoverUrl:
        "https://i.scdn.co/image/ab67616d00001e02fdf71af87c2a4f3cbed53d65",
      artist: "Nirvana",
      id: "spotify:track:3oTlkzk1OtrhH8wBAduVEi",
      name: "Smells Like Teen Spirit",
      uri: "spotify:track:3oTlkzk1OtrhH8wBAduVEi",
      year: 1991,
    });

  const [sortedTracks, setSortedTracks] = React.useState<TrackInformation[]>([
    {
      album: "Nevermind",
      albumCoverUrl:
        "https://i.scdn.co/image/ab67616d00001e02fdf71af87c2a4f3cbed53d65",
      artist: "Nirvana",
      id: "spotify:track:3oTlkzk1OtrhH8wBAduVEi",
      name: "Smells Like Teen Spirit",
      uri: "spotify:track:3oTlkzk1OtrhH8wBAduVEi",
      year: 1991,
    },
    {
      id: "spotify:track:3AhXZa8sUQht0UEdBJgpGc",
      uri: "spotify:track:3AhXZa8sUQht0UEdBJgpGc",
      name: "Like a Rolling Stone",
      artist: "Bob Dylan",
      album: "Highway 61 Revisited",
      albumCoverUrl:
        "https://i.scdn.co/image/ab67616d00001e0241720ef0ae31e10d39e43ca2",
      year: 1965,
    },
    {
      id: "spotify:track:17zN523CEjJWBGXrUb3xex",
      uri: "spotify:track:17zN523CEjJWBGXrUb3xex",
      name: "Last Night I Dreamt That Somebody Loved Me - 2011 Remaster",
      artist: "The Smiths",
      album: "Strangeways, Here We Come",
      albumCoverUrl:
        "https://i.scdn.co/image/ab67616d00001e026d965be72ad1bceb7f2bd089",
      year: 1987,
    },
  ]);

  const itemToCurrentTrackInfo = (
    response: any
    // SpotifyApi.CurrentlyPlayingResponse &
    //   Partial<{
    //     item: { album: { release_date: string } };
    //   }>
  ): TrackInformation | null => {
    const { item } = response;
    if (!item) return null;

    return {
      id: item.uri,
      uri: item.uri,
      name: item.name,
      artist: item.artists[0].name,
      album: item.album.name,
      albumCoverUrl: item.album.images[1].url,
      year: item.album.release_date
        ? new Date(item.album.release_date).getFullYear()
        : undefined,
    };
  };

  if (!spotifyClientId) {
    throw new Error("Missing Spotify client ID");
  }

  // structure that manages access token for the PKCE authorization flow
  const currentToken: CurrentToken = React.useMemo(
    () => ({
      get accessToken() {
        return localStorage.getItem("access_token") || null;
      },
      get refreshToken() {
        return localStorage.getItem("refresh_token") || null;
      },
      get expiresIn() {
        return localStorage.getItem("expires_in") || null;
      },
      get expiresAt() {
        return localStorage.getItem("expires_at") || null;
      },

      save: function (response: SpotifyTokenResp) {
        const { access_token, refresh_token, expires_in } = response;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        localStorage.setItem("expires_in", expires_in.toString());

        const expires_at = new Date(new Date().getTime() + expires_in * 1000);
        localStorage.setItem("expires_at", expires_at.toString());
      },
    }),
    []
  );

  const onAuthorizeClickHandler = async () => {
    await auth(spotifyClientId, redirectUri, scope); // this will redirect to spotify
  };

  const accessToken = currentToken.accessToken;

  const onPlayClickHandler = (accessToken: string) => {
    if (currentContextUri === contextUri) {
      startOrResumePlayback(accessToken);
    } else {
      startOrResumePlayback(accessToken, contextUri);
    }

    setIsMusicPlaying(true);
    checkPlaybackStatus(accessToken);
  };

  const onPauseClickHandler = (accessToken: string) => {
    pausePlayback(accessToken);
    setIsMusicPlaying(false);
  };

  const checkPlaybackStatus = async (accessToken: string) => {
    const playbackState = await getCurrentlyPlayingTrack(accessToken);
    console.log(playbackState);
    if (playbackState) {
      setIsMusicPlaying(playbackState.is_playing);
      if (playbackState.context?.uri) {
        setCurrentContextUri(playbackState.context.uri);
      }
      const playingTrack = itemToCurrentTrackInfo(playbackState);
      if (
        playingTrack &&
        !sortedTracks.some((track) => track.id === playingTrack.id)
      ) {
        setCurrentTrackInfo(playingTrack);
        setSortedTracks((tracks) => [...tracks, playingTrack]);
      }
      // You can use trackInfo here or store it in state
      console.log("Current track info:", currentTrackInfo);
    }
  };

  React.useEffect(() => {
    // on page load, check if we have an access token or code
    checkForAccessToken(spotifyClientId, redirectUri, currentToken);
    if (accessToken) checkPlaybackStatus(accessToken);
  }, [accessToken, currentToken, spotifyClientId]);

  console.log({ sortedTracks });

  return (
    <div>
      <h3>Try and sort these songs chronologically...</h3>
      {!accessToken ? (
        <button onClick={onAuthorizeClickHandler}>Authorize</button>
      ) : isMusicPlaying ? (
        <button onClick={() => onPauseClickHandler(accessToken)}>Pause</button>
      ) : (
        <button onClick={() => onPlayClickHandler(accessToken)}>Play</button>
      )}
      {/* Guess button */}
      <SongGuessingArea
        currentTrackId={currentTrackInfo?.id ?? null}
        sortedTracks={sortedTracks}
        setSortedTracks={setSortedTracks}
      />
    </div>
  );
}

export default MusicGame;
// Want to make a music guessing game via Spotify
// Take a spotify playlist (i.e. top 1000 songs of the last 70 years or something like that)
// You are given a random song in the playlist and have to put it in chronological order (by year)
// if two songs are released in the same year, it doesn't matter if you organize it before or after
// you get 3 failures, if you guess wrong, you move onto the next song
// if you get 10 songs organized correctly, you win :)

// can add extras later ...

// oooh another idea is
// pick an artist to quiz yourself on
// play a section of a song
// have to sort it into the correct album of theirs (like drag and drop)
// then keep going...

// AUthorization: Authorization code with PKCE (https://developer.spotify.com/documentation/web-api/concepts/authorization)
// https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

// information we want from spotfiy:
// playlist to take from (get a public one via spotify ID)
// song name, artist, year of release, album cover
// actual song to play it...  (https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback)

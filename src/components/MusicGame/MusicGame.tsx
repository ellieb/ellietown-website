import React from "react";
import "./MusicGame.css";
import SongGuessingArea from "./SongGuessingArea";
import { TrackInformation } from "./SongCard";

import {
  checkForAccessToken,
  auth,
  SpotifyTokenResp,
  CurrentToken,
} from "./SpotifyHelpers";
import WebPlayback from "./WebPlayback";

enum GuessState {
  Correct,
  Incorrect,
  NoGuess,
}

function MusicGame() {
  const spotifyClientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const contextUri = process.env.REACT_APP_DEFAULT_PLAYLIST_ID;
  const redirectUri = "http://127.0.0.1:3000/fun-stuff";
  const scope =
    "user-read-playback-state user-modify-playback-state user-read-currently-playing streaming user-read-email user-read-private";
  // streaming user-read-email user-read-private is for web playback sdk
  const [currentTrackId, setCurrentTrackId] = React.useState<string | null>(
    null
  );

  const [sortedTracks, setSortedTracks] = React.useState<TrackInformation[]>(
    []
  );
  const [guessState, setGuessState] = React.useState<GuessState>(
    GuessState.NoGuess
  );

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

  React.useEffect(() => {
    const refreshTokenAndCheckPlayback = async () => {
      await checkForAccessToken(spotifyClientId, redirectUri, currentToken);
      // if (accessToken) checkPlaybackStatus(accessToken);
    };
    // todo: check if access token is expired here...
    // on page load, check if we have an access token or code
    refreshTokenAndCheckPlayback();
  }, [currentToken, spotifyClientId]);

  const onGuess = async (callback: () => void) => {
    console.log("onGuess");
    console.log({ currentTrackId, accessToken: currentToken.accessToken });
    if (!currentTrackId || !currentToken.accessToken) {
      return;
    }

    const isCorrectlySorted = areTracksSorted(sortedTracks);
    console.log({ isCorrectlySorted });

    // reveal SongCard
    setGuessState(
      isCorrectlySorted ? GuessState.Correct : GuessState.Incorrect
    );

    if (!isCorrectlySorted) {
      // remove from sortedTracks
      // TODO: Move incorrect cards to a graveyard area?
      setTimeout(() => {
        setSortedTracks((prevSortedTracks) => {
          return prevSortedTracks.filter(
            (track) => track.id !== currentTrackId
          );
        });
        setGuessState(GuessState.NoGuess);
        callback();
      }, 5000);
    } else {
      setTimeout(() => {
        setGuessState(GuessState.NoGuess);
        callback();
      }, 5000);
    }
  };

  return (
    <div>
      <h3>Try and sort these songs chronologically...</h3>
      {!!currentToken.accessToken && !!contextUri && (
        <WebPlayback
          token={currentToken.accessToken}
          sortedTracks={sortedTracks}
          contextUri={contextUri}
          setCurrentTrackId={setCurrentTrackId}
          setSortedTracks={setSortedTracks}
          onGuess={onGuess}
        />
      )}
      {!currentToken.accessToken && (
        <button onClick={onAuthorizeClickHandler}>Authorize</button>
      )}
      <SongGuessingArea
        currentTrackId={currentTrackId}
        sortedTracks={sortedTracks}
        setSortedTracks={setSortedTracks}
        guessState={guessState}
      />
    </div>
  );
}

function areTracksSorted(sortedTracks: TrackInformation[]) {
  for (let i = 1; i < sortedTracks.length; i++) {
    if (sortedTracks[i - 1].year > sortedTracks[i].year) {
      return false;
    }
  }
  return true;
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

import React from "react";
import "./MusicGame.css";
import SongGuessingArea from "./SongGuessingArea";
import SongCard, { TrackInformation } from "./SongCard";

import {
  checkForAccessToken,
  auth,
  SpotifyTokenResp,
  CurrentToken,
} from "./SpotifyHelpers";
import WebPlayback from "./WebPlayback";

// Somewhat prioritized TODOs
// TODO: pick random song as first track in sortedTracks - IMPLEMENTED ✅
// TODO: Maybe you get like 2 free skips instead of combining skips and guesses???
// TODO: Update styling so it's cute (and make the graveyard look a little different)
// TODO: make music game it's own page with no sidebar
// TODO: get oldest release date you can from spotify
// then we can try and get it running on the website

// Unprioritized TODOs

// TODO: When losing on a guess, continue playing the current song rather than skipping to the next one
// TODO: Handle for case when current song ends and next begins
// TODO: (LATER) Let users pass in their own playlist uris
// TODO: Reset shuffle state back to normal when done
// TODO: Transition album cover show/hide nicely

enum GuessState {
  Correct,
  Incorrect,
  NoGuess,
  Skip,
}

const NUM_MAX_INCORRECT_GUESSES = 3;
const NUM_MAX_SKIPS = 2;
const NUM_CORRECT_SONGS_TO_WIN = 10;

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
  const [incorrectTracks, setIncorrectTracks] = React.useState<
    TrackInformation[]
  >([]);
  const [sortedTracks, setSortedTracks] = React.useState<TrackInformation[]>(
    []
  );
  const [guessState, setGuessState] = React.useState<GuessState>(
    GuessState.NoGuess
  );
  const [numSkips, setNumSkips] = React.useState(0);

  const isGameWon =
    sortedTracks.length >= NUM_CORRECT_SONGS_TO_WIN &&
    guessState === GuessState.Correct;
  const isGameLost =
    incorrectTracks.length - numSkips >= NUM_MAX_INCORRECT_GUESSES;
  const isGameOver = isGameWon || isGameLost;

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
    };
    // on page load, check if we have an access token or code
    refreshTokenAndCheckPlayback();
  }, [currentToken, spotifyClientId]);

  const onSkip = async (callback: () => void) => {
    setNumSkips((prevNumSkips) => prevNumSkips + 1);
    setGuessState(GuessState.Skip);
    // maybe we want a little reveal??
    setTimeout(() => {
      const incorrectGuess = sortedTracks.find(
        (track) => track.id === currentTrackId
      );
      if (incorrectGuess) {
        setIncorrectTracks((prevTracks) => [...prevTracks, incorrectGuess]);
      }
      setSortedTracks((prevSortedTracks) => {
        return prevSortedTracks.filter((track) => track.id !== currentTrackId);
      });
      setGuessState(GuessState.NoGuess);
      callback();
    }, 5000);
  };

  const onGuess = async (callback: () => void) => {
    if (!currentTrackId || !currentToken.accessToken) {
      return;
    }

    const isCorrectlySorted = areTracksSorted(sortedTracks);

    // reveal SongCard
    setGuessState(
      isCorrectlySorted ? GuessState.Correct : GuessState.Incorrect
    );

    if (!isCorrectlySorted) {
      setTimeout(() => {
        // have to manually check win conditions here since setters in useState aren't reflected right away
        let isGameLost = false;
        const incorrectGuess = sortedTracks.find(
          (track) => track.id === currentTrackId
        );
        if (incorrectGuess) {
          setIncorrectTracks((prevTracks) => {
            const incorrectTracks = [...prevTracks, incorrectGuess];
            isGameLost =
              incorrectTracks.length - numSkips >= NUM_MAX_INCORRECT_GUESSES;
            return incorrectTracks;
          });
        }
        setSortedTracks((prevSortedTracks) => {
          return prevSortedTracks.filter(
            (track) => track.id !== currentTrackId
          );
        });

        if (!isGameLost) {
          setGuessState(GuessState.NoGuess);
          callback();
        }
      }, 5000);
    } else {
      setTimeout(() => {
        const isGameWon = sortedTracks.length >= NUM_CORRECT_SONGS_TO_WIN;
        if (!isGameWon) {
          setGuessState(GuessState.NoGuess);
          callback();
        }
      }, 5000);
    }
  };

  return (
    <div>
      <h3>Try and sort these songs chronologically</h3>
      <blockquote>
        Try and sort these songs in order ofthe year of the release date - left
        is the oldest, right is the most recent. You get {NUM_MAX_SKIPS} skips
        and {NUM_MAX_INCORRECT_GUESSES} incorrect guesses, aiming for{" "}
        {NUM_CORRECT_SONGS_TO_WIN} songs correctly ordered to win. Drag and drop
        the song card with the question marks where you think it lies
        chronologically and click the 'Guess' button to get started!
      </blockquote>
      {isGameWon ? (
        <>
          <p>Wooo!!! You won!!! Here is a croissant 🥐</p>
          <PlayAgain />
        </>
      ) : isGameLost ? (
        <>
          <p>Dang, no dice. Better luck next time, cowboy 😞</p>
          <PlayAgain />
        </>
      ) : null}
      {!!currentToken.accessToken && !!contextUri && (
        <WebPlayback
          token={currentToken.accessToken}
          sortedTracks={sortedTracks}
          contextUri={contextUri}
          setCurrentTrackId={setCurrentTrackId}
          setSortedTracks={setSortedTracks}
          onSkip={onSkip}
          onGuess={onGuess}
          guessDisabled={isGameOver}
          skipDisabled={isGameOver || numSkips >= NUM_MAX_SKIPS}
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
      <IncorrectlyGuessedSongs trackList={incorrectTracks} />
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

function PlayAgain() {
  return (
    <button
      className="btn-spotify-player"
      onClick={() => window.location.reload()}
    >
      Play again???
    </button>
  );
}

function IncorrectlyGuessedSongs({
  trackList,
}: {
  trackList: TrackInformation[];
}) {
  return (
    <div>
      <h4>Song graveyard</h4>
      <div className="song-guessing-scroll">
        <div className="song-guessing-row">
          {trackList.map((track) => (
            <SongCard
              key={track.id}
              track={track}
              compact
              extraClass="incorrect-guess"
            />
          ))}
        </div>
      </div>
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

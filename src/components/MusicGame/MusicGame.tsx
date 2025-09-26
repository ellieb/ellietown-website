import React from "react";
import "./MusicGame.css";
import SongGuessingArea from "./SongGuessingArea";
import SongCard, { TrackInformation } from "./SongCard";

import { checkForAccessToken, auth } from "./SpotifyHelpers";
import WebPlayback from "./WebPlayback";

// Completed TODOs
// TODO: Investigate and fix transitions after guessing cause it's rough rn - DONE ✅
// TODO: Also add animation when showing song information - DONE ✅
// TODO: get oldest release date you can from spotify - SOMEWHAT done 🟡
// TODO: Make a nice initial experience (Press "Start" then reveal first card.) - DONE ✅
// TODO: Transition album cover show/hide nicely - DONE ✅
// TODO: Make it s.t. you have a high score rather than a win and store it in a cookie - DONE ✅

// Unprioritized TODOs

// TODO: When losing on a guess, continue playing the current song rather than skipping to the next one? or just stop playing music../?
// TODO: Update styling so it's cute (and make the graveyard look a little different)
// TODO: Fix refresh token issues
// TODO: Handle for case when current song ends and next begins (increase skip?? or just pause until they make a guess?)
// TODO: (LATER) Let users pass in their own playlist uris
// TODO: Reset shuffle state back to normal when done
// TODO: Make sure we are following spotify's rules about playing/displaying music
// TODO: Make sure there are never repeats
// TODO: Mobile friendly

enum GuessState {
  Correct,
  Incorrect,
  NoGuess,
  Skip,
}

const NUM_MAX_INCORRECT_GUESSES = 1;
const NUM_MAX_SKIPS = 2;

function MusicGame() {
  const spotifyClientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
  const contextUri = process.env.REACT_APP_DEFAULT_PLAYLIST_ID;
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
  const [accessToken, setAccessToken] = React.useState(() =>
    localStorage.getItem("access_token")
  );
  const [score, setScore] = React.useState(0);

  const isGameOver =
    incorrectTracks.length - numSkips >= NUM_MAX_INCORRECT_GUESSES;

  if (!spotifyClientId) {
    throw new Error("Missing Spotify client ID");
  }

  const onAuthorizeClickHandler = async () => {
    await auth(); // this will redirect to spotify
  };

  React.useEffect(() => {
    const refreshTokenAndCheckPlayback = async () => {
      const newAccessToken = await checkForAccessToken();
      if (newAccessToken !== accessToken) {
        setAccessToken(newAccessToken);
      }
    };
    // on page load, check if we have an access token or code
    refreshTokenAndCheckPlayback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const highScore = Number(localStorage.getItem("highScore")) || 0;

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
    if (!currentTrackId || !accessToken) {
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
        const incorrectGuess = sortedTracks.find(
          (track) => track.id === currentTrackId
        );
        const isGameOver = incorrectGuess
          ? incorrectTracks.length + 1 - numSkips >= NUM_MAX_INCORRECT_GUESSES
          : false;
        if (incorrectGuess) {
          setIncorrectTracks((prevTracks) => [...prevTracks, incorrectGuess]);
        }
        setSortedTracks((prevSortedTracks) => {
          return prevSortedTracks.filter(
            (track) => track.id !== currentTrackId
          );
        });

        if (isGameOver) {
          if (score > highScore) {
            localStorage.setItem("highScore", score.toString());
          }
        } else {
          callback();
        }
      }, 5000);
    } else {
      setTimeout(() => {
        setScore((prevScore) => prevScore + 1);
        callback();
      }, 5000);
    }
  };

  return (
    <div>
      <h3>Music Sorting Game</h3>
      <blockquote>
        Try and sort these songs in order of the year of the release date - left
        is the oldest, right is the most recent. You get {NUM_MAX_SKIPS} skips
        and {NUM_MAX_INCORRECT_GUESSES} incorrect guesses, aiming to get as many
        correctly ordered songs as possible. Click the 'Start' button to get
        started!
      </blockquote>
      <div
        style={{
          border: "2px dotted var(--color-border)",
          borderRadius: "8px",
          padding: "0.5em",
          margin: "1em",
        }}
      >
        <p>
          Note: Since this is app uses Spotify's API in development mode, I need
          to individually add users in the app dashboard in order to access the
          app. If you can't access the game, please email me your name and email
          you use for Spotify (premium account is required) at{" "}
          <a href="mailto:ellieinellietown@gmail.com">
            ellieinellietown@gmail.com
          </a>
          .
        </p>
        <p>
          Note #2: This is still *very much* a work in progress. I am having
          issues getting the original release year for certain remastered songs,
          so please don't get too frustrated!
        </p>
      </div>
      {isGameOver && (
        <GameOverDisplay hasNewHighScore={score === highScore} score={score} />
      )}
      <ScoreDisplay score={score} highScore={highScore} />
      {!!accessToken && !!contextUri && (
        <WebPlayback
          token={accessToken}
          sortedTracks={sortedTracks}
          contextUri={contextUri}
          setCurrentTrackId={setCurrentTrackId}
          setSortedTracks={setSortedTracks}
          setGuessState={setGuessState}
          onSkip={onSkip}
          onGuess={onGuess}
          guessDisabled={isGameOver}
          skipDisabled={isGameOver || numSkips >= NUM_MAX_SKIPS}
        />
      )}
      {!accessToken && (
        <button
          className="btn-spotify-player"
          onClick={onAuthorizeClickHandler}
        >
          Authorize
        </button>
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

function ScoreDisplay({
  score,
  highScore,
}: {
  score: number;
  highScore: number;
}) {
  return (
    <div>
      <h2>Score: {score}</h2>
      <h2>High Score: {highScore}</h2>
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

function GameOverDisplay({
  hasNewHighScore,
  score,
}: {
  hasNewHighScore: boolean;
  score: number;
}) {
  // beat record
  const backgroundColor = hasNewHighScore ? "#b8d0c3" : "#d0b8b8";
  const text = hasNewHighScore
    ? `Wooo!!! You got a new high score of ${score}!!! Here is a croissant 🥐`
    : "Well, it was a good attempt. Better luck next time, cowboy 😞";

  return (
    <div
      style={{
        background: backgroundColor,
        borderRadius: "8px",
        padding: "0.5em",
        margin: "1em",
      }}
    >
      <p>{text}</p>
      <PlayAgain />
    </div>
  );
}

function PlayAgain() {
  return (
    <button
      className="btn-spotify-player"
      style={{ padding: "0.5em 1em" }}
      onClick={() => window.location.reload()}
    >
      Play again???
    </button>
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

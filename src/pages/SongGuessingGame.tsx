import React from "react";
import BasicLayout from "../components/BasicLayout";
import MusicGame from "../components/MusicGame/MusicGame";

//TODO: Persist music when browsing

function SongGuessingGame() {
  return (
    <BasicLayout leftSidebar={false}>
      <MusicGame
        redirectUri={"http://127.0.0.1:3000/fun-stuff/song-guessing-game"}
      />
    </BasicLayout>
  );
}

export default SongGuessingGame;

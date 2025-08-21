import React from "react";
import BasicLayout from "../components/BasicLayout";
import MusicGame from "../components/MusicGame/MusicGame";

//TODO: Persist music when browsing

function SongGuessingGame() {
  return (
    <BasicLayout leftSidebar={false}>
      <MusicGame />
    </BasicLayout>
  );
}

export default SongGuessingGame;

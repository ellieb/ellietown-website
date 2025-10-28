import dynamic from "next/dynamic";
import React from "react";
import BasicLayout from "../components/BasicLayout";

const MusicGame = dynamic(() => import("components/MusicGame/MusicGame"), {
  ssr: false,
});

//TODO: Persist music when browsing
function SongGuessingGame() {
  return (
    <BasicLayout leftSidebar={false}>
      <MusicGame />
    </BasicLayout>
  );
}

export default SongGuessingGame;

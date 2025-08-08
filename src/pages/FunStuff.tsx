import React from "react";
import BasicLayout from "../components/BasicLayout";
import MusicGame from "../components/MusicGame/MusicGame";

function FunStuff() {
  return (
    <BasicLayout>
      <p>Look at all this fun stuff here..</p>
      <MusicGame />
      {/* <Section title={"Song game"}>
        Guess when the song was released? Inspired by Hitster.

      </Section> */}
      {/* Can choose specific playlist perhaps? But defaults to 
        some best 1000 songs of the last 100 years maybe */}

      {/* <div>games</div>
      <div>blinkies</div>
      <div>polls</div>
      <div>personality quizzes</div> */}
    </BasicLayout>
  );
}

export default FunStuff;

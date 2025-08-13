import React from "react";
import BasicLayout from "../components/BasicLayout";

function FunStuff() {
  return (
    <BasicLayout>
      <p>Look at all this fun stuff here... :p jk</p>
      <p>
        There is not much - YET - but check out{" "}
        <a href={"/fun-stuff/song-guessing-game"}>
          this Hitster-inspired music guessing game I made!
        </a>
      </p>
      {/* <div>games</div>
      <div>blinkies</div>
      <div>polls</div>
      <div>personality quizzes</div> */}
    </BasicLayout>
  );
}

export default FunStuff;

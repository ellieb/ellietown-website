import React from "react";
import BasicLayout from "../components/BasicLayout";
import Section from "../components/Section";

function FunStuff({}) {
  return (
    <BasicLayout>
      <p>Look at all this fun stuff here..</p>
      <Section title={"Song game"}>
        Guess when the song was released? Inspired by Hitster.
        {/* Can choose specific playlist perhaps? But defaults to 
        some best 1000 songs of the last 100 years maybe */}
      </Section>

      {/* <div>games</div>
      <div>blinkies</div>
      <div>polls</div>
      <div>personality quizzes</div> */}
    </BasicLayout>
  );
}

export default FunStuff;

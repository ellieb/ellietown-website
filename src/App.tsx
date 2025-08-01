import React from "react";
import "./styles/App.css";
import BasicLayout from "./components/BasicLayout";
import Section from "./components/Section";
import Marquee from "./components/Marquee";

function App() {
  return (
    <>
      <Marquee>🌟 WARNING - WORK IN PROGRESS 🌟</Marquee>
      <BasicLayout>
        <Section title={"Welcome to my site!"}>
          <p>hello world! welcome to my virtual hangout spot 🫧😎👽</p>
          <p>
            this is a lil project for me to try some new things out, a little
            design, a little game or too, some integrations, etc.
          </p>
          <img
            src="https://media.tenor.com/vt3W-PX-GUkAAAAC/welcome-to-my-home-gary-oldman.gif"
            alt="Dracula also welcomes you"
          />
        </Section>
      </BasicLayout>
    </>
  );
}

export default App;

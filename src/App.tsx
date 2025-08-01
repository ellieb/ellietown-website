import React from "react";
import "./styles/App.css";
import BasicLayout from "./components/BasicLayout";

function App() {
  return (
    <>
      <div style={{ overflow: "hidden" }}>
        <div className="scrolling-text">🌟 WARNING - WORK IN PROGRESS 🌟</div>
      </div>
      <BasicLayout>
        <Section>
          <h2>Welcome to my site!</h2>
          <p>hello world! welcome to my home 🫧😎👽</p>
          <img
            src="https://media.tenor.com/vt3W-PX-GUkAAAAC/welcome-to-my-home-gary-oldman.gif"
            alt="Dracula also welcomes you"
          />
        </Section>
      </BasicLayout>
    </>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="section">{children}</div>;
}

export default App;

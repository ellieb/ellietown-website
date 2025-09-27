import React from "react";
import GlobalStyles from "./styles/GlobalStyles";
import Home from "./pages/Home";
import Marquee from "./components/Marquee";

function App() {
  return (
    <>
      <GlobalStyles />
      <Marquee>🌟 WARNING - WORK IN PROGRESS 🌟</Marquee>
      <Home />
    </>
  );
}

export default App;

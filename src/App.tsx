import React from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import FunStuff from "./pages/FunStuff";
import MyStuff from "./pages/MyStuff";
import SongGuessingGame from "./pages/SongGuessingGame";
import BirdFeed from "./pages/BirdFeed";
import About from "./pages/About";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/my-stuff" element={<MyStuff />} />
        <Route path="/fun-stuff" element={<FunStuff />} />
        <Route
          path="/fun-stuff/song-guessing-game"
          element={<SongGuessingGame />}
        />
        <Route path="/fun-stuff/bird-feed" element={<BirdFeed />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

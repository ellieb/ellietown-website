import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import App from "./App";
import NotFound from "./pages/NotFound";
import FunStuff from "./pages/FunStuff";
import MyStuff from "./pages/MyStuff";
import SongGuessingGame from "./pages/SongGuessingGame";

import About from "./pages/About";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <BrowserRouter>
    <React.StrictMode>
      <Routes>
        <Route index element={<App />} />
        <Route path="/about" element={<About />} />
        <Route path="/my-stuff" element={<MyStuff />} />
        <Route path="/fun-stuff" element={<FunStuff />} />
        <Route
          path="/fun-stuff/song-guessing-game"
          element={<SongGuessingGame />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.StrictMode>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

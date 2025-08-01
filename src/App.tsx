import React from "react";
import "./App.css";

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

function Header() {
  return (
    <header className="header">
      <h1>~*~ ellie's special spot~*~</h1>
      <h2 style={{ textAlign: "center" }}>enter, if u dare</h2>

      <nav className="navbar">
        <ul>
          <li>
            <a href="/">home</a>
          </li>{" "}
          <li>
            <a href="/about">about</a>
            <ul>
              <li>
                <a href="/fun-stuff/about-me">about me</a>
              </li>
              <li>
                <a href="/fun-stuff/about-the-site">about the site</a>
              </li>
              <li>
                <a href="/fun-stuff/guestbook">guestbook</a>
              </li>
            </ul>
          </li>{" "}
          <li>
            <a href="/my-stuff">my stuff</a>
            <ul>
              <li>
                <a href="/fun-stuff/spotify-playlists">spotify playlists</a>
              </li>
              <li>
                <a href="/fun-stuff/coding-projects">coding projects</a>
              </li>
              <li>
                <a href="/fun-stuff/media-i-love">media I love</a>
              </li>
              <li>
                <a href="/fun-stuff/kombucha-blog">kombucha blog</a>
              </li>
            </ul>
          </li>{" "}
          <li>
            <a href="/fun-stuff">fun stuff</a>
            <ul>
              <li>
                <a href="/fun-stuff/games">games</a>
              </li>
              <li>
                <a href="/fun-stuff/blinkies">blinkies</a>
              </li>
              <li>
                <a href="/fun-stuff/polls">polls</a>
              </li>
              <li>
                <a href="/fun-stuff/personality-quizzes">personality quizzes</a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </header>
  );
}

function Sidebar() {
  return <div className="sidebar">Sidebar</div>;
}

function Footer() {
  return (
    <div className="footer">
      <p>
        <span className="blink">Under Construction 🚧</span>
      </p>
      <p>&copy; 1999-2025 Ellie’s Totally Awesome Blog</p>
      <p>
        <img
          src="https://www.animatedimages.org/data/media/171/animated-under-construction-image-0040.gif"
          alt="Under Construction"
        />
        <img
          src="https://www.animatedimages.org/data/media/113/animated-email-image-0008.gif"
          alt="Email Me!"
        />
      </p>
    </div>
  );
}

function MainContent({ children }: { children: React.ReactNode }) {
  return <div className="main-content">{children}</div>;
}

function BasicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="App">
      <div className="layout">
        <Header />
        <Sidebar />
        <MainContent>{children}</MainContent>
        <Footer />
      </div>
    </div>
  );
}

export default App;

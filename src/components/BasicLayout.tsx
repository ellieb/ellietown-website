import React from "react";
import "./BasicLayout.css";

function Header() {
  return (
    <header className="header">
      <h1>~*~ ellietown ~*~</h1>
      {/* <h2 style={{ textAlign: "center" }}>enter, if u dare</h2> */}

      <nav className="navbar">
        <ul>
          <li>
            <a href="/">home</a>
          </li>{" "}
          {/* <li>
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
          </li>{" "} */}
          <li>
            <a href="/my-stuff">my stuff</a>
            {/* <ul>
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
            </ul> */}
          </li>{" "}
          <li>
            <a href="/fun-stuff">fun stuff</a>
            {/* <ul>
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
            </ul> */}
          </li>
        </ul>
      </nav>
    </header>
  );
}

function Sidebar() {
  // TODO: Media player
  // TODO: What I'm listening to on Spotify ATM?
  // https://developer.spotify.com/documentation/web-api/howtos/web-app-profile

  return (
    <div className="sidebar">
      Sidebar Might be cool to add a lil media player here :P
    </div>
  );
}

function Footer() {
  return (
    <div className="footer">
      <p>
        <span className="blink">Under Construction 🚧</span>
      </p>
      <p>&copy; 2025 ellietown</p>
    </div>
  );
}

function MainContent({ children }: { children: React.ReactNode }) {
  return <div className="main-content">{children}</div>;
}

function BasicLayout({
  leftSidebar = false,
  children,
}: {
  leftSidebar?: boolean;
  children: React.ReactNode;
}) {
  const layoutStyling = leftSidebar
    ? {
        gridTemplateColumns: "200px 1fr",
        gridTemplateRows: "auto 1fr auto",
        gridTemplateAreas: '"header header" "sidebar main" "footer footer"',
      }
    : {
        gridTemplateColumns: "auto",
        gridTemplateRows: "auto 1fr auto",
        gridTemplateAreas: '"header" "main" "footer"',
      };

  return (
    <div className="App">
      <div className="layout" style={layoutStyling}>
        <Header />
        {leftSidebar && <Sidebar />}
        <MainContent>{children}</MainContent>
        <Footer />
      </div>
    </div>
  );
}

export default BasicLayout;

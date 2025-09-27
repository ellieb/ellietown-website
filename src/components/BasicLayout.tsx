import React from "react";
import GlobalStyles from "../styles/GlobalStyles";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";

// TODO: Inject GlobalStyles in all pages by default (provider?)
// TODO: clean up routing (are we using App.tsx properly?)

// Keyframes for animations
const blinker = keyframes`
  50% {
    opacity: 0;
  }
`;

// Styled components
const AppContainer = styled.div`
  text-align: center;
`;

const Layout = styled.div<{
  gridTemplateColumns: string;
  gridTemplateRows: string;
  gridTemplateAreas: string;
}>`
  max-width: 80vw;
  margin: 0.5em auto;
  display: grid;
  grid-gap: 0.5em;
  grid-template-columns: ${({ gridTemplateColumns }) => gridTemplateColumns};
  grid-template-rows: ${({ gridTemplateRows }) => gridTemplateRows};
  grid-template-areas: ${({ gridTemplateAreas }) => gridTemplateAreas};
  min-height: 100vh;
`;

const Header = styled.header`
  grid-area: header;
  background-color: var(--color-content-background);
  padding: 20px;
  border: var(--main-border);
  border-radius: 10px;
`;

const Sidebar = styled.div`
  grid-area: sidebar;
  background-color: var(--color-content-background);
  padding: 20px;
  border: var(--main-border);
  border-radius: 10px;
`;

const MainContent = styled.div`
  grid-area: main;
  min-width: 0; /* used to make overflow scrolling work somehow */
  background-color: var(--color-content-background);
  padding: 20px;
  border: var(--main-border);
  border-radius: 10px;
`;

const Footer = styled.div`
  grid-area: footer;
  background-color: var(--color-content-background);
  text-align: center;
  color: var(--color-text-subtitle);
  padding: 20px;
  border: var(--main-border);
  border-radius: 10px;
`;

const Navbar = styled.nav`
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    gap: 20px;
    justify-content: center;
  }

  li {
    position: relative;
  }

  a {
    text-decoration: none;
    color: var(--color-text);
    padding: 10px 15px;
    display: block;
    transition: color 0.3s ease;

    &:hover {
      color: var(--color-text-accent);
    }
  }

  ul ul {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    background: var(--color-dropdown-background);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    min-width: 150px;
    z-index: 1000;
    flex-direction: column;
    gap: 0;
  }

  li:hover > ul {
    display: block;
  }

  ul ul li {
    border-bottom: 1px solid var(--color-border);
  }

  ul ul li:last-child {
    border-bottom: none;
  }

  ul ul a {
    padding: 12px 15px;
    white-space: nowrap;

    &:hover {
      background: var(--color-dropdown-hover);
    }
  }

  ul ul li:first-of-type a:hover {
    border-radius: 3px 3px 0px 0px;
  }

  ul ul li:last-child a:hover {
    border-radius: 0px 0px 3px 3px;
  }
`;

const BlinkSpan = styled.span`
  animation: ${blinker} 1s linear infinite;
`;

function HeaderComponent() {
  return (
    <Header>
      <h1>~*~ ellietown ~*~</h1>
      {/* <h2 style={{ textAlign: "center" }}>enter, if u dare</h2> */}

      <Navbar>
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
      </Navbar>
    </Header>
  );
}

function SidebarComponent() {
  // TODO: Media player
  // TODO: What I'm listening to on Spotify ATM?
  // https://developer.spotify.com/documentation/web-api/howtos/web-app-profile

  return (
    <Sidebar>Sidebar Might be cool to add a lil media player here :P</Sidebar>
  );
}

function FooterComponent() {
  return (
    <Footer>
      <p>
        <BlinkSpan>Under Construction 🚧</BlinkSpan>
      </p>
      <p>&copy; 2025 ellietown</p>
    </Footer>
  );
}

function MainContentComponent({ children }: { children: React.ReactNode }) {
  return <MainContent>{children}</MainContent>;
}

function BasicLayout({
  leftSidebar = false,
  children,
}: {
  leftSidebar?: boolean;
  children: React.ReactNode;
}) {
  const layoutProps = leftSidebar
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
    <AppContainer>
      <GlobalStyles />
      <Layout {...layoutProps}>
        <HeaderComponent />
        {leftSidebar && <SidebarComponent />}
        <MainContentComponent>{children}</MainContentComponent>
        <FooterComponent />
      </Layout>
    </AppContainer>
  );
}

export default BasicLayout;

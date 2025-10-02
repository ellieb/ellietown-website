import React from "react";
import Section from "../components/Section";
import BasicLayout from "../components/BasicLayout";
import Marquee from "../components/Marquee";

function Home() {
  return (
    <>
      <Marquee>🌟 WARNING - WORK IN PROGRESS 🌟</Marquee>
      <BasicLayout>
        <Section title={"Welcome to my site!"}>
          <p>hello hello! 🫧😎👽</p>
          <p>
            This is a lil project for me to try some new things out, a little
            design, a little game or two, some integrations, etc. It is pretty
            bare-bones right now, but I'm hoping to slowly flesh it out into
            something I'm happy with.
          </p>
          {/* <img
        src="https://media.tenor.com/vt3W-PX-GUkAAAAC/welcome-to-my-home-gary-oldman.gif"
        alt="Dracula also welcomes you"
      /> */}
        </Section>
        {/* TODO: Move these following sections to the about page when there is enough 
      content to have two separate pages */}
        <Section title={"About me"}>
          I am (sometimes) a software developer and have recently decided to
          make a lil personal website! The idea for this project is to give
          myself a personal space to play around with web development, get a
          little bit of practice, and have fun.
        </Section>

        <Section title={"About this site"}>
          Some resources I have used will be listed here.
          <ul>
            <li>google fonts</li>
            <li>
              <a
                href={"https://petrapixel.neocities.org"}
                target="_blank"
                rel="noopener noreferrer"
              >
                https://petrapixel.neocities.org
              </a>
            </li>
            <li>
              <a
                href="https://omni.vi/#index"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://omni.vi/#index
              </a>
            </li>
            <li>
              <a
                href="https://angs-corner.nekoweb.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://angs-corner.nekoweb.org/
              </a>
            </li>
            <li>
              <a
                href="https://favicon.io/favicon-generator/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://favicon.io/favicon-generator/
              </a>
            </li>
            <li>
              <a
                href="https://developer.mozilla.org/en-US/docs/Learn_web_development/Core"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://developer.mozilla.org/en-US/docs/Learn_web_development/Core
              </a>
            </li>
            <li>
              <a
                href="https://www.transparenttextures.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.transparenttextures.com/
              </a>
            </li>
            <li>
              <a
                href="https://pixelartmaker.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://pixelartmaker.com/
              </a>
            </li>
            <li>
              <a
                href="https://fontsinuse.com/tags/4384/stephen-king/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://fontsinuse.com/tags/4384/stephen-king/
              </a>
            </li>
            <li>
              <a
                href="https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow/
              </a>
            </li>
            <li>
              <a
                href="https://github.com/spotify/web-api-examples/blob/master/authorization/authorization_code_pkce/public/app.js/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://github.com/spotify/web-api-examples/blob/master/authorization/authorization_code_pkce/public/app.js/
              </a>
            </li>
            <li>
              <a
                href="https://docs.dndkit.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://docs.dndkit.com/
              </a>
            </li>
          </ul>
        </Section>
      </BasicLayout>
    </>
  );
}

export default Home;

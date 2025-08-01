import React from "react";
import BasicLayout from "../components/BasicLayout";
import Section from "../components/Section";

function About() {
  return (
    <BasicLayout>
      <Section title={"About me"}>
        Hello! I am (sometimes) a software developer and have recently decided
        to make a lil personal website! The idea for this project is to give
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
        </ul>
      </Section>

      {/* <Section title={"Guestbook"}>
        TODO
      </Section> */}
    </BasicLayout>
  );
}

export default About;

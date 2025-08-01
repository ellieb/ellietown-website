import React from "react";
import BasicLayout from "../components/BasicLayout";
import Section from "../components/Section";

//TODO: Persist music when browsing?

function MyStuff({}) {
  return (
    <BasicLayout>
      <Section title={"What I've been listening to lately"}>
        <blockquote>
          Check out my{" "}
          <a
            href="https://stats.fm/user/ebadun?range=current_year"
            target="_blank"
            rel="noopener noreferrer"
          >
            stats.fm
          </a>{" "}
          for a more objective overview of my listening habits 😇
        </blockquote>
        <p>
          My latest obsession (I know it's not fall yet but the
          relaxed/melancholy mood fits the feeling of yet another summer that is
          passing me by)
        </p>
        <iframe
          data-testid="embed-iframe"
          style={{ borderRadius: "12px" }}
          src="https://open.spotify.com/embed/playlist/6UGW1e2oNrEgaAdwm0utUo?utm_source=generator&theme=0"
          width="100%"
          height="352"
          frameBorder="0"
          allowFullScreen={false}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>

        <p>
          If it was on spotify, this song would be #1 in that playlist!
          heartbreaking and beautiful
        </p>
        <iframe
          width="560"
          height="315"
          src="https://www.youtube-nocookie.com/embed/cJLq_K45Ro8?si=zQHKQ52VHz4nuURA"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>

        <p>
          Also been enjoying this playlist which I was inspired to make after
          watching the first episode of "Berserk" and loving the opening/closing
          themes so much.
        </p>
        <iframe
          data-testid="embed-iframe"
          style={{ borderRadius: "12px" }}
          src="https://open.spotify.com/embed/playlist/3kUg48VuOaoFGI763LvdVe?utm_source=generator"
          width="100%"
          height="352"
          frameBorder="0"
          allowFullScreen={false}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        ></iframe>

        <p>
          I think next playlist I should make should be songs like "Everything
          in it's right place" since I NEED to listen to that song daily but I
          really don't want to wear it out
        </p>
      </Section>

      {/* <Section title="Playlists">
        <p>Check out my playlists 🎶</p>
        <a href="https://open.spotify.com/playlist/4n3Ieo0y6bE0OhLhMWlV8o?si=b51887dd398a48f4">
          J'ai une ame solitaire
        </a>
        <div>
          <iframe
            data-testid="embed-iframe"
            style={{ borderRadius: "12px" }}
            src="https://open.spotify.com/embed/playlist/4n3Ieo0y6bE0OhLhMWlV8o?utm_source=generator"
            width="100%"
            height="352"
            frameBorder="0"
            allowFullScreen={true}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>
      </Section> */}

      <Section title="Movies">
        <p>My fav movies, ok???</p>
        <ul>
          <li>Eternal Sunshine</li>
          <li>PeeWees Big Adventure</li>
          <li>The Lost Boys</li>
          <li>Howl's Moving Castle</li>
          <li>Some Like It Hot</li>
          <li>Alien</li>
          <li>Kill Bill</li>
          <li>tbc...</li>
        </ul>
      </Section>

      {/* <div>coding projects</div> */}
      {/* <div>media I love</div> */}

      <Section title={"Kombucha Diaries"}>
        <p>
          I have been making kombucha since around May 2025. I want to document
          any particularly delicious flavour combinations I try out, and
          hopefully include some pictures in the future! Some of the best
          flavours so far have been:
          <ul>
            <li>apple ginger</li>
            <li>passionfruit</li>
            <li>orange ginger (with freshly squeezed juice!)</li>
            <li>cherry</li>
            <li>blueberry</li>
          </ul>
          I have yet to mess around with different varieties of tea...
          {/* TODO: Talk about the Noma Guide to Fermentation */}
        </p>
      </Section>
    </BasicLayout>
  );
}

export default MyStuff;

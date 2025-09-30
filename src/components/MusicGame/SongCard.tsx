import React from "react";
import styled from "@emotion/styled";
import { keyframes, css } from "@emotion/react";

// Keyframes for animations
const fadeIncorrect = keyframes`
  0% {
    background-color: #e59595;
  }
  100% {
    background-color: var(--color-card);
  }
`;

const fadeCorrect = keyframes`
  0% {
    background-color: #b0efb0;
  }
  100% {
    background-color: var(--color-card);
  }
`;

// Styled components
const SongDisplay = styled.div<{ compact?: boolean }>`
  display: inline-flex;
  font-family: "Pirata One", "UnifrakturCook", system-ui, "celticBit";
  justify-content: space-between;
  min-height: 160px;
  max-height: 160px;
  width: 310px;
  -webkit-transition: width 0.5s ease-in-out;
  -moz-transition: width 0.5s ease-in-out;
  -o-transition: width 0.5s ease-in-out;
  transition: width 0.5s ease-in-out;
  perspective: 1000px;

  ${({ compact }) =>
    compact &&
    `
    width: 160px;
    gap: 0em;
  `}
`;

const FlipCardInner = styled.div<{ isFlipped?: boolean }>`
  position: relative;
  width: 100%;
  text-align: center;
  transition: transform 0.8s;
  transform-style: preserve-3d;
  transform: ${({ isFlipped }) => (isFlipped ? "rotateY(180deg)" : "none")};
`;

const HiddenSide = styled.div`
  position: absolute;
  padding: 8px;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  background-color: black;
  line-height: 132px;
  color: white;
  font-size: 48px;
`;

const AllSongInfo = styled.div<{
  extraClass?: string;
  isCorrect?: boolean;
  isIncorrect?: boolean;
}>`
  position: absolute;
  padding: 8px;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  background-color: var(--color-card);
  transform: rotateY(180deg);

  ${({ extraClass }) =>
    extraClass === "incorrect-guess" &&
    `
    background-color: #d4d4d4;
  `}

  ${({ isCorrect }) =>
    isCorrect &&
    css`
      animation: ${fadeCorrect} 5s ease-in-out;
    `}

  ${({ isIncorrect }) =>
    isIncorrect &&
    css`
      animation: ${fadeIncorrect} 5s ease-in-out;
    `}
`;

const AlbumCover = styled.img<{ compact?: boolean }>`
  border-radius: 5px;
  object-fit: contain;
  width: 140px;
  -webkit-transition: width 0.5s ease-in-out;
  -moz-transition: width 0.5s ease-in-out;
  -o-transition: width 0.5s ease-in-out;
  transition: width 0.5s ease-in-out;

  ${({ compact }) =>
    compact &&
    `
    width: 0;
    visibility: hidden;
  `}
`;

const SongInformation = styled.div`
  display: inline-grid;
  grid-template-areas:
    "name"
    "year"
    "album-info";
  grid-template-rows: 30px 70px 40px;
  grid-template-columns: auto;
  text-align: center;
  justify-content: center;
  min-width: 140px;
`;

const SongName = styled.p<{ extraClass?: string }>`
  grid-area: name;
  font-size: 12px;
  color: var(--color-text-subtitle);
  margin: 0px;

  ${({ extraClass }) =>
    extraClass === "incorrect-guess" &&
    `
    color: #6b6b6b;
  `}
`;

const SongArtist = styled.p<{ extraClass?: string }>`
  grid-area: artist;
  font-size: 14px;
  color: var(--color-text);
  margin: 0px;

  ${({ extraClass }) =>
    extraClass === "incorrect-guess" &&
    `
    color: #383838;
  `}
`;

const SongAlbum = styled.p<{ extraClass?: string }>`
  font-size: 12px;
  font-style: italic;
  color: var(--color-text-subtitle);
  margin: 0px;

  ${({ extraClass }) =>
    extraClass === "incorrect-guess" &&
    `
    color: #6b6b6b;
  `}
`;

const SongYear = styled.p<{ extraClass?: string }>`
  grid-area: year;
  font-size: 48px;
  color: var(--color-text);
  margin: 0px;

  ${({ extraClass }) =>
    extraClass === "incorrect-guess" &&
    `
    color: #383838;
  `}
`;

const SongAlbumInfo = styled.div`
  grid-area: album-info;
  align-self: end;
`;

export type TrackInformation = {
  id: string;
  uri: string; // item.uri
  name: string; // item.name
  artist: string; // item.artists[0].name
  album: string; // item.album.name
  year: number; // new Date(item.album.release_date).getUTCFullYear()
  albumCoverUrl: string; // item.album.images[0].url
};

function SongCard({
  track,
  compact = false,
  hidden = false,
  extraClass = "",
  isCorrect = false,
  isIncorrect = false,
}: {
  track: TrackInformation;
  compact?: boolean;
  hidden?: boolean;
  extraClass?: string;
  isCorrect?: boolean;
  isIncorrect?: boolean;
}) {
  const { name, artist, album, year, albumCoverUrl } = track;

  return (
    <SongDisplay compact={compact}>
      <FlipCardInner isFlipped={!hidden}>
        <HiddenSide>????</HiddenSide>
        <AllSongInfo
          extraClass={extraClass}
          isCorrect={isCorrect}
          isIncorrect={isIncorrect}
        >
          <AlbumCover compact={compact} src={albumCoverUrl} alt="album cover" />
          <SongInformation>
            <SongName extraClass={extraClass}>{name}</SongName>
            <SongYear extraClass={extraClass}>{year}</SongYear>
            <SongAlbumInfo>
              <SongArtist extraClass={extraClass}>{artist}</SongArtist>
              <SongAlbum extraClass={extraClass}>{album}</SongAlbum>
            </SongAlbumInfo>
          </SongInformation>
        </AllSongInfo>
      </FlipCardInner>
    </SongDisplay>
  );
}

export default SongCard;

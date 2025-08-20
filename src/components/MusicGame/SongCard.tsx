import React from "react";
import "./SongCard.css";

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
}: {
  track: TrackInformation;
  compact?: boolean;
  hidden?: boolean;
  extraClass?: string;
}) {
  const { name, artist, album, year, albumCoverUrl } = track;

  return (
    <div className={"song-display ".concat(compact ? "compact" : "")}>
      <div
        className="flip-card-inner"
        style={hidden ? {} : { transform: "rotateY(180deg)" }}
      >
        <div className="hidden">????</div>
        <div className={"all-song-info ".concat(extraClass ? extraClass : "")}>
          <img
            className={"song-album-cover ".concat(compact ? "compact" : "")}
            src={albumCoverUrl}
            alt="album cover"
          />
          <div className="song-information">
            <p className="song-name">{name}</p>
            <p className="song-year">{year}</p>
            <div className="song-album-info">
              <p className="song-artist">{artist}</p>
              <p className="song-album">{album}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SongCard;

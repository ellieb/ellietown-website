import React from "react";
import "./SongCard.css";

export type TrackInformation = {
  id: string;
  uri: string; // item.uri
  name: string; // item.name
  artist: string; // item.artists[0].name
  album: string; // item.album.name
  year: number; // new Date(item.album.release_date).getFullYear()
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
  const style = compact
    ? {
        minHeight: "160px",
        maxHeight: "160px",
        minWidth: "160px",
        maxWidth: "160px",
      }
    : {
        minHeight: "160px",
        maxHeight: "160px",
        minWidth: "310px",
        maxWidth: "310px",
      };

  return hidden ? (
    <div className={"hidden ".concat(extraClass)} style={style}>
      ????
    </div>
  ) : (
    <div className={"song-display ".concat(extraClass)} style={style}>
      {!compact && (
        <img
          className="song-album-cover"
          src={albumCoverUrl}
          alt="album cover"
        />
      )}
      <div className="song-information">
        <p className="song-name">{name}</p>
        <p className="song-year">{year}</p>
        <div className="song-album-info">
          <p className="song-artist">{artist}</p>
          <p className="song-album">{album}</p>
        </div>
      </div>
    </div>
  );
}

export default SongCard;

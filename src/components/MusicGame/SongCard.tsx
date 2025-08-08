import React from "react";
import "./SongCard.css";

export type TrackInformation = {
  id: string;
  uri: string; // item.uri
  name: string; // item.name
  artist: string; // item.artists[0].name
  album: string; // item.album.name
  year?: number; // Optional since we can't get release_date from simplified album
  albumCoverUrl: string; // item.album.images[0].url
};

function SongCard({
  track,
  compact = false,
  hidden = false,
}: {
  track: TrackInformation;
  compact?: boolean;
  hidden?: boolean;
}) {
  const { name, artist, album, year, albumCoverUrl } = track;
  const dimensions = compact
    ? { height: "224px", width: "224px" }
    : { height: "224px", width: "448px" };

  return hidden ? (
    <div className="hidden" style={dimensions}>
      ????
    </div>
  ) : (
    <div className="song-display" style={dimensions}>
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
        <div>
          <p className="song-artist">{artist}</p>
          <p className="song-album">{album}</p>
        </div>
      </div>
    </div>
  );
}

export default SongCard;

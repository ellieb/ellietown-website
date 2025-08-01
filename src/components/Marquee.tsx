import React from "react";
import "./Marquee.css";

function Marquee({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflow: "hidden" }}>
      <div className="scrolling-text">{children}</div>
    </div>
  );
}

export default Marquee;

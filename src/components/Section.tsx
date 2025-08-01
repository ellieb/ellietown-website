import React from "react";
import "./Section.css";

function Section({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="section">
      {!!title && <h3>{title}</h3>}
      {children}
    </div>
  );
}

export default Section;

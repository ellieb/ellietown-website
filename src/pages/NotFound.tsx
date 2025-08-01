import React from "react";
import BasicLayout from "../components/BasicLayout";

function NotFound() {
  return (
    <div style={{ padding: "5em", textAlign: "center" }}>
      <h1>There is nothing here... {">.<"} </h1>
      <h3>
        <a href="/">Go home?</a>
      </h3>
    </div>
  );
}

export default NotFound;

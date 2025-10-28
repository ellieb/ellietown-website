import React from "react";
import Link from "next/link";
import BasicLayout from "components/BasicLayout";

function NotFound() {
  return (
    <BasicLayout>
      <div style={{ padding: "5em", textAlign: "center" }}>
        <h1>There is nothing here... {">.<"} </h1>
        <h3>
          <Link href="/">Go home?</Link>
        </h3>
      </div>
    </BasicLayout>
  );
}

export default NotFound;

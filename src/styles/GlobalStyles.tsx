import { Global, css } from "@emotion/react";

const GlobalStyles = () => (
  <Global
    styles={css`
      * {
        box-sizing: border-box;
      }

      /* Global variables */
      :root {
        /* Background colors */
        --color-background: #ccedff;
        --color-content-background: #fcfcfc9d;
        --color-navbar: #668190;
        --color-border: #004a72;
        --color-dropdown-background: white;
        --color-dropdown-hover: #e5ebf0;
        --color-blockquote-background: #00000010;

        /* Button colors */
        --color-button: #e2e8f4;
        --color-button-hover: #d3d1e2;
        --color-button-active: #a7a6b5;
        --color-button-disabled: #b8b8b8;
        --color-button-border-disabled: #7d7d7d;

        /* Text colors */
        --color-text: #000352;
        --color-text-navbar: var(--color-text);
        --color-text-warning: #5d0000;
        --color-text-subtitle: #7e7e7e;
        --color-text-accent: #007bff;

        /* Song card colors */
        --color-card: var(--color-button);

        --main-border: 5px double var(--color-border);
      }

      /* Fonts */
      @font-face {
        font-family: "celticBit";
        src: url("../fonts/celtic-bit.ttf") format("truetype"),
          url("../fonts/celtic-bit.woff") format("woff");
      }

      @font-face {
        font-family: "celticBitThin";
        src: url("../fonts/celtic-bit-thin.ttf") format("truetype"),
          url("../fonts/celtic-bit-thin.woff") format("woff");
      }

      @font-face {
        font-family: "celticBitty";
        src: url("../fonts/celtic-bitty.ttf") format("truetype"),
          url("../fonts/celtic-bitty.woff") format("woff");
      }

      .pirata-one-regular {
        font-family: "Pirata One", system-ui;
        font-weight: 400;
        font-style: normal;
      }

      .unifrakturcook-bold {
        font-family: "UnifrakturCook", cursive;
        font-weight: 700;
        font-style: normal;
      }

      .pixelify-sans {
        font-family: "Pixelify Sans", sans-serif;
        font-optical-sizing: auto;
        font-weight: 400;
        font-style: normal;
      }

      .jacquard-12-regular {
        font-family: "Jacquard 12", system-ui;
        font-weight: 400;
        font-style: normal;
      }

      /* Global styling */
      body {
        background: url("https://pixelartmaker-data-78746291193.nyc3.digitaloceanspaces.com/image/234a9d63c98f125.png")
          top center / 438px 282px;
        background-repeat: repeat;
        background-color: var(--color-background);
        font-family: "Pixelify Sans", sans-serif;
        font-weight: 400;
        color: var(--color-text);
        padding: 0;
        margin: 0;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      code {
        font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
          monospace;
      }

      h1 {
        text-align: center;
        color: var(--color-text);
        font-family: "Pirata One", "UnifrakturCook", system-ui, "celticBit";
      }

      h2 {
        color: var(--color-text);
        font-family: "Pirata One", "UnifrakturCook", system-ui, "celticBit";
      }

      blockquote {
        background: var(--color-blockquote-background);
        padding: 1em;
        margin: 1em 0;
        border-radius: 8px;
      }
    `}
  />
);

export default GlobalStyles;

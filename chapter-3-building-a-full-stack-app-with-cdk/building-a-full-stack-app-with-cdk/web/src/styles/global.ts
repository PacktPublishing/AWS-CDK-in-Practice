import { createGlobalStyle } from 'styled-components';

export const Global = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    outline: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
  }

  body, button, input, textarea, select {
    -webkit-font-smoothing: antialiased;
    font-family: 'Roboto', sans-serif;
    font-style: normal;
  }

  h1, h2, h3, h4, h5, h6, a {
    font-family: 'Roboto', sans-serif;
  }

  ul {
    list-style: none;
  }

  a {
      text-decoration: none;
      color: inherit;
  }

  button {
    cursor: pointer;
  }
`;

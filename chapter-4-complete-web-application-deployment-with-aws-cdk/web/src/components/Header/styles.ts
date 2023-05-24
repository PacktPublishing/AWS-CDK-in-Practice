import styled from 'styled-components';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;

  height: 86px;
  width: 100vw;

  background: #0a0908;

  a {
    color: #ffffff;
    font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
      Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    letter-spacing: 3px;
    font-size: 20px;
    font-weight: 300;

    border: 1px solid #ffffff;

    padding: 4px 4px 4px 6px;

    margin-right: 8px;
  }

  .brand {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 240px;
  }
`;

export { HeaderContainer };

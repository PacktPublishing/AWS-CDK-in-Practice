import styled from 'styled-components';

const MainContainer = styled.header`
  display: flex;
  flex-direction: column;

  width: 100%;
  height: calc(100vh - 86px);

  padding: 48px;

  & > h1 {
    font-weight: 700;
    font-size: 38px;

    margin-bottom: 24px;
  }

  & > p {
    font-weight: 400;
    font-size: 24px;
    line-height: 28px;

    margin-bottom: 24px;

  }
`;

export { MainContainer };

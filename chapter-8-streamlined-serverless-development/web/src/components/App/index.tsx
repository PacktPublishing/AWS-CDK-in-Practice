import React from 'react';

import { Header } from '../Header';
import { Sidebar } from '../Sidebar';
import { Main } from '../Main';

import { AppContainer, MainSection } from './styles';

export const App: React.FC = () => {
  return (
    <AppContainer>
      <Header />

      <MainSection>
        <Sidebar />

        <Main />
      </MainSection>
    </AppContainer>
  );
};

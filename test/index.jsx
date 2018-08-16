import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';
// eslint-disable-next-line import/no-unresolved
import { AppContainer } from 'react-hot-loader';
import Test from './Test';

const render = (Component) => {
  ReactDOM.render(
    <StrictMode>
      <AppContainer>
        <Component />
      </AppContainer>
    </StrictMode>,
    document.getElementById('react-container'),
  );
};

render(Test);

if (module.hot) {
  module.hot.accept('./Test', () => { render(Test); });
}

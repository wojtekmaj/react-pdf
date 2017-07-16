import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import Test from './Test';

const render = (Component) => {
  ReactDOM.render(
    <AppContainer>
      <Component />
    </AppContainer>,
    document.getElementById('react-container'),
  );
};

render(Test);

if (module.hot) {
  module.hot.accept('./Test', () => { render(Test); });
}

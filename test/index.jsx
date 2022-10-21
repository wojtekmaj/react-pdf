import React, { StrictMode } from 'react';
import { render } from 'react-dom';
import Test from './Test';

render(
  <StrictMode>
    <Test />
  </StrictMode>,
  document.getElementById('react-root'),
);

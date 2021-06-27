import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Grommet, grommet } from 'grommet';

ReactDOM.render(
  <React.StrictMode>
    <Grommet 
    full 
    theme = {grommet} 
    >
      <App/>
    </Grommet>
  </React.StrictMode>,
  document.getElementById('root')
);


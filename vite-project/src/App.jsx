import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import history from './services/history';
import Routes from './routes/privateroutes';

function App() {

  return (
    <div>
          <Router history={history}>
              <Routes />
          </Router>        
    </div>
  )
}

export default App;
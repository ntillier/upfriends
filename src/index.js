import './style';

import { h } from 'preact';
import './firebase';
import { Router } from 'preact-router';

import Home from './routes/home';
import Login from './routes/login';
import Signup from './routes/signup';
import Onboarding from './routes/onboarding';
import Chats from './routes/chats';
import { ModalsProvider } from './context/modals';

function App() {
  return (
    <div id="app">
      <ModalsProvider>
        <Router>
          <Home path="/" />
          <Login path="/login" />
          <Signup path="/signup" />
          <Onboarding path="/onboarding" />
          <Chats path="/chats/:channel?" />
        </Router>
      </ModalsProvider>
    </div>
  );
}

export default App;


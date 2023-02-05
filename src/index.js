import './style';

import { h } from 'preact';
import './firebase';
import { Router } from 'preact-router';

import Home from './routes/home';
import Login from './routes/login';
import Signup from './routes/signup';
import Onboarding from './routes/onboarding';
import Chats from './routes/chats';
// import { Editor } from './components/ui'
// import { useRef } from 'preact/hooks';


function App() {

    return (
        <div id="app">
            <Router>
                <Home path="/" />
                <Login path="/login" />
                <Signup  path="/signup" />
                <Onboarding path="/onboarding" />
                <Chats path="/chats/:channel?" />
            </Router>
        </div>
    );
}

/*
function App() {
    var content = '**hello** :skull:\nother**';
  
    const input = useRef({});
  
    function addBobert() {
      input.current.insertAtCaret('Hello');
    }
  
    return (
      <div>
        <h1>Hello StackBlitz!</h1>
        <Editor content={content} onInit={(e) => (input.current = e)} />
        <button onClick={addBobert}>Add Bobert</button>
      </div>
    );
  }
  
*/
// <Profile path="/profile/:user" />
export default App;


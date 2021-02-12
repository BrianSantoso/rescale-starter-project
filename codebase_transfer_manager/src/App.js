import React from "react";
import logo from "./logo.png";
import "./App.css";
import Files from "./Files.js";

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>
                    <code>Codebase Transfer Manager</code>
                </p>
                <button onClick={() => {
                    window.api.send('notify', 'Hello there');
                }}>
                    Notify
                </button>
                <button onClick={() => {
                    window.api.send('upload', '');
                }}>
                    Upload File
                </button>
                <Files></Files>
            </header>
        </div>
    );
}

// class App extends Component {
//     render() {
//         return ()
//     }
// }

export default App;

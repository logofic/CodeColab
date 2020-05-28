import React, { useState, useEffect } from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import { FiShare2 } from "react-icons/fi";
import io from "socket.io-client";
import queryString from "query-string";

// The following two imports is for the theme.
import "codemirror/lib/codemirror.css";

// Themes
import "codemirror/theme/material.css";
import "codemirror/theme/monokai.css";
import "codemirror/theme/nord.css";
import "codemirror/theme/ambiance.css";
import "codemirror/theme/eclipse.css";

// Languages
// LAZY LOAD THESE IMPORTS
import "codemirror/mode/xml/xml";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/clike/clike";
import "codemirror/mode/css/css";
import "codemirror/mode/python/python";
import "codemirror/mode/php/php";
import "codemirror/mode/vue/vue";

// Overrides some codemirror classes, don't change order
import "./Codebox.scss";

let socket;

export default function Codebox({ location }) {
  const [options, setOptions] = useState({
    mode: { name: "xml" },
    theme: "material",
    lineNumbers: true,
  });

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [users, setUsers] = useState("");
  const [text, setText] = useState("<h1>Welcome to CodeRigade</h1>");
  const ENDPOINT = "localhost:5000";

  useEffect(() => {
    const { name, code } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setName(name);
    setCode(code);

    socket.emit("join", { name, code }, (error) => {
      if (error) {
        let newName = prompt("Please enter your name:")
      }
    });
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on("text", (text) => {
      setText(text);
    });

    socket.on("changeMode", (mode) => {
      setOptions({ mode: mode });
    });

    socket.on("changeTheme", (theme) => {
      setOptions({ theme: theme });
    });

    socket.on("roomData", ({ users }) => {
      setUsers(users);
      console.log(users);
    });
  }, []);

  const handleChange = () => {
    socket.emit("sendText", text);
  };

  const handleMode = (e) => {
    setOptions({ mode: e.target.value });
    socket.emit("sendModeValue", e.target.value);
  };

  const handleTheme = (e) => {
    setOptions({ theme: e.target.value });
    socket.emit("sendThemeValue", e.target.value);
  };

  return (
    <div className="codebox-container">
      <header>
        <h1>CodeRigade</h1>
      </header>
      <main>
        <div className="controls">
          <div className="control-dropdown">
            <select
              defaultValue="xml"
              value={options.mode}
              onChange={handleMode}
            >
              <option value="xml">XML/HTML</option>
              <option value="css">CSS</option>
              <option value="javascript">Javascript</option>
              <option value="clike">C/C++/C#</option>
              <option value="python">Python</option>
              <option value="php">PHP</option>
              <option value="vue">Vue</option>
            </select>
          </div>
          <div className="control-icon">
            <span>Share&nbsp;</span>
            <FiShare2 size={15} />
          </div>
          <div className="control-dropdown">
            <select
              defaultValue="material"
              value={options.theme}
              onChange={handleTheme}
            >
              <option value="material">Material</option>
              <option value="monokai">Monokai</option>
              <option value="nord">Nord</option>
              <option value="ambiance">Ambiance</option>
              <option value="eclipse">Eclipse</option>
            </select>
          </div>
        </div>
        <CodeMirror
          value={text}
          className="code-editor"
          options={options}
          autoCursor={false}
          onChange={(editor, data, value) => {
            setText(value);
            handleChange();
          }}
        />
      </main>
    </div>
  );
}

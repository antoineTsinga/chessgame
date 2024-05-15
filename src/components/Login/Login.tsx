import React, { useState } from "react";

const Login = () => {
  const [name, setName] = useState<string>("");
  const [joinCode, setJoinCode] = useState<string>("");
  const [hostCode, setHostCode] = useState<string>("");
  const createGame = () => {
    //call to back : create partie (socket)
  };

  const joinGame = () => {
    // call to back : join partie (socket)
  };

  return (
    <div className="login">
      <div className="field">
        <label htmlFor="name">Name :</label>
        <input
          className="textinput"
          type="text"
          name="name"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="field">
        <input
          className="btn"
          type="button"
          value="host game"
          onClick={createGame}
        />
        <input
          className="textinput"
          type="text"
          name="codecreate"
          placeholder="Code partie will be there"
          value={hostCode}
          onChange={(e) => setHostCode(e.target.value)}
          disabled
        />
        <div></div>
      </div>
      <div className="field">
        <input
          onClick={joinGame}
          className="btn"
          type="button"
          value="join a game"
        />
        <input
          className="textinput"
          name="codejoin"
          type="text"
          placeholder="Enter code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />
      </div>
    </div>
  );
};

export default Login;

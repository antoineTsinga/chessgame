import React, { useState } from "react";
import { backendUrl } from "../../core/config/backends";
import "./CreateGame.css";

const CreateGame = ({ setRoomName, setPlayerName, setIsHost }) => {
  const [name, setName] = useState("");
  const [hostName, setHostName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("create");

  const handleTabClick = (section) => {
    setActiveTab(section);
  };

  const handleCreateGame = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/create_game/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        const host = data.room_id.split("-")[0];
        setHostName(host);
        setPlayerName(name);
        setIsHost(true);
        setRoomName(host);
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    }
    setLoading(false);
  };

  const joinGame = () => {
    setPlayerName(name);
    setIsHost(false);
    setRoomName(hostName);
  };

  return (
    <div className="container-home">
      <div className="caption-home">
        <div className="title-home">
          <h1>AncaChess</h1>
          <img className="image-title" src="images/pions/Nw.png" alt="" />
        </div>

        <div className="description-home">
          <h2>Welcome to our online chess platform! </h2>
          <p>Here's how to get started 👇</p>
          <li>
            <span className="bold">Create a game : </span>
            If you'd like to start a new game, enter your name and simply click
            on the “Create a game” button. You will have a game code.
          </li>
          <li>
            <span className="bold"> Join a game : </span> If you have a game
            code, click on “Join a game”. Enter your name, the code provided and
            start playing immediately.
          </li>
        </div>
      </div>

      <div className="container-form-create-join">
        <div className="menu-create-join">
          <input
            type="button"
            value="Create a Game"
            className={`tab ${
              activeTab === "create" ? "tab-active" : "tab-inactive"
            }`}
            onClick={() => handleTabClick("create")}
          />
          <input
            type="button"
            value="Join a Game"
            className={`tab ${
              activeTab === "join" ? "tab-active" : "tab-inactive"
            }`}
            onClick={() => handleTabClick("join")}
          />
        </div>

        {activeTab === "create" && (
          <div className="create-join-content">
            <input
              className="textinput"
              type="text"
              name="name"
              value={name}
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="btn"
              type="button"
              value="Host game"
              onClick={handleCreateGame}
            />
          </div>
        )}
        {activeTab === "join" && (
          <div className="create-join-content">
            <input
              className="textinput"
              type="text"
              name="name"
              value={name}
              placeholder="Enter your name"
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="textinput"
              name="codejoin"
              type="text"
              placeholder="Enter game code"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
            />
            <input
              onClick={joinGame}
              className="btn"
              type="button"
              value="Join a game"
            />
          </div>
        )}
      </div>
      <div className="footer">
        <span>
          👋 Hi I'm Antoine software engineer{" "}
          <a href="https://github.com/antoineTsinga"> Follow me on GitHub</a>
        </span>
      </div>
    </div>
  );
};

export default CreateGame;

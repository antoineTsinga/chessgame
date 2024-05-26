import React, { useEffect, useState } from "react";
import { backendUrl, backendWebSocketUrl } from "../../core/config/backends";
import "./CreateGame.css";
import LoadingDot from "../../core/icons/LoadingDot";

const CreateGame = ({ setRoomName, setPlayerName, setIsHost, loading }) => {
  const [name, setName] = useState("");
  const [hostName, setHostName] = useState("");
  const [loadingBtn, setLoadingBtn] = useState(loading);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("create");
  const [webSocket, setWebSocket] = useState(null);

  useEffect(() => {
    setLoadingBtn(loading);
  }, [loading]);

  const handleTabClick = (section) => {
    setActiveTab(section);
  };

  const handleCreateGame = async () => {
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
        setLoadingBtn(false);
      }
    } catch (err) {
      setError("Une erreur est survenue");
      setLoadingBtn(false);
    }
  };

  const joinGame = () => {
    setLoadingBtn(true);
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

            <button
              className="btn"
              type="button"
              onClick={() => {
                setLoadingBtn(true);
                handleCreateGame();
              }}
            >
              {!loadingBtn ? "Host game" : <LoadingDot width={"40px"} />}
            </button>
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
            <button
              onClick={() => {
                setLoadingBtn(true);
                joinGame();
              }}
              className="btn"
              type="button"
            >
              {!loading ? "Join a game" : <LoadingDot width={"40px"} />}
            </button>
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

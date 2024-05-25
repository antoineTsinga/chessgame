import React, { useState } from "react";
import { backendUrl } from "../core/config/backends";

const CreateGame = ({ setRoomName, setPlayerName, setIsHost }) => {
  const [name, setName] = useState("");
  const [hostName, setHostName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    <div>
      {/* <button onClick={handleCreateGame} disabled={loading}>
        {loading ? "Création en cours..." : "Créer une nouvelle partie"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>} */}

      <div className="login">
        <div className="field">
          <label htmlFor="name">Name :</label>
          <input
            className="textinput"
            type="text"
            name="name"
            value={name}
            placeholder="Enter your name"
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <input
            className="btn"
            type="button"
            value="host game"
            onClick={handleCreateGame}
          />
          <input
            className="textinput"
            type="text"
            name="codecreate"
            placeholder="Code partie will be there"
            value={hostName}
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
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateGame;

import React from "react";
import "./Modal.css";
import { Close } from "../../core/icons/icons";

export default function Modal({ title, onclick, children }) {
  return (
    <div className="modal">
      <div className="modal-background">
        <div className="modal-content">
          <div className="modal-header">
            <div className="modal-title">{title}</div>
            <Close
              className="modal-close-btn"
              style={{ width: "2em" }}
              onClick={() => onclick(false)}
            />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

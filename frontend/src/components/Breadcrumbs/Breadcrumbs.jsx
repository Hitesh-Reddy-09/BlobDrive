import React from "react";

const Breadcrumbs = ({ path, onNavigate }) => {
  // path: array of { _id, name }
  return (
    <nav style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
      {path.map((folder, idx) => (
        <React.Fragment key={folder._id || 'root'}>
          <span
            style={{ cursor: idx === path.length - 1 ? "default" : "pointer", color: idx === path.length - 1 ? "#000" : "#007bff" }}
            onClick={() => idx !== path.length - 1 && onNavigate(folder._id, idx)}
          >
            {folder.name}
          </span>
          {idx < path.length - 1 && <span>&gt;</span>}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs; 
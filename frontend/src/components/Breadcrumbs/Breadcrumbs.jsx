import React from "react";

const Breadcrumbs = ({ path, onNavigate }) => {
  // path: array of { _id, name }
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        marginBottom: "1.5rem",
        fontSize: "14px",
        color: "#555",
      }}
    >
      {path.map((folder, idx) => (
        <React.Fragment key={folder._id || "root"}>
          <span
            onClick={() =>
              idx !== path.length - 1 && onNavigate(folder._id, idx)
            }
            style={{
              cursor: idx === path.length - 1 ? "default" : "pointer",
              color: idx === path.length - 1 ? "#222" : "#007bff",
              fontWeight: idx === path.length - 1 ? "600" : "500",
              userSelect: "none",
              padding: "0.25rem 0.5rem",
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (idx !== path.length - 1) {
                e.target.style.backgroundColor = "rgba(0, 123, 255, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            {folder.name}
          </span>
          {idx < path.length - 1 && (
            <span style={{ color: "#999", margin: "0 0.25rem" }}>/</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;

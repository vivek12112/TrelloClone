import React from "react";

interface Props {
  title: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const BoardHeader: React.FC<Props> = ({ title, searchTerm, onSearchChange }) => {
  return (
    <header className="board-header">
      <h1 className="board-title">{title}</h1>
      <div className="board-header-right">
        <input
          className="board-search"
          type="text"
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </header>
  );
};

export default BoardHeader;

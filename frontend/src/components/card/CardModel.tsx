import React, { useState } from "react";
import type { Card, List } from "../../types/board";
import { updateCard, deleteCard } from "../../api/cards";
import "/home/vivek/ScalerAssignment/trello-clone/frontend/src/components/card/CardModel.css";

interface Props {
  card: Card;
  list: List;
  onClose: () => void;
  onCardUpdated: (card: Card | null) => void; // null when deleted
}

const CardModal: React.FC<Props> = ({ card, list, onClose, onCardUpdated }) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const updated = await updateCard(card.id, { title, description });
    onCardUpdated(updated);
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this card?")) return;
    await deleteCard(card.id);
    onCardUpdated(null);
    onClose();
  };

  return (
    <div className="card-modal-backdrop" onClick={onClose}>
      <div className="card-modal" onClick={(e) => e.stopPropagation()}>
        <div className="card-modal-header">
          <input
            className="card-modal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <span className="card-modal-list-name">
            in list <strong>{list.title}</strong>
          </span>
        </div>

        <div className="card-modal-section">
          <h3>Description</h3>
          <textarea
            className="card-modal-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a more detailed description..."
          />
        </div>

        <div className="card-modal-actions">
          <button onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="card-modal-delete" onClick={handleDelete}>
            Delete
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default CardModal;

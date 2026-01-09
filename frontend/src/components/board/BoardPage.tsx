import React, { useEffect, useMemo, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,

} from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd"; 
import { fetchBoard } from "../../api/board.ts";
import { moveCard, createCard } from "../../api/cards";
import { moveList, createList } from "../../api/lists";
import type { Board, List, Card } from "../../types/board";
import { computeNewPosition } from "../../utils/positions";
import BoardHeader from "./BoardHeader";
import CardModal from "../card/CardModel.tsx";
import "./BoardPage.css";

interface Props {
  boardId: number;
}

const BoardPage: React.FC<Props> = ({ boardId }) => {
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCard, setActiveCard] = useState<{ card: Card; list: List } | null>(
    null
  );

  useEffect(() => {
    setLoading(true);
    fetchBoard(boardId)
      .then((data) => setBoard(data))
      .finally(() => setLoading(false));
  }, [boardId]);

  const handleCardClick = (card: Card, list: List) => {
    setActiveCard({ card, list });
  };

  const handleCardUpdated = (updated: Card | null) => {
    if (!board || !activeCard) return;
    if (updated === null) {
      // deleted card
      setBoard({
        ...board,
        lists: board.lists.map((l) =>
          l.id === activeCard.list.id
            ? {
                ...l,
                cards: l.cards.filter((c) => c.id !== activeCard.card.id),
              }
            : l
        ),
      });
      return;
    }
    setBoard({
      ...board,
      lists: board.lists.map((l) =>
        l.id === updated.list
          ? {
              ...l,
              cards: l.cards.map((c) => (c.id === updated.id ? updated : c)),
            }
          : l
      ),
    });
    setActiveCard({ card: updated, list: activeCard.list });
  };

  const handleAddList = async () => {
    if (!board) return;
    const title = window.prompt("List title");
    if (!title) return;

    const positions = board.lists.map((l) => l.position);
    const maxPos = positions.length ? Math.max(...positions) : 0;
    const newPos = maxPos + 1;

    const created = await createList({
      board: board.id,
      title,
      position: newPos,
    });

    setBoard({
      ...board,
      lists: [...board.lists, { ...created, cards: [] }],
    });
  };

  const handleAddCard = async (list: List) => {
    const title = window.prompt("Card title");
    if (!title) return;
    const positions = list.cards.map((c) => c.position);
    const maxPos = positions.length ? Math.max(...positions) : 0;
    const newPos = maxPos + 1;

    const created = await createCard({
      list: list.id,
      title,
      position: newPos,
    });

    if (!board) return;
    setBoard({
      ...board,
      lists: board.lists.map((l) =>
        l.id === list.id ? { ...l, cards: [...l.cards, created] } : l
      ),
    });
  };

  const onDragEnd = async (result: DropResult) => {
    if (!board) return;
    const { destination, source, type, draggableId } = result;
    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "COLUMN") {
      const listsCopy = [...board.lists].sort((a, b) => a.position - b.position);
      const [moved] = listsCopy.splice(source.index, 1);
      listsCopy.splice(destination.index, 0, moved);

      const before = listsCopy[destination.index - 1]?.position;
      const after = listsCopy[destination.index + 1]?.position;
      const newPos = computeNewPosition(before, after);

      const updatedBoard: Board = {
        ...board,
        lists: board.lists.map((l) =>
          l.id === moved.id ? { ...l, position: newPos } : l
        ),
      };
      setBoard(updatedBoard);

      await moveList(moved.id, { position: newPos });
      return;
    }

    if (type === "CARD") {
      const cardId = parseInt(draggableId.split("-")[1], 10);
      const sourceListId = parseInt(source.droppableId.split("-")[1], 10);
      const destListId = parseInt(destination.droppableId.split("-")[1], 10);

      const sourceList = board.lists.find((l) => l.id === sourceListId)!;
      const destList = board.lists.find((l) => l.id === destListId)!;

      const sourceCards = [...sourceList.cards].sort(
        (a, b) => a.position - b.position
      );
      const destCards =
        sourceListId === destListId
          ? sourceCards
          : [...destList.cards].sort((a, b) => a.position - b.position);

      const [movedCard] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, movedCard);

      const before = destCards[destination.index - 1]?.position;
      const after = destCards[destination.index + 1]?.position;
      const newPos = computeNewPosition(before, after);

      const updatedBoard: Board = {
        ...board,
        lists: board.lists.map((l) => {
          if (l.id === sourceListId) {
            return {
              ...l,
              cards:
                sourceListId === destListId
                  ? destCards.map((c) =>
                      c.id === movedCard.id ? { ...c, position: newPos } : c
                    )
                  : sourceCards,
            };
          }
          if (l.id === destListId) {
            return {
              ...l,
              cards: destCards.map((c) =>
                c.id === movedCard.id
                  ? { ...c, list: destListId, position: newPos }
                  : c
              ),
            };
          }
          return l;
        }),
      };

      setBoard(updatedBoard);

      await moveCard(cardId, {
        list: destListId !== sourceListId ? destListId : undefined,
        position: newPos,
      });
    }
  };

  const orderedLists = useMemo(
    () => (board ? [...board.lists].sort((a, b) => a.position - b.position) : []),
    [board]
  );

  const filteredLists = useMemo(() => {
    if (!board) return [];
    if (!searchTerm.trim()) return orderedLists;

    const term = searchTerm.toLowerCase();
    return orderedLists.map((list) => ({
      ...list,
      cards: list.cards.filter((c) =>
        c.title.toLowerCase().includes(term)
      ),
    }));
  }, [board, orderedLists, searchTerm]);

  if (loading || !board) {
    return <div className="board-loading">Loading board…</div>;
  }

  return (
    <div
      className="board-root"
      style={{ backgroundColor: board.background }}
    >
      <BoardHeader
        title={board.title}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable
          droppableId="board-columns"
          direction="horizontal"
          type="COLUMN"
        >
          {(provided) => (
            <div
              className="board-columns"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {filteredLists.map((list, index) => (
                <Draggable
                  draggableId={`list-${list.id}`}
                  index={index}
                  key={list.id}
                >
                  {(listProvided) => (
                    <div
                      className="list-column-wrapper"
                      ref={listProvided.innerRef}
                      {...listProvided.draggableProps}
                    >
                      <div
                        className="list-column"
                        {...listProvided.dragHandleProps}
                      >
                        <div className="list-header">
                          <h2>{list.title}</h2>
                        </div>

                        <Droppable
                          droppableId={`list-${list.id}`}
                          type="CARD"
                        >
                          {(cardsProvided, snapshot) => (
                            <div
                              className={
                                "list-cards " +
                                (snapshot.isDraggingOver
                                  ? "list-cards--drag-over"
                                  : "")
                              }
                              ref={cardsProvided.innerRef}
                              {...cardsProvided.droppableProps}
                            >
                              {list.cards
                                .slice()
                                .sort(
                                  (a, b) => a.position - b.position
                                )
                                .map((card, idx) => (
                                  <Draggable
                                    draggableId={`card-${card.id}`}
                                    index={idx}
                                    key={card.id}
                                  >
                                    {(cardProvided, cardSnapshot) => (
                                      <div
                                        className={
                                          "card-item " +
                                          (cardSnapshot.isDragging
                                            ? "card-item--dragging"
                                            : "")
                                        }
                                        ref={cardProvided.innerRef}
                                        {...cardProvided.draggableProps}
                                        {...cardProvided.dragHandleProps}
                                        onClick={() =>
                                          handleCardClick(card, list)
                                        }
                                      >
                                        <div className="card-title">
                                          {card.title}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              {cardsProvided.placeholder}
                              <button
                                className="add-card-button"
                                onClick={() => handleAddCard(list)}
                              >
                                + Add a card
                              </button>
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              <div className="list-column list-column--add">
                <button
                  className="add-list-button"
                  onClick={handleAddList}
                >
                  + Add another list
                </button>
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {activeCard && (
        <CardModal
          card={activeCard.card}
          list={activeCard.list}
          onClose={() => setActiveCard(null)}
          onCardUpdated={handleCardUpdated}
        />
      )}
    </div>
  );
};

export default BoardPage;

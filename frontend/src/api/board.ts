import { api } from "./client";
import type { Board } from "../types/board";

// Fetch a single board with nested lists + cards
export async function fetchBoard(id: number): Promise<Board> {
  const res = await api.get<Board>(`/boards/${id}/`);
  return res.data;
}

// Fetch all boards (for future multiple boards view)
export async function fetchBoards(): Promise<Board[]> {
  const res = await api.get<Board[]>("/boards/");
  return res.data;
}

// Create new board
export async function createBoard(title: string): Promise<Board> {
  const res = await api.post<Board>("/boards/", { title });
  return res.data;
}

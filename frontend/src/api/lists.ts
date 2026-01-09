import { api } from "./client";
import type { List } from "../types/board";

export async function moveList(
  listId: number,
  payload: { position: number }
): Promise<List> {
  const res = await api.post<List>(`/lists/${listId}/move/`, payload);
  return res.data;
}

export async function createList(payload: {
  board: number;
  title: string;
  position: number;
}): Promise<List> {
  const res = await api.post<List>("/lists/", payload);
  return res.data;
}

export async function deleteList(listId: number): Promise<void> {
  await api.delete(`/lists/${listId}/`);
}

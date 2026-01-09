import { api } from "./client";
import type { Card } from "../types/board";

export async function moveCard(
  cardId: number,
  payload: { list?: number; position: number }
): Promise<Card> {
  const res = await api.post<Card>(`/cards/${cardId}/move/`, payload);
  return res.data;
}

export async function createCard(payload: {
  list: number;
  title: string;
  position: number;
}): Promise<Card> {
  const res = await api.post<Card>("/cards/", payload);
  return res.data;
}

export async function updateCard(
  cardId: number,
  payload: Partial<Pick<Card, "title" | "description" | "due_date" | "archived">>
): Promise<Card> {
  const res = await api.patch<Card>(`/cards/${cardId}/`, payload);
  return res.data;
}

export async function deleteCard(cardId: number): Promise<void> {
  await api.delete(`/cards/${cardId}/`);
}

export async function searchCards(q: string): Promise<Card[]> {
  const res = await api.get<Card[]>("/search/cards/", { params: { q } });
  return res.data;
}

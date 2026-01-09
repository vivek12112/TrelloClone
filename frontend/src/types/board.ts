export interface Card {
  id: number;
  list: number;
  title: string;
  description: string;
  position: number;
  due_date: string | null;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface List {
  id: number;
  board: number;
  title: string;
  position: number;
  cards: Card[];
  created_at: string;
  updated_at: string;
}

export interface Board {
  id: number;
  title: string;
  background: string;
  lists: List[];
  created_at: string;
  updated_at: string;
}

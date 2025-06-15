export interface Todo {
  id?: string;
  title: string;
  description?: string;
  completed: boolean;
  date: string; // ISO 형식의 날짜 문자열
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TodoCount {
  date: string;
  totalCount: number;
  completedCount: number;
  incompleteCount: number;
}

export interface TodosByDate {
  [date: string]: Todo[];
} 
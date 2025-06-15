import axios from './axios';
import { Todo, TodoCount } from '@todo-app/libs';

export const getTodoStats = () => {
  return axios.get<TodoCount[]>('/todos');
};

export const getTodosByDate = (date: string) => {
  return axios.get<Todo[]>(`/todos/date/${date}`);
};

export const createTodo = (todo: Omit<Todo, 'id'>) => {
  return axios.post<Todo>('/todos', todo);
};

export const updateTodo = (id: string, todo: Partial<Todo>) => {
  return axios.patch<Todo>(`/todos/${id}`, todo);
};

export const deleteTodo = (id: string) => {
  return axios.delete(`/todos/${id}`);
}; 
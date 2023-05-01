export interface Todo {
  id: string;
  todo_name: string;
  todo_description: string;
  todo_completed: number;
}

export interface PostEvent {
  body: string;
}

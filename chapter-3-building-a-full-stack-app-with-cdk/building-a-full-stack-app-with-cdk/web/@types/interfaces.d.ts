export namespace Interfaces {
  export interface Todo {
    partition_key?: string;
    sort_key?: string;
    name: string;
    description: string;
    completed: boolean;
  }
}
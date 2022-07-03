import React, { useState } from 'react';
import { Interfaces } from '../../../@types/interfaces';

import { CreateTodoContainer, InputContainer } from './styles';

interface Props {
  handleTodoSubmit: ({
    new_todo,
  }: {
    new_todo: Interfaces.Todo;
  }) => Promise<void>;
}

export const CreateTodo: React.FC<Props> = ({ handleTodoSubmit }) => {
  const [new_todo, setNewTodo] = useState<Interfaces.Todo>({
    name: '',
    description: '',
    completed: false,
  });

  const handleTodoChange = (type: string, value: string) => {
    setNewTodo(current_todo => ({ ...current_todo, [type]: value }));
  };

  return (
    <CreateTodoContainer>

      <InputContainer>
      <input
        onChange={({ target }) => handleTodoChange('name', target.value)}
        type="text"
        name="new_todo"
        id="new_todo"
        placeholder="name"
      />

      <input
        onChange={({ target }) => handleTodoChange('description', target.value)}
        type="text"
        name="new_todo"
        id="new_todo"
        placeholder="description"
      />
      </InputContainer>

      <button type="button" onClick={() => handleTodoSubmit({ new_todo })}>
        Add
      </button>
    </CreateTodoContainer>
  );
};

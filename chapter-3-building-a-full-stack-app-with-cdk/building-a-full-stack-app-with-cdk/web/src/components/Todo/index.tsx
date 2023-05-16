import React from 'react';

import {TodoActions, TodoBox, TodoContainer, TodoContent} from './styles'

export const Todo: React.FC = () => {
  return (

  
  <TodoContainer>

    <input type="checkbox" name="" id="" />

    <TodoBox>
      <TodoContent>
        <h1>Todo</h1>
        <p>Description</p>
      </TodoContent>

        <TodoActions>
        <button type="button">Edit</button>
        <button type="button">Delete</button>
      </TodoActions>
    </TodoBox>

    
  </TodoContainer>
  )
};
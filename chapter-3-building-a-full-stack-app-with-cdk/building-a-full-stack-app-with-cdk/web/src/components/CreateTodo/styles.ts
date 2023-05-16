import styled from "styled-components";

export const CreateTodoContainer = styled.div`
  margin-bottom: 24px;

  button {
    margin-top: 8px;
    border: none;
    border-radius: 4px;

    background: #000;
    color: #fff;

    padding: 4px 16px;
  }
`;

export const InputContainer = styled.div`
  display: flex;
  flex-direction: column;

  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.2);

  input[type="text"] {
    border: none;
    border-radius: 8px;

    &:first-child {
      padding: 8px;
      border-bottom: 1px solid rgba(0,0,0,0.2);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    &:last-child {
      padding: 8px;
      height: 48px;
    }
  }
`;
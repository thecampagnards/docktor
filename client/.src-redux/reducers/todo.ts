import {
  FetchTodo,
  FetchTodoFailure,
  FetchTodoSuccess,
  TodoAction
} from "../actions/todo";
import { ITodoState } from "../types/store";
export default (
  state: ITodoState = {
    isFetching: false,
    todo: null
  },
  action: TodoAction
) => {
  switch (action.type) {
    case FetchTodo:
      return {
        ...state,
        isFetching: true
      };
    case FetchTodoSuccess:
      return {
        ...state,
        isFetching: false,
        todo: action.todo
      };
    case FetchTodoFailure:
      return {
        ...state,
        isFetching: false
      };
    default:
      return state;
  }
};

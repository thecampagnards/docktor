import { Dispatch } from 'redux';
import { ITodo } from '../types/model';
import { IStoreState } from '../types/store';
import { checkStatus } from '../utils/promises';
type FetchTodo = 'FETCH_TODO_REQUEST';
export const FetchTodo: FetchTodo = 'FETCH_TODO_REQUEST';
export interface IFetchTodo {
  type: FetchTodo;
}
type FetchTodoSuccess = 'FETCH_TODO_SUCCESS';
export const FetchTodoSuccess: FetchTodoSuccess =
  'FETCH_TODO_SUCCESS';
export interface IFetchTodoSuccess {
  type: FetchTodoSuccess;
  todo: ITodo;
}
type FetchTodoFailure = 'FETCH_TODO_FAILURE';
export const FetchTodoFailure: FetchTodoFailure =
  'FETCH_TODO_FAILURE';
export interface IFetchTodoFailure {
  type: FetchTodoFailure;
  message: string;
}
export type TodoAction =
  | IFetchTodo
  | IFetchTodoSuccess
  | IFetchTodoFailure;

export const fetchTodoThunk = () => {
  return (dispatch: Dispatch<IStoreState>) => {
    dispatch({
      type: FetchTodo,
    });
    return fetch(
      `${process.env.PUBLIC_URL}/api/`,
      {
        credentials: 'same-origin',
        method: 'GET',
      },
    )
      .then(checkStatus)
      .then((response: Response) => response.json())
      .then((response: ITodo) => {
        dispatch({
          todo: response,
          type: FetchTodoSuccess,
        });
      })
      .catch((error: Error) => {
        dispatch({
          message: error.message,
          type: FetchTodoFailure,
        });
      });
  };
};

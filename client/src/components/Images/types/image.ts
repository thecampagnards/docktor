export interface IImage {
  _id: string;
  title: string;
  image: {
    Pattern: string;
    Options: string;
  };
  commands: ICommand[];
  is_allow_shell: boolean;
}

export interface ICommand {
  _id: string;
  title: string;
  command: string;
  variables?: string[];
}

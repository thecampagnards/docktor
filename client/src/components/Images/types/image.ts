export interface IImage {
  _id: string;
  image: {
    Pattern: string;
    Options: string;
  };
  commands: ICommand[];
  is_allow_shell: boolean;
}

export interface ICommand {
  title: string;
  command: string;
  variables?: string[];
}

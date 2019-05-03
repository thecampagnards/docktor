export interface IImage {
  _id: string;
  image: {
    Pattern: string;
    Options: string;
  };
  commands: ICommand[];
}

export interface ICommand {
  _id: string;
  title: string;
  command: string;
  variables?: string[];
}

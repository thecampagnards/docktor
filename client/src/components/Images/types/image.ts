export interface IImage {
  _id: string;
  image: {
    Pattern: string;
    Options: string;
  };
  commands: ICommand[];
}

export interface ICommand {
  title: string;
  command: string;
  variables?: string[];
}

export interface IImage {
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

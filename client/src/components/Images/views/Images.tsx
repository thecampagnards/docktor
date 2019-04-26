import * as _ from "lodash";
import * as React from "react";
import { IInstance, UnControlled as CodeMirror } from "react-codemirror2";
import {
  Button,
  Form,
  Grid,
  Icon,
  InputOnChangeData,
  List,
  Loader,
  Message,
  TextAreaProps
} from "semantic-ui-react";

import { fetchImages, saveImages } from "../actions/image";
import { IImage } from "../types/image";

interface IImagesStates {
  images: IImage[];
  isFetching: boolean;
  isSuccess: boolean;
  error: Error;

  imageKey: number;
}

class Images extends React.Component<{}, IImagesStates> {
  public state = {
    images: [] as IImage[],
    isFetching: true,
    isSuccess: false,
    error: Error(),

    imageKey: 0
  };

  public componentWillMount() {
    fetchImages()
      .then(images => this.setState({ images }))
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  public render() {
    const { error, isSuccess, isFetching, images, imageKey } = this.state;

    if (isFetching) {
      return (
        <>
          <h2>Images</h2>
          <Loader active={true} />
        </>
      );
    }

    return (
      <>
        <h1>Images</h1>

        <Form
          success={isSuccess}
          error={!!error.message}
          onSubmit={this.submit}
        >
          <Grid columns={2} divided={true}>
            <Grid.Row>
              <Grid.Column width={4}>
                <Button icon={true} onClick={this.addImage} color="green">
                  <Icon name="plus" />
                  Add image
                </Button>
                <Button icon={true} onClick={this.removeImage} color="red">
                  <Icon name="minus" />
                  Remove
                </Button>
                <List>
                  {images &&
                    images.map((c, key) => (
                      <List.Item
                        key={key}
                        as={Button}
                        onClick={this.changeImage(key)}
                        active={key === imageKey}
                        basic={true}
                        style={{ padding: 5, width: "100%" }}
                      >
                        <List.Icon name="terminal" />
                        <List.Content>
                          <List.Header>
                            <Form.Input
                              fluid={true}
                              value={c.image.Pattern}
                              onChange={this.handleInput}
                              name={`images.${key}.image.Pattern`}
                            />
                          </List.Header>
                        </List.Content>
                      </List.Item>
                    ))}
                </List>
              </Grid.Column>

              <Grid.Column width={12}>
                {images && images.length > imageKey ? (
                  <>
                    <Button
                      icon={true}
                      onClick={this.addSubImage}
                      color="green"
                    >
                      <Icon name="plus" />
                      Add image for {images[imageKey].image.Pattern}
                    </Button>
                    {images[imageKey].commands.map((command, key) => (
                      <span key={key}>
                        <Form.Input
                          fluid={true}
                          value={command.title}
                          onChange={this.handleInput}
                          name={`images.${imageKey}.commands.${key}.title`}
                        />
                        <CodeMirror
                          value={command.command}
                          options={{
                            mode: "shell",
                            theme: "material",
                            lineNumbers: true,
                            gutters: [
                              `images.${imageKey}.commands.${key}.command`
                            ]
                          }}
                          autoCursor={false}
                          onChange={this.handleChangeCodeEditor}
                        />
                      </span>
                    ))}
                  </>
                ) : (
                  "No images found"
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <br />
          <Message error={true} header="Error" content={error.message} />
          <Button type="submit" loading={isFetching}>
            Save
          </Button>
        </Form>
      </>
    );
  }

  private handleInput = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.FormEvent<HTMLTextAreaElement>,
    { value, name }: TextAreaProps | InputOnChangeData
  ) => {
    event.preventDefault();
    this.setState(_.set(this.state, name, value));
  };

  private handleChangeCodeEditor = (
    editor: IInstance,
    data: CodeMirror.EditorChange,
    value: string
  ) => {
    this.setState(_.set(this.state, editor.options.gutters![0], value));
  };

  private addImage = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    let images = this.state.images;
    const image = {
      image: {
        Pattern: RegExp("").toString()
      },
      commands: [
        {
          title: "Command",
          command: ""
        }
      ]
    } as IImage;
    images ? images.unshift(image) : (images = [image]);
    this.setState({ images });
  };

  private removeImage = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    const { images, imageKey } = this.state;
    images.splice(imageKey, imageKey);
    this.setState({ images });
  };

  private addSubImage = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    const { images, imageKey } = this.state;
    images[imageKey].commands.push({
      title: "Command",
      command: ""
    });
    this.setState({ images });
  };

  private changeImage = (imageKey: number) => (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    this.setState({ imageKey });
  };

  private submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { images } = this.state;

    this.setState({ isFetching: true });
    saveImages(images)
      .then(() => this.setState({ isSuccess: true, error: Error() }))
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };
}

export default Images;

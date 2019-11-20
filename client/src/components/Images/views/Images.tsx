import * as _ from 'lodash';
import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import {
    Accordion, Button, Checkbox, CheckboxProps, Divider, Form, Grid, Icon, InputOnChangeData, List,
    Loader, Message, TextAreaProps
} from 'semantic-ui-react';

import { fetchImages, saveImages } from '../actions/image';
import { IImage } from '../types/image';

interface IImagesStates {
  images: IImage[];
  isFetching: boolean;
  isSuccess: boolean;
  error: Error;

  imageKey: number;
  openCommands: boolean;
}

class Images extends React.Component<{}, IImagesStates> {
  public state = {
    images: [] as IImage[],
    isFetching: true,
    isSuccess: false,
    error: Error(),

    imageKey: 0,
    openCommands: false
  };

  public componentDidMount() {
    fetchImages()
      .then(images => this.setState({ images }))
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  public render() {
    const {
      error,
      isSuccess,
      isFetching,
      images,
      imageKey,
      openCommands
    } = this.state;

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
          <Grid columns={2} divided={false}>
            <Grid.Row>
              <Grid.Column width={3}>
                <List selection={true}>
                  {images &&
                    images.map((img, key) => (
                      <List.Item
                        key={key}
                        as={Button}
                        onClick={this.changeImage(key)}
                        active={key === imageKey}
                        basic={true}
                        fluid={true}
                        style={{ margin: 3 }}
                      >
                        <List.Content floated="left">
                          {img.title || "Unnamed image"}
                        </List.Content>
                        <List.Content floated="right">
                          <Icon name="chevron right" floated="right" />
                        </List.Content>
                      </List.Item>
                    ))}
                </List>
                <Button
                  icon={true}
                  labelPosition="left"
                  onClick={this.addImage}
                  basic={true}
                  color="blue"
                >
                  <Icon name="plus" />
                  Add image
                </Button>
              </Grid.Column>

              <Grid.Column width={1} />

              <Grid.Column width={12}>
                {images && images.length > imageKey ? (
                  <>
                    <Form.Input
                      label="Title"
                      value={images[imageKey].title}
                      onChange={this.handleInput}
                      name={`images.${imageKey}.title`}
                    />

                    <Form.Input
                      label="Image pattern"
                      value={images[imageKey].image.Pattern}
                      onChange={this.handleInput}
                      name={`images.${imageKey}.image.Pattern`}
                    />

                    <Checkbox
                      label="Enable shell for this image"
                      checked={images[imageKey].is_allow_shell}
                      name={`images.${imageKey}.is_allow_shell`}
                      onChange={this.handleInput}
                      disabled={images[imageKey].image.Pattern === ".*"}
                    />

                    <br />
                    <br />

                    <Accordion styled={true} fluid={true}>
                      <Accordion.Title
                        active={openCommands}
                        onClick={this.handleToggleCommands}
                      >
                        <Icon name="dropdown" />
                        Commands
                      </Accordion.Title>
                      <Accordion.Content active={openCommands}>
                        <Grid>
                          {images[imageKey].commands.map((command, key) => (
                            <React.Fragment key={key}>
                              <Grid.Row>
                                <Grid.Column width={12}>
                                  <Form.Input
                                    fluid={true}
                                    value={command.title}
                                    onChange={this.handleInput}
                                    name={`images.${imageKey}.commands.${key}.title`}
                                  />
                                </Grid.Column>
                                <Grid.Column width={4}>
                                  <Button
                                    basic={true}
                                    color="red"
                                    icon="minus"
                                    labelPosition="left"
                                    content="Delete this command"
                                    fluid={true}
                                    onClick={this.removeCommand(key)}
                                  />
                                </Grid.Column>
                              </Grid.Row>
                              <Grid.Row>
                                <Grid.Column width={16}>
                                  <CodeMirror
                                    className="code-small"
                                    value={command.command}
                                    options={{
                                      mode: "shell",
                                      lint: true,
                                      theme: "material",
                                      lineNumbers: true,
                                      gutters: [
                                        `images.${imageKey}.commands.${key}.command`
                                      ]
                                    }}
                                    autoCursor={false}
                                    onChange={this.handleChangeCodeEditor}
                                  />
                                </Grid.Column>
                              </Grid.Row>
                              <Divider />
                            </React.Fragment>
                          ))}
                          <Grid.Row>
                            <Grid.Column>
                              <Button
                                basic={true}
                                icon="plus"
                                labelPosition="left"
                                content="Add command"
                                onClick={this.addCommand}
                                color="green"
                              />
                            </Grid.Column>
                          </Grid.Row>
                        </Grid>
                      </Accordion.Content>
                    </Accordion>
                    <br />
                    <Button
                      icon="save"
                      labelPosition="left"
                      content="SAVE"
                      color="teal"
                      type="submit"
                      loading={isFetching}
                    />
                    <Button
                      icon="trash"
                      labelPosition="right"
                      content="Delete"
                      color="red"
                      onClick={this.removeImage}
                    />
                  </>
                ) : (
                  "No images found"
                )}
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <br />
          <Message error={true} header="Error" content={error.message} />
        </Form>
      </>
    );
  }

  private handleToggleCommands = () => {
    const toggle = this.state.openCommands;
    this.setState({ openCommands: !toggle });
  };

  private handleInput = (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.FormEvent<HTMLInputElement>
      | React.FormEvent<HTMLTextAreaElement>,
    { value, name, checked }: TextAreaProps | InputOnChangeData | CheckboxProps
  ) => {
    event.preventDefault();
    this.setState(_.set(this.state, name, checked || value));
  };

  private handleChangeCodeEditor = (
    editor: CodeMirror.Editor,
    data: CodeMirror.EditorChange,
    value: string
  ) => {
    this.setState(_.set(this.state, editor.getOption("gutters")![0], value));
  };

  private addImage = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    let images = this.state.images;
    const image = {
      is_allow_shell: true,
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

  private addCommand = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    const { images, imageKey } = this.state;
    images[imageKey].commands.push({
      _id: "",
      title: "",
      command: ""
    });
    this.setState({ images });
  };

  private removeCommand = (commandKey: number) => (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    const { images, imageKey } = this.state;
    images[imageKey].commands = images[imageKey].commands.splice(commandKey, 1);
    this.setState({ images });
  };

  private changeImage = (imageKey: number) => (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    this.setState({ imageKey, openCommands: false });
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

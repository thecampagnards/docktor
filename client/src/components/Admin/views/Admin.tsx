import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { Button, Form, Grid, List, Loader, Message } from 'semantic-ui-react';

import { fetchAssets, saveAsset } from '../actions/admin';

interface IAdminStates {
  assets: Map<string, string>;
  isFetching: boolean;
  isSuccess: boolean;
  error: Error;

  filename: string;
}

class Admin extends React.Component<{}, IAdminStates> {
  public state = {
    assets: new Map<string, string>(),
    isFetching: true,
    isSuccess: false,
    error: Error(),

    filename: ""
  };

  public componentDidMount() {
    fetchAssets()
      .then(assets => {
        assets = new Map(Object.entries(assets));
        this.setState({
          assets,
          filename: assets.keys().next().value,
          isFetching: false
        });
      })
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  }

  public render() {
    const { error, isSuccess, isFetching, assets, filename } = this.state;

    if (error.message) {
      return (
        <>
          <h2>Admin</h2>
          <Message negative={true}>
            <Message.Header>There was an issue</Message.Header>
            <p>{error.message}</p>
          </Message>
        </>
      );
    }

    if (isFetching) {
      return (
        <>
          <h2>Admin</h2>
          <Loader active={true} />
        </>
      );
    }

    return (
      <>
        <h1>Admin</h1>
        <Form
          success={isSuccess}
          error={!!error.message}
          onSubmit={this.submit}
        >
          <Grid columns={2} divided={true}>
            <Grid.Row>
              <Grid.Column width={4}>
                <List>
                  {Array.from(assets.keys()).map(f => (
                    <List.Item
                      key={f}
                      as={Button}
                      onClick={this.changeFile(f)}
                      active={
                        filename
                          ? f === filename
                          : f === assets.keys().next().value
                      }
                      basic={true}
                      style={{ padding: 5, width: "100%" }}
                    >
                      <List.Icon name="file" />
                      <List.Content>
                        <List.Header>{f}</List.Header>
                      </List.Content>
                    </List.Item>
                  ))}
                </List>
              </Grid.Column>
              <Grid.Column width={12}>
                <CodeMirror
                  value={assets.get(filename) || assets.values().next().value}
                  options={{
                    theme: "material",
                    lineNumbers: true,
                    gutters: [filename]
                  }}
                  autoCursor={false}
                  onChange={this.handleChangeCodeEditor}
                />
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Message error={true} header="Error" content={error.message} />
          <Button type="submit" loading={isFetching}>
            Save
          </Button>
        </Form>
      </>
    );
  }

  private changeFile = (filename: string) => (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) => {
    e.preventDefault();
    this.setState({ filename });
  };

  private handleChangeCodeEditor = (
    editor: CodeMirror.Editor,
    data: CodeMirror.EditorChange,
    value: string
  ) => {
    const { assets } = this.state;
    assets.set(editor.getOption("gutters")![0], value);
    this.setState({ assets });
  };

  private submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { assets, filename } = this.state;

    this.setState({ isFetching: true });
    saveAsset(filename, assets.get(filename))
      .then(() =>
        this.setState({ isSuccess: true, isFetching: false, error: Error() })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  };
}

export default Admin;

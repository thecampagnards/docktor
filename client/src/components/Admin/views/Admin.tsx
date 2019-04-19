import * as _ from 'lodash';
import * as React from 'react';
import { IInstance, UnControlled as CodeMirror } from 'react-codemirror2';
import { Button, Form, Grid, List, Loader, Message } from 'semantic-ui-react';

import { fetchAssets, saveAsset } from '../actions/admin';

interface IAdminStates {
  assets: string[] | null;
  isFetching: boolean;
  isSuccess: boolean;
  error: Error;

  filename: string;
}

class Admin extends React.Component<{}, IAdminStates> {
  public state = {
    assets: [],
    isFetching: false,
    isSuccess: false,
    error: Error(),

    filename: ""
  };

  public componentWillMount() {
    this.setState({ isFetching: true });
    fetchAssets()
      .then(assets => this.setState({ assets, isFetching: false }))
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
                  {Object.keys(assets).map(f => (
                    <List.Item
                      key={f}
                      as={Button}
                      onClick={this.changeFile(f)}
                      active={f === filename}
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
                  value={filename ? assets[filename] : assets[0]}
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
    editor: IInstance,
    data: CodeMirror.EditorChange,
    value: string
  ) => {
    this.setState({
      assets: _.set(this.state.assets, editor.options.gutters![0], value)
    });
  };

  private submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const { assets, filename } = this.state;

    this.setState({ isFetching: true });
    saveAsset(filename, assets[filename])
      .then(() =>
        this.setState({ isSuccess: true, isFetching: false, error: Error() })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  };
}

export default Admin;

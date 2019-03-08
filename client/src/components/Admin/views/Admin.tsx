import * as React from "react";

import Layout from "../../layout/layout";
import { fetchAssets, saveAsset } from '../actions/admin';
import { Loader, List, Grid, Button, Form, Message } from 'semantic-ui-react';
import { UnControlled as CodeMirror, IInstance } from "react-codemirror2";
import * as _ from 'lodash';

interface IAdminStates {
  assets: string[] | null;
  isFetching: boolean;
  isSuccess: boolean;
  error: Error | null;

  filename: string;
}

class Admin extends React.Component<{}, IAdminStates> {

  public state = {
    assets: [],
    isFetching: false,
    isSuccess: false,
    error: null,

    filename: ""
  };

  public componentWillMount() {
    this.setState({ isFetching: true })
    fetchAssets()
      .then((assets) => this.setState({ assets, isFetching: false }))
      .catch((error: Error) => this.setState({ error, isFetching: false }))
  }

  public render() {
    const { error, isSuccess, isFetching, assets, filename } = this.state

    if (!assets) {
      return (
        <Layout>
          <h2>Admin</h2>
          <p>No data yet ...</p>;
        </Layout>
      );
    }

    if (error) {
      return (
        <Layout>
          <h2>Admin</h2>
          <p>{(error as Error).message}</p>;
        </Layout>
      );
    }

    if (isFetching) {
      return (
        <Layout>
          <h2>Admin</h2>
          <Loader active={true} />
        </Layout>
      );
    }

    return (
      <Layout>
        <h1>Admin</h1>
        <Form success={isSuccess} error={error !== null} onSubmit={this.submit}>
          <Grid columns={2} divided={true}>
            <Grid.Row>
              <Grid.Column width={4}>
                <List>
                  {Object.keys(assets).map((f) => (
                    <List.Item key={f} as={Button} onClick={this.changeFile(f)} active={f === filename} basic={true} style={{ padding: 5 }}>
                      <List.Icon name={assets[f] ? 'file' : 'folder'} />
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
          <Message error={true} header="Error" content={error && (error as Error).message} />
          <Button type="submit" loading={isFetching}>
            Save
        </Button>
        </Form>
      </Layout>
    );
  }

  private changeFile = (filename: string) => (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    this.setState({ filename })
  }

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

    const { assets, filename } = this.state

    this.setState({ isFetching: true });
    saveAsset(filename, assets[filename])
      .then(() =>
        this.setState({ isSuccess: true, isFetching: false })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  };
}

export default Admin;

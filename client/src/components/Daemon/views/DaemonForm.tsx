import * as React from "react";
import * as _ from "lodash";
import { Form, Button, Message } from "semantic-ui-react";
import { UnControlled as CodeMirror, IInstance } from "react-codemirror2";

import { IDaemon } from "../types/daemon";
import { saveDaemon } from "../actions/daemon";

import Layout from "../../layout/layout";

interface IDaemonFormProps {
  daemon: IDaemon;
}

interface IDaemonFormStates {
  daemon: IDaemon;
  isFetching: boolean;
  isSuccess: boolean;
  error: Error | null;
}

class DaemonForm extends React.Component<IDaemonFormProps, IDaemonFormStates> {
  public state = {
    daemon: {} as IDaemon,
    isFetching: false,
    isSuccess: false,
    error: null
  };

  public componentWillMount() {
    this.setState({ daemon: this.props.daemon });
  }

  public render() {
    const { daemon, error, isFetching, isSuccess } = this.state;

    return (
      <Layout>
        <h2>Daemon</h2>
        <Form success={isSuccess} error={error !== null} onSubmit={this.submit}>
          <Form.Input
            label="Name"
            name="Name"
            type="text"
            value={daemon.Name}
            onChange={this.handleChange}
          />
          <Form.Group inline={true}>
            <Form.Input
              label="Host"
              name="Host"
              type="text"
              value={daemon.Host}
              onChange={this.handleChange}
              width={8}
            />

            <Form.Input
              label="Port"
              name="Port"
              type="number"
              value={daemon.Port}
              onChange={this.handleChange}
              width={4}
            />
          </Form.Group>

          <Form.Input
            label="CAdvisor"
            name="CAdvisor"
            type="url"
            value={daemon.CAdvisor}
            onChange={this.handleChange}
          />

          <p>Description</p>
          <CodeMirror
            value={daemon.Description}
            options={{
              mode: "markdown",
              theme: "material",
              lineNumbers: true,
              gutters: ["Description"]
            }}
            onChange={this.handleChangeCodeEditor}
          />

          <p>Ca</p>
          <CodeMirror
            value={daemon.Ca}
            options={{
              mode: "plain",
              theme: "material",
              lineNumbers: true,
              gutters: ["Ca"]
            }}
            onChange={this.handleChangeCodeEditor}
          />

          <p>Cert</p>
          <CodeMirror
            value={daemon.Cert}
            options={{
              mode: "plain",
              theme: "material",
              lineNumbers: true,
              gutters: ["Cert"]
            }}
            onChange={this.handleChangeCodeEditor}
          />

          <p>Key</p>
          <CodeMirror
            value={daemon.Key}
            options={{
              mode: "plain",
              theme: "material",
              lineNumbers: true,
              gutters: ["Key"]
            }}
            onChange={this.handleChangeCodeEditor}
          />

          <Form.Input
            label="Volume"
            name="Volume"
            type="text"
            value={daemon.Volume}
            onChange={this.handleChange}
          />

          <Message
            success={true}
            header="Saved"
            content="Your daemon has been saved"
          />
          <Message error={true} header="Error" content={!error} />
          <Button type="submit" loading={isFetching}>
            Save
          </Button>
        </Form>
      </Layout>
    );
  }

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>,
    { name, value }: any
  ) => {
    this.setState({ daemon: _.set(this.state.daemon, name, value) });
  };

  private handleChangeCodeEditor = (
    editor: IInstance,
    data: CodeMirror.EditorChange,
    value: string
  ) => {
    this.setState({
      daemon: _.set(this.state.daemon, editor.options.gutters![0], value)
    });
  };

  private submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    this.setState({ isFetching: true });
    saveDaemon(this.state.daemon)
      .then((daemon: IDaemon) =>
        this.setState({ daemon, isSuccess: true, isFetching: false })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  };
}

export default DaemonForm;

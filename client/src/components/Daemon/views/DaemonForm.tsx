import * as React from "react";
import * as _ from "lodash";
import { Form, Button, Message } from "semantic-ui-react";
import { UnControlled as CodeMirror, IInstance } from "react-codemirror2";

import { IDaemon } from "../types/daemon";
import { saveDaemon } from "../actions/daemon";
import Layout from '../../layout/layout';

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
    this.setState({ daemon: this.props.daemon ? this.props.daemon : {Docker: {}, SSH: {}} as IDaemon });
  }

  public render() {
    const { daemon, error, isFetching, isSuccess } = this.state;

    const CustomTag = daemon._id ? 'span' : Layout
    return (
      <CustomTag>
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
              label="Docker Port"
              name="Docker.Port"
              type="number"
              value={daemon.Docker.Port}
              onChange={this.handleChange}
              width={4}
            />

            <Form.Input
              label="SSH Port"
              name="SSH.Port"
              type="number"
              value={daemon.SSH.Port}
              onChange={this.handleChange}
              width={4}
            />
          </Form.Group>

          <Form.Group inline={true}>
            <Form.Input
              label="SSH User"
              name="SSH.User"
              type="text"
              value={daemon.SSH.User}
              onChange={this.handleChange}
              width={6}
            />

            <Form.Input
              label="SSH Password"
              name="SSH.Password"
              type="text"
              value={daemon.SSH.Password}
              onChange={this.handleChange}
              width={6}
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
            value={daemon.Docker.Ca}
            options={{
              mode: "plain",
              theme: "material",
              lineNumbers: true,
              gutters: ["Docker.Ca"]
            }}
            onChange={this.handleChangeCodeEditor}
          />

          <p>Cert</p>
          <CodeMirror
            value={daemon.Docker.Cert}
            options={{
              mode: "plain",
              theme: "material",
              lineNumbers: true,
              gutters: ["Docker.Cert"]
            }}
            onChange={this.handleChangeCodeEditor}
          />

          <p>Key</p>
          <CodeMirror
            value={daemon.Docker.Key}
            options={{
              mode: "plain",
              theme: "material",
              lineNumbers: true,
              gutters: ["Docker.Key"]
            }}
            onChange={this.handleChangeCodeEditor}
          />

          <Form.Input
            label="Docker Volume"
            name="Docker.Volume"
            type="text"
            value={daemon.Docker.Volume}
            onChange={this.handleChange}
          />

          <Message
            success={true}
            header="Saved"
            content="Your daemon has been saved"
          />
          <Message error={true} header="Error" content={error && (error as Error).message} />
          <Button type="submit" loading={isFetching}>
            Save
        </Button>
        </Form>
      </CustomTag>
    );
  }

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>,
    { name, value, type }: any
  ) => {
    this.setState({ daemon: _.set(this.state.daemon, name, type === 'number' ? (parseInt(value, undefined) as number) : value) });
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

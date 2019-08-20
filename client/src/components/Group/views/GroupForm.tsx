import * as _ from 'lodash';
import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { Button, Form, Message } from 'semantic-ui-react';

import { fetchDaemons } from '../../Daemon/actions/daemon';
import { IDaemon } from '../../Daemon/types/daemon';
import { saveGroup } from '../actions/group';
import { IGroup } from '../types/group';

interface IGroupProps {
  group: IGroup;
}
interface IGroupStates {
  group: IGroup;
  daemons: IDaemon[];
  isFetching: boolean;
  isSuccess: boolean;
  error: Error;
}

class Group extends React.Component<IGroupProps, IGroupStates> {
  public state = {
    group: this.props.group ? this.props.group : ({} as IGroup),
    daemons: [],
    isFetching: false,
    isSuccess: false,
    error: Error()
  };

  public componentDidMount() {
    fetchDaemons().then((daemons: IDaemon[]) => this.setState({ daemons }));
  }

  public render() {
    const { daemons, group, error, isSuccess, isFetching } = this.state;

    return (
      <>
        {!group._id && <h1>Create new group</h1>}
        <Form
          success={isSuccess}
          error={!!error.message}
          onSubmit={this.submit}
        >
          <Form.Input
            label="Name"
            name="name"
            type="text"
            value={group.name}
            onChange={this.handleChange}
            required={true}
          />
          <CodeMirror
            value={group.description}
            options={{
              mode: "markdown",
              theme: "material",
              lineNumbers: true,
              gutters: ["description"]
            }}
            autoCursor={false}
            onChange={this.handleChangeCodeEditor}
          />
          <Form.Dropdown
            search={true}
            selection={true}
            fluid={true}
            label="Daemon"
            name="daemon_id"
            defaultValue={group.daemon_id}
            options={daemons.map((d: IDaemon) => {
              return { text: d.name, value: d._id };
            })}
            onChange={this.handleChange}
            required={true}
          />
          <Form.Group widths="equal">
            <Form.Input
              label="Docker MinPort"
              name="min_port"
              type="number"
              value={group.min_port}
              onChange={this.handleChange}
              required={true}
            />
            <Form.Input
              label="Docker MaxPort"
              name="max_port"
              type="number"
              value={group.max_port}
              onChange={this.handleChange}
              required={true}
            />
          </Form.Group>
          <Form.Input
            label="Docker Subnet"
            name="subnet"
            type="string"
            pattern="^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/\d+$"
            value={group.subnet}
            onChange={this.handleChange}
            required={true}
          />
          <Message
            success={true}
            header="Saved"
            content="Your group has been saved"
          />
          <Message error={true} header="Error" content={error.message} />
          <Button type="Save" loading={isFetching}>
            Save
          </Button>
        </Form>
      </>
    );
  }

  private handleChange = (
    e: React.SyntheticEvent<HTMLElement, Event>,
    { name, value, type }: any
  ) => {
    const group = this.state.group;
    if (type === "number") {
      value = parseInt(value);
    }
    this.setState({ group: _.set(group, name, value) });
  };

  private handleChangeCodeEditor = (
    editor: CodeMirror.Editor,
    data: CodeMirror.EditorChange,
    value: string
  ) => {
    this.setState({
      group: _.set(this.state.group, editor.getOption("gutters")[0], value)
    });
  };

  private submit = () => {
    this.setState({ isFetching: true });
    saveGroup(this.state.group)
      .then((group: IGroup) =>
        this.setState({ group, isSuccess: true, isFetching: false })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  };
}

export default Group;

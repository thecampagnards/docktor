import * as _ from 'lodash';
import * as React from 'react';
import { IInstance, UnControlled as CodeMirror } from 'react-codemirror2';
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
    group: {} as IGroup,
    daemons: [],
    isFetching: false,
    isSuccess: false,
    error: Error()
  };

  public componentWillMount() {
    fetchDaemons().then((daemons: IDaemon[]) => this.setState({ daemons }));
    this.setState({ group: this.props.group ? this.props.group : {} as IGroup });
  }

  public render() {
    const { daemons, group, error, isSuccess, isFetching } = this.state;

    return (
      <>
        {!group._id && <h1>Create new group</h1>}
        <Form success={isSuccess} error={!!error.message} onSubmit={this.submit}>
          <Form.Input
            label="Name"
            name="Name"
            type="text"
            value={group.Name}
            onChange={this.handleChange}
            required={true}
          />
          <CodeMirror
            value={group.Description}
            options={{
              mode: "markdown",
              theme: "material",
              lineNumbers: true,
              gutters: ["Description"]
            }}
            autoCursor={false}
            onChange={this.handleChangeCodeEditor}
          />
          <Form.Dropdown
            search={true}
            selection={true}
            fluid={true}
            label="Daemon"
            name="DaemonID"
            defaultValue={group.DaemonID}
            options={daemons.map((d: IDaemon) => {
              return { text: d.Name, value: d._id };
            })}
            onChange={this.handleChange}
            required={true}
          />
          <Form.Group widths='equal'>
            <Form.Input
              label="Docker MinPort"
              name="MinPort"
              type="number"
              value={group.MinPort}
              onChange={this.handleChange}
              required={true}
            />
            <Form.Input
              label="Docker MaxPort"
              name="MaxPort"
              type="number"
              value={group.MaxPort}
              onChange={this.handleChange}
              required={true}
            />
          </Form.Group>
          <Form.Input
            label="Docker Subnet"
            name="Subnet"
            type="string"
            pattern="^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/\d+$"
            value={group.Subnet}
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
    e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>,
    { name, value, type }: any
  ) => {
    const group = this.state.group;
    if (type === "number") {
      value = parseInt(value, undefined)
    }
    this.setState({ group: _.set(group, name, value) });
  };

  private handleChangeCodeEditor = (
    editor: IInstance,
    data: CodeMirror.EditorChange,
    value: string
  ) => {
    this.setState({
      group: _.set(this.state.group, editor.options.gutters![0], value)
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

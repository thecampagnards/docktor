import * as _ from 'lodash';
import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { Button, Form, Message, Modal } from 'semantic-ui-react';
import { History } from 'history';

import { path } from '../../../constants/path';
import { fetchDaemons } from '../../Daemon/actions/daemon';
import { IDaemon } from '../../Daemon/types/daemon';
import { saveGroup, deleteGroup } from '../actions/group';
import { IGroup } from '../types/group';

interface IGroupProps {
  group: IGroup;
  isAdmin: boolean;
  history: History<any>;
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
    let { isAdmin } = this.props;
    const { daemons, group, error, isSuccess, isFetching } = this.state;
    isAdmin = typeof isAdmin === "undefined" ? true : isAdmin;
    return (
      <>
        {!group._id && <h2>Create new group</h2>}
        <Form
          success={isSuccess}
          error={!!error.message}
          onSubmit={this.submit}
        >
          <Form.Input
            width={4}
            label="Name"
            name="name"
            type="text"
            value={group.name}
            onChange={this.handleChange}
            required={true}
            disabled={!isAdmin}
          />
          <strong>Description</strong>
          <CodeMirror
            className="code-small"
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
          <br />
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
            disabled={!isAdmin}
          />
          <Form.Group widths="equal">
            <Form.Input
              label="Docker Subnet"
              name="subnet"
              type="string"
              pattern="^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/\d+$"
              value={group.subnet || "1.12.10.0/24"} // TODO get value from config
              onChange={this.handleChange}
              required={true}
              disabled={!isAdmin}
            />
            <Form.Input
              label="Docker MinPort"
              name="min_port"
              type="number"
              value={group.min_port || "0"}
              onChange={this.handleChange}
              required={true}
              disabled={!isAdmin}
            />
            <Form.Input
              label="Docker MaxPort"
              name="max_port"
              type="number"
              value={group.max_port || "0"}
              onChange={this.handleChange}
              required={true}
              disabled={!isAdmin}
            />
          </Form.Group>

          <br />
          
          <Message
            success={true}
            header="OK"
            content="Groud saved"
          />
          <Message error={true} header="Error" content={error.message} />

          <Button type="Save" color="teal" labelPosition="left" icon="save" content="SAVE" loading={isFetching} />
          
          {group._id &&
            <Modal
              trigger={<Button floated="right" color="red" labelPosition="right" icon="trash" content="Delete group" disabled={!isAdmin} />}
              size="mini"
            >
              <Modal.Header>{`Delete group ${group.name} ?`}</Modal.Header>
              <Modal.Actions>
                <Button.Group fluid={true}>
                  <Button
                    color="red"
                    icon="trash"
                    content="Delete permanently"
                    loading={isFetching}
                    onClick={this.delete.bind(this, group._id)}
                  />
                </Button.Group>
              </Modal.Actions>
            </Modal>
          }
          
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
      group: _.set(this.state.group, editor.getOption("gutters")![0], value)
    });
  };

  private submit = () => {
    const isNew = !this.state.group._id;
    this.setState({ isFetching: true });
    saveGroup(this.state.group)
      .then((group: IGroup) => {
        if (isNew) {
          this.props.history.push(path.groupsEdit.replace(":groupID", group._id));
        } else {
          this.setState({ group, isSuccess: true, isFetching: false });
        }
      })
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  };

  private delete = (groupID: string) => {
    this.setState({ isFetching: true });
    deleteGroup(groupID)
      .then(() => this.props.history.push(path.groups))
      .catch(error => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }
}

export default Group;

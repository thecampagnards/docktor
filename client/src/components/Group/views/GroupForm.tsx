import * as React from "react";
import { Form, Button, Message } from "semantic-ui-react";

import { fetchDaemons } from "../../Daemon/actions/daemon";

import { IGroup } from "../types/group";
import { IDaemon } from "../../Daemon/types/daemon";
import { saveGroup } from "../actions/group";

interface IGroupProps {
  group: IGroup;
}
interface IGroupStates {
  group: IGroup;
  daemons: IDaemon[];
  isFetching: boolean;
  isSuccess: boolean;
  error: Error | null;
}

class Group extends React.Component<IGroupProps, IGroupStates> {
  public state = {
    group: {} as IGroup,
    daemons: [],
    isFetching: false,
    isSuccess: false,
    error: null
  };

  public componentWillMount() {
    fetchDaemons().then((daemons: IDaemon[]) => this.setState({ daemons }));
    this.setState({ group: this.props.group });
  }

  public render() {
    const { daemons, group, error, isSuccess, isFetching } = this.state;

    if (!group) {
      return <p>No data yet ...</p>;
    }

    return (
      <Form success={isSuccess} error={error !== null} onSubmit={this.submit}>
        <Form.Input
          label="Name"
          name="Name"
          type="text"
          value={group.Name}
          onChange={this.handleChange}
        />
        <Form.TextArea
          label="Description"
          name="Description"
          value={group.Description}
          onChange={this.handleChange}
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
        />
        <Message
          success={true}
          header="Saved"
          content="Your group has been saved"
        />
        <Message error={true} header="Error" content={error} />
        <Button type="Save" loading={isFetching}>
          Submit
        </Button>
      </Form>
    );
  }

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>,
    { name, value }: any
  ) => {
    const group = this.state.group;
    group[name] = value;
    this.setState({ group });
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

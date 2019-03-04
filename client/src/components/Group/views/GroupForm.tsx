import * as React from "react";
import * as _ from "lodash";
import { Form, Button, Message } from "semantic-ui-react";
import { UnControlled as CodeMirror, IInstance } from "react-codemirror2";

import { fetchDaemons } from "../../Daemon/actions/daemon";

import { IGroup } from "../types/group";
import { IDaemon } from "../../Daemon/types/daemon";
import { saveGroup } from "../actions/group";
import Layout from '../../layout/layout';

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
    this.setState({ group: this.props.group ? this.props.group : {} as IGroup});
  }

  public render() {
    const { daemons, group, error, isSuccess, isFetching } = this.state;

    if (!group) {
      return <p>No data yet ...</p>;
    }

    return (
      <Layout>
        <Form success={isSuccess} error={error !== null} onSubmit={this.submit}>
          <Form.Input
            label="Name"
            name="Name"
            type="text"
            value={group.Name}
            onChange={this.handleChange}
          />
          <CodeMirror
            value={group.Description}
            options={{
              mode: "markdown",
              theme: "material",
              lineNumbers: true,
              gutters: ["Description"]
            }}
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
      </Layout>
    );
  }

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>,
    { name, value }: any
  ) => {
    const group = this.state.group;
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

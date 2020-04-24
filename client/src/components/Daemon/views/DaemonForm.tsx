import * as _ from "lodash";
import * as React from "react";
import { UnControlled as CodeMirror } from "react-codemirror2";
import {
  Accordion,
  AccordionTitleProps,
  Button,
  Form,
  Icon,
  Message,
  Modal,
} from "semantic-ui-react";
import { History } from "history";

import { saveDaemon, deleteDaemon } from "../actions/daemon";
import { IDaemon } from "../types/daemon";
import { path } from "../../../constants/path";

interface IDaemonFormProps {
  daemon: IDaemon;
  history: History<any>;
}

interface IDaemonFormStates {
  daemon: IDaemon;
  isFetching: boolean;
  isSuccess: boolean;
  error: Error;

  activeAccordions: number[];
}

class DaemonForm extends React.Component<IDaemonFormProps, IDaemonFormStates> {
  public state = {
    daemon: this.props.daemon
      ? this.props.daemon
      : ({
          docker: { certs: {}, port: 2376, volume: "/data/" },
          ssh: { port: 22 },
        } as IDaemon),
    isFetching: false,
    isSuccess: false,
    error: Error(),

    activeAccordions: [] as number[],
  };

  public render() {
    const {
      daemon,
      error,
      isFetching,
      isSuccess,
      activeAccordions,
    } = this.state;

    return (
      <>
        {!daemon._id && <h2>Create new daemon</h2>}
        <Form
          success={isSuccess}
          error={!!error.message}
          onSubmit={this.submit}
        >
          <Form.Group>
            <Form.Input
              width={5}
              label="Name"
              name="name"
              type="text"
              value={daemon.name}
              onChange={this.handleChange}
              required={true}
            />
            <Form.Input
              label="Host"
              name="host"
              type="text"
              value={daemon.host}
              onChange={this.handleChange}
              width={8}
              required={true}
            />
            <Form.Input
              label="Docker Port"
              name="docker.port"
              type="number"
              value={daemon.docker.port}
              onChange={this.handleChange}
              width={3}
            />
          </Form.Group>

          <Form.Group>
            <Form.Input
              label="SSH Port"
              name="ssh.port"
              type="number"
              value={daemon.ssh.port}
              onChange={this.handleChange}
              width={4}
            />
            <Form.Input
              label="SSH User"
              name="ssh.user"
              type="text"
              value={daemon.ssh.user}
              onChange={this.handleChange}
              width={6}
            />
            <Form.Input
              label="SSH Password"
              name="ssh.password"
              type="password"
              value={daemon.ssh.password}
              onChange={this.handleChange}
              width={6}
            />
          </Form.Group>

          <Form.Input
            label="CAdvisor URL"
            name="cadvisor"
            type="url"
            value={daemon.cadvisor}
            onChange={this.handleChange}
          />

          <Form.Input
            label="Tags"
            name="tags"
            type="text"
            value={daemon.tags ? daemon.tags.join(",") : ""}
            onChange={this.handleChange}
          />

          <Accordion exclusive={false} fluid={true}>
            <Accordion.Title
              active={activeAccordions.indexOf(0) !== -1}
              index={0}
              onClick={this.handleAccordion}
            >
              <b>
                <Icon name="dropdown" />
                Description
              </b>
            </Accordion.Title>
            <Accordion.Content active={activeAccordions.indexOf(0) !== -1}>
              <CodeMirror
                className="code-small"
                value={daemon.description}
                options={{
                  mode: "markdown",
                  theme: "material",
                  lineNumbers: true,
                  gutters: ["description"],
                }}
                autoCursor={false}
                onChange={this.handleChangeCodeEditor}
              />
            </Accordion.Content>

            <Accordion.Title
              active={activeAccordions.indexOf(1) !== -1}
              index={1}
              onClick={this.handleAccordion}
            >
              <b>
                <Icon name="dropdown" />
                Ca
              </b>
            </Accordion.Title>
            <Accordion.Content active={activeAccordions.indexOf(1) !== -1}>
              <CodeMirror
                value={daemon.docker.certs.ca}
                options={{
                  mode: "plain",
                  theme: "material",
                  lineNumbers: true,
                  gutters: ["docker.certs.ca"],
                }}
                autoCursor={false}
                onChange={this.handleChangeCodeEditor}
              />
            </Accordion.Content>

            <Accordion.Title
              active={activeAccordions.indexOf(2) !== -1}
              index={2}
              onClick={this.handleAccordion}
            >
              <b>
                <Icon name="dropdown" />
                Cert
              </b>
            </Accordion.Title>
            <Accordion.Content active={activeAccordions.indexOf(2) !== -1}>
              <CodeMirror
                value={daemon.docker.certs.cert}
                options={{
                  mode: "plain",
                  theme: "material",
                  lineNumbers: true,
                  gutters: ["docker.certs.cert"],
                }}
                autoCursor={false}
                onChange={this.handleChangeCodeEditor}
              />
            </Accordion.Content>

            <Accordion.Title
              active={activeAccordions.indexOf(3) !== -1}
              index={3}
              onClick={this.handleAccordion}
            >
              <b>
                <Icon name="dropdown" />
                Key
              </b>
            </Accordion.Title>
            <Accordion.Content active={activeAccordions.indexOf(3) !== -1}>
              <CodeMirror
                value={daemon.docker.certs.key}
                options={{
                  mode: "plain",
                  theme: "material",
                  lineNumbers: true,
                  gutters: ["docker.certs.key"],
                }}
                autoCursor={false}
                onChange={this.handleChangeCodeEditor}
              />
            </Accordion.Content>
          </Accordion>
          <br />
          <Form.Input
            label="Docker Volume"
            name="docker.volume"
            type="text"
            value={daemon.docker.volume}
            onChange={this.handleChange}
          />
          <br />
          <Message success={true} header="Saved" content="Daemon saved" />
          <Message error={true} header="Error" content={error.message} />

          <Button
            type="submit"
            labelPosition="left"
            icon="save"
            color="teal"
            content="SAVE"
            loading={isFetching}
          />

          {daemon._id && (
            <Modal
              trigger={
                <Button
                  floated="right"
                  color="red"
                  labelPosition="right"
                  icon="trash"
                  content="Delete daemon"
                />
              }
              size="mini"
            >
              <Modal.Header>{`Delete daemon ${daemon.name} ?`}</Modal.Header>
              <Modal.Actions>
                <Button.Group fluid={true}>
                  <Button
                    color="red"
                    icon="trash"
                    content="Delete permanently"
                    loading={isFetching}
                    onClick={this.delete.bind(this, daemon._id)}
                  />
                </Button.Group>
              </Modal.Actions>
            </Modal>
          )}
        </Form>
      </>
    );
  }

  private handleAccordion = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    { index }: AccordionTitleProps
  ) => {
    const { activeAccordions } = this.state;
    const i = activeAccordions.indexOf(index as number);
    i === -1
      ? activeAccordions.push(index as number)
      : activeAccordions.splice(i, 1);
    this.setState({ activeAccordions });
  };

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    { name, value, type }: any
  ) => {
    if (type === "number") {
      value = parseInt(value);
    } else if (name === "tags") {
      value = value.split(",");
    }
    this.setState({ daemon: _.set(this.state.daemon, name, value) });
  };

  private handleChangeCodeEditor = (
    editor: CodeMirror.Editor,
    data: CodeMirror.EditorChange,
    value: string
  ) => {
    this.setState({
      daemon: _.set(this.state.daemon, editor.getOption("gutters")![0], value),
    });
  };

  private submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const isNew = !this.state.daemon._id;
    this.setState({ isFetching: true });
    saveDaemon(this.state.daemon)
      .then((daemon: IDaemon) => {
        if (isNew) {
          this.props.history.push(
            path.daemonsEdit.replace(":daemonID", daemon._id)
          );
        } else {
          this.setState({
            daemon,
            isSuccess: true,
            isFetching: false,
            error: Error(),
          });
        }
      })
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  };

  private delete = (daemonID: string) => {
    this.setState({ isFetching: true });
    deleteDaemon(daemonID)
      .then(() => this.props.history.push(path.daemons))
      .catch((error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  };
}

export default DaemonForm;

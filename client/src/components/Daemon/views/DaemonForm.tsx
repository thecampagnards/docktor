import * as _ from 'lodash';
import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { Accordion, AccordionTitleProps, Button, Form, Icon, Message } from 'semantic-ui-react';

import { saveDaemon } from '../actions/daemon';
import { IDaemon } from '../types/daemon';

interface IDaemonFormProps {
  daemon: IDaemon;
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
      : ({ docker: { certs: {} }, ssh: {} } as IDaemon),
    isFetching: false,
    isSuccess: false,
    error: Error(),

    activeAccordions: [] as number[]
  };

  public render() {
    const {
      daemon,
      error,
      isFetching,
      isSuccess,
      activeAccordions
    } = this.state;

    return (
      <>
        {!daemon._id && <h1>Create new daemon</h1>}
        <Form
          success={isSuccess}
          error={!!error.message}
          onSubmit={this.submit}
        >
          <Form.Input
            label="Name"
            name="name"
            type="text"
            value={daemon.name}
            onChange={this.handleChange}
            required={true}
          />
          <Form.Group inline={true}>
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
              width={4}
            />

            <Form.Input
              label="SSH Port"
              name="ssh.port"
              type="number"
              value={daemon.ssh.port}
              onChange={this.handleChange}
              width={4}
            />
          </Form.Group>

          <Form.Group inline={true}>
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
            label="CAdvisor"
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
                value={daemon.description}
                options={{
                  mode: "markdown",
                  theme: "material",
                  lineNumbers: true,
                  gutters: ["description"]
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
                  gutters: ["docker.certs.ca"]
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
                  gutters: ["docker.certs.cert"]
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
                  gutters: ["docker.certs.key"]
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
          <Message
            success={true}
            header="Saved"
            content="Your daemon has been saved"
          />
          <Message error={true} header="Error" content={error.message} />
          <Button type="submit" loading={isFetching}>
            Save
          </Button>
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
      daemon: _.set(this.state.daemon, editor.getOption("gutters")![0], value)
    });
  };

  private submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    this.setState({ isFetching: true });
    saveDaemon(this.state.daemon)
      .then((daemon: IDaemon) =>
        this.setState({
          daemon,
          isSuccess: true,
          isFetching: false,
          error: Error()
        })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  };
}

export default DaemonForm;

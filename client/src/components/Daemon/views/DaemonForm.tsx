import * as _ from 'lodash';
import * as React from 'react';
import { IInstance, UnControlled as CodeMirror } from 'react-codemirror2';
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

  activeAccordions: number[]
}

class DaemonForm extends React.Component<IDaemonFormProps, IDaemonFormStates> {
  public state = {
    daemon: {} as IDaemon,
    isFetching: false,
    isSuccess: false,
    error: Error(),

    activeAccordions: [] as number[]
  };

  public componentWillMount() {
    this.setState({ daemon: this.props.daemon ? this.props.daemon : { Docker: {}, SSH: {} } as IDaemon });
  }

  public render() {
    const { daemon, error, isFetching, isSuccess, activeAccordions } = this.state;

    return (
        <Form success={isSuccess} error={!!error.message} onSubmit={this.submit}>
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
              type="password"
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

          <Form.Input
            label="Tags"
            name="Tags"
            type="text"
            value={daemon.Tags ? daemon.Tags.join(",") : ""}
            onChange={this.handleChange}
          />

          <Accordion exclusive={false} fluid={true}>
            <Accordion.Title active={activeAccordions.indexOf(0) !== -1} index={0} onClick={this.handleAccordion}>
              <b>
                <Icon name="dropdown" />
                Description
              </b>
            </Accordion.Title>
            <Accordion.Content active={activeAccordions.indexOf(0) !== -1}>
              <CodeMirror
                value={daemon.Description}
                options={{
                  mode: "markdown",
                  theme: "material",
                  lineNumbers: true,
                  gutters: ["Description"]
                }}
                autoCursor={false}
                onChange={this.handleChangeCodeEditor}
              />
            </Accordion.Content>

            <Accordion.Title active={activeAccordions.indexOf(1) !== -1} index={1} onClick={this.handleAccordion}>
              <b>
                <Icon name="dropdown" />
                Ca
              </b>
            </Accordion.Title>
            <Accordion.Content active={activeAccordions.indexOf(1) !== -1}>
              <CodeMirror
                value={daemon.Docker.Ca}
                options={{
                  mode: "plain",
                  theme: "material",
                  lineNumbers: true,
                  gutters: ["Docker.Ca"]
                }}
                autoCursor={false}
                onChange={this.handleChangeCodeEditor}
              />
            </Accordion.Content>

            <Accordion.Title active={activeAccordions.indexOf(2) !== -1} index={2} onClick={this.handleAccordion}>
              <b>
                <Icon name="dropdown" />
                Cert
              </b>
            </Accordion.Title>
            <Accordion.Content active={activeAccordions.indexOf(2) !== -1}>
              <CodeMirror
                value={daemon.Docker.Cert}
                options={{
                  mode: "plain",
                  theme: "material",
                  lineNumbers: true,
                  gutters: ["Docker.Cert"]
                }}
                autoCursor={false}
                onChange={this.handleChangeCodeEditor}
              />
            </Accordion.Content>

            <Accordion.Title active={activeAccordions.indexOf(3) !== -1} index={3} onClick={this.handleAccordion}>
              <b>
                <Icon name="dropdown" />
                Key
              </b>
            </Accordion.Title>
            <Accordion.Content active={activeAccordions.indexOf(3) !== -1}>
              <CodeMirror
                value={daemon.Docker.Key}
                options={{
                  mode: "plain",
                  theme: "material",
                  lineNumbers: true,
                  gutters: ["Docker.Key"]
                }}
                autoCursor={false}
                onChange={this.handleChangeCodeEditor}
              />
            </Accordion.Content>
          </Accordion>
          <br />
          <Form.Input
            label="Docker Volume"
            name="Docker.Volume"
            type="text"
            value={daemon.Docker.Volume}
            onChange={this.handleChange}
          />
          <br />
          <Message
            success={true}
            header="Saved"
            content="Your daemon has been saved"
          />
          <Message error={true} header="Error" content={error.message} />
          <br />
          <Button type="submit" loading={isFetching}>
            Save
        </Button>
        </Form>
    );
  }

  private handleAccordion = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, { index }: AccordionTitleProps) => {
    const { activeAccordions } = this.state
    const i = activeAccordions.indexOf(index as number)
    i === -1 ? activeAccordions.push(index as number) : activeAccordions.splice(i, 1)
    this.setState({ activeAccordions })
  }

  private handleChange = (
    e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>,
    { name, value, type }: any
  ) => {
    if (type === "number") {
      value = parseInt(value, undefined)
    } else if (name === "Tags") {
      value = value.split(",")
    }
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
        this.setState({ daemon, isSuccess: true, isFetching: false, error: Error() })
      )
      .catch((error: Error) => this.setState({ error, isFetching: false }));
  };
}

export default DaemonForm;

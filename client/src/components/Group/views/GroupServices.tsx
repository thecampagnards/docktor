import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';
import { Button, Card, Loader, Message, Modal, Grid, Icon } from 'semantic-ui-react';

import { fetchServiceBySubService } from '../../Services/actions/service';
import { IService } from '../../Services/types/service';
import { getService } from '../actions/group';
import { IGroup } from '../types/group';
import GroupService from './GroupService';
import { Link } from 'react-router-dom';
import { path } from 'src/constants/path';

interface IGroupProps {
  group: IGroup;
  admin: boolean;
}

interface IGroupStates {
  services: IService[];
  isFetching: boolean;
  error: Error;
  modalOpen: boolean;
  content: string;
}

class GroupServices extends React.Component<IGroupProps, IGroupStates> {
  public state = {
    services: [],
    isFetching: true,
    error: Error(),
    modalOpen: false,
    content: ""
  };

  public componentWillMount() {
    const { group } = this.props;
    group.services.map(service => {
      fetchServiceBySubService(service._id)
        .then(s => {
          const services: IService[] = this.state.services;
          services.push(s);
          this.setState({ services });
        })
        .catch(error => this.setState({ error }));
    });
  }

  public render() {
    const { group, admin } = this.props;
    const { services, error, isFetching, modalOpen, content } = this.state;

    if (error.message) {
      return (
        <Message negative={true}>
          <Message.Header>There was an issue</Message.Header>
          <p>{error.message}</p>
        </Message>
      );
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return (
      <>

        <Grid>
          <Grid.Column width={12} />
          <Grid.Column width={4}>
            <Button primary={true} labelPosition="right" icon={true} as={Link} to={path.marketgroup.replace(":groupID", group._id)} floated="right">
              <Icon name="plus" />ADD SERVICE
            </Button>
          </Grid.Column>
        </Grid>

        <Card.Group>
          {services.map((service: IService, index: number) => (
            <span key={index}>
              <GroupService service={service} />
              { admin &&
              <Modal
                trigger={
                  <Button
                    onClick={this.handleOpen.bind(this, group.services[0]._id)}
                  >
                    Get Compose File
                  </Button>
                }
                open={modalOpen}
                onClose={this.handleClose}
                basic={true}
                size="fullscreen"
                style={{ height: "80%" }}
              >
                <Modal.Content style={{ height: "100%" }}>
                  <CodeMirror
                    className="height-100"
                    value={content}
                    options={{
                      mode: "yaml",
                      lint: true,
                      theme: "material",
                      lineNumbers: true,
                      readOnly: true,
                      cursorBlinkRate: -1
                    }}
                  />
                </Modal.Content>
              </Modal>
              }
            </span>
          ))}
        </Card.Group>
        
      </>
      
    );
  }

  private handleOpen = (subserviceID: string) => {
    const { group } = this.props;
    getService(group._id, subserviceID)
      .then(content => this.setState({ content }))
      .catch(content => this.setState({ content }))
      .finally(() => this.setState({ modalOpen: true }));
  };

  private handleClose = () => this.setState({ modalOpen: false });
}

export default GroupServices;

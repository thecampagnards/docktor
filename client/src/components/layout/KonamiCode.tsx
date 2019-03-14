import * as React from 'react';
import Konami from 'react-konami-code';
import { Header, Image, List, Modal } from 'semantic-ui-react';

import { authors } from '../../constants/authors';

class KonamiCode extends React.Component {
  public state = { modalOpen: false }

  public render() {
    const { modalOpen } = this.state
    return (
      <Konami action={this.handleOpen}>
        <Modal basic={true} open={modalOpen} onClose={this.handleClose}>
          <Header icon="users" content="CDK Team" />
          <Modal.Content>
            <List>
              {authors.map((author, key) => (
                <List.Item key={key}>
                  <Image avatar={true} src={author.image} />
                  <List.Content>
                    <List.Header as="a" href={author.url} target="_blank">
                      {author.name}
                    </List.Header>
                    <List.Description
                      dangerouslySetInnerHTML={{ __html: author.description }}
                      style={{ color: "white" }}
                    />
                  </List.Content>
                </List.Item>
              ))}
            </List>
          </Modal.Content>
        </Modal>
      </Konami>
    )
  }

  private handleOpen = () => this.setState({ modalOpen: true })
  private handleClose = () => this.setState({ modalOpen: false })
}

export default KonamiCode

import * as React from "react";
import Konami from "react-konami-code";
import { Modal, Header, List, Image } from "semantic-ui-react";

class KonamiCode extends React.Component {
  public state = { modalOpen: false };

  private authors = [
    {
      image: "https://avatars0.githubusercontent.com/u/14922324",
      url: "https://github.com/thecampagnards",
      name: "TheCampagnards",
      description: "@soprasteria"
    },
    {
      image: "https://avatars0.githubusercontent.com/u/3520706",
      url: "https://github.com/matcornic",
      name: "Mathieu Cornic",
      description: "@ovh"
    }
  ];

  public render() {
    const { modalOpen } = this.state;
    return (
      <Konami action={this.handleOpen}>
        <Modal basic={true} open={modalOpen} onClose={this.handleClose}>
          <Header icon="users" content="CDK Team" />
          <Modal.Content>
            <List>
              {this.authors.map((author, key) => (
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
    );
  }

  private handleOpen = () => this.setState({ modalOpen: true });
  private handleClose = () => this.setState({ modalOpen: false });
}

export default KonamiCode;

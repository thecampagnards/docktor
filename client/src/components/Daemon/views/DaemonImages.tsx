import * as React from "react";
import _ from "lodash";
import { Loader, Message, Table, Button, Popup } from "semantic-ui-react";

import { fetchImages, deleteImage } from "../../Daemon/actions/daemon";
import { IImage, IDaemon } from "../types/daemon";

interface IDaemonImagesProps {
  daemon: IDaemon;
}

interface IDaemonImagesStates {
  isFetching: boolean;
  error: Error;
  images: IImage[];
  errors: { [key: string]: Error };
  loadings: { [key: string]: boolean };
}

class DaemonImages extends React.Component<
  IDaemonImagesProps,
  IDaemonImagesStates
> {
  public state = {
    isFetching: true,
    error: Error(),
    images: [] as IImage[],
    errors: [] as any,
    loadings: [] as any,
  };

  public componentDidMount() {
    const { daemon } = this.props;

    fetchImages(daemon._id)
      .then((images: IImage[]) => this.setState({ images }))
      .catch((error: Error) => this.setState({ error }))
      .finally(() => this.setState({ isFetching: false }));
  }

  public render() {
    const { images, error, isFetching, errors, loadings } = this.state;

    if (error.message) {
      return (
        <Message negative={true}>
          <Message.Header>
            There was an issue to connect to the Docker daemon
          </Message.Header>
          <p>{error.message}</p>
        </Message>
      );
    }

    if (isFetching) {
      return <Loader active={true} />;
    }

    return (
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Options</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {images.map((image, key) => (
            <Table.Row key={image.Id}>
              <Table.Cell width={8}>
                {image.RepoTags ? image.RepoTags.toString() : image.Id}
              </Table.Cell>
              <Table.Cell width={4}>
                <Popup
                  content={errors[image.Id] && errors[image.Id].message}
                  on="click"
                  pinned={true}
                  inverted={true}
                  trigger={
                    <Button
                      icon="delete"
                      color="red"
                      title="Delete this image"
                      onClick={this.deleteImage.bind(this, image.Id)}
                      loading={loadings[image.Id]}
                    />
                  }
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  }

  private deleteImage(id: string) {
    const { loadings, errors, images } = this.state;

    loadings[id] = true;
    this.setState({ loadings });

    this.setState({ loadings });
    deleteImage(this.props.daemon._id, id)
      .then(() =>
        this.setState({ images: _.remove(images, (i) => i.Id !== id) })
      )
      .catch((error: Error) => {
        errors[id] = error;
        this.setState({ errors });
      })
      .finally(() => {
        loadings[id] = false;
        this.setState({ loadings });
      });
  }
}

export default DaemonImages;

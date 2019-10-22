import * as React from 'react';
import { Icon } from 'semantic-ui-react';
import { IContainerStatus } from '../Group/types/group';

interface IServiceStatusIndicatorProps {
  cs: IContainerStatus;
}

export default class ServiceStatusIndicator extends React.Component<
  IServiceStatusIndicatorProps
> {
  public render() {
      const { cs } = this.props;
    switch (true) {
        case cs.State.startsWith("Up"):
          return (
            <Icon
              key={cs.Name}
              className="float-right"
              color="green"
              circular={true}
              name="circle"
              title={`Container ${cs.Name} is running`}
            />
          );
        case cs.State.startsWith("Exited"):
          return (
            <Icon
              key={cs.Name}
              className="float-right"
              color="red"
              circular={true}
              name="circle"
              title={`Container ${cs.Name} is not running`}
            />
          );
        default:
          return (
            <Icon
              key={cs.Name}
              className="float-right"
              color="grey"
              circular={true}
              name="circle"
              title={`Container ${cs.Name} : ${cs.State}`}
            />
          );
      }
  }
}

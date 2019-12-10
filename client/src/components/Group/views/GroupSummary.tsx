import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader, Menu, Message} from 'semantic-ui-react';

import { path } from '../../../constants/path';
import { IDaemon } from '../../Daemon/types/daemon';
import { IGroup } from '../types/group';

interface IGroupSummaryProps {
    group: IGroup;
    daemon: IDaemon;
}

interface IGroupSummaryStates {
    isFetching: boolean;
    error: Error;
}

class GroupSummary extends React.Component<IGroupSummaryProps,IGroupSummaryStates> {
  public state = {
    isFetching: true,
    error: Error()
  };

  public render() {
    const { group } = this.props;
    const { isFetching, error } = this.state;

    if (isFetching) {
        return <Loader active={true}>Loading data</Loader>;
    }

    return (
        <>
          <ReactMarkdown source={group.description} escapeHtml={false} />
          

        </>
      );

  }

}
export default GroupSummary;
import * as React from "react";
import { Tab } from 'semantic-ui-react'

import Layout from "../../layout/layout";
import { RouteComponentProps } from 'react-router';
import { path as constPath } from '../../../constants/path';



class GroupIndex extends React.Component<RouteComponentProps> {

  private panes = [
    { menuItem: 'Tab 2', pane: <Tab.Pane>Tab 2 Content</Tab.Pane> },
    { menuItem: 'Tab 3', pane: <Tab.Pane>Tab 3 Content</Tab.Pane> },
  ]
  
  public render(){
    const path  = this.props.location.pathname

    console.log(path)
    console.log(constPath.groupsMore)

    let activeTab: number;
    switch(true) {
      case path.indexOf(constPath.groupsMore) > -1:
        console.log("toto")
        activeTab = 0;
        break
        case path.indexOf(constPath.groupsMore) > -1:
        console.log("touto")

      activeTab =  1;
        break
      default:
      console.log("tuuoto")

      activeTab =  0;
    }

    console.log(constPath)
    return (
    <Layout>
     <Tab panes={this.panes} renderActiveOnly={false} defaultActiveIndex={activeTab}
      />
    </Layout>
    )
  }

}
export default GroupIndex
import * as React from 'react';
import { Button } from 'semantic-ui-react';

import { changeComposeStatus } from '../actions/daemon';
import { IDaemon } from '../types/daemon';

export function serviceButton(daemon: IDaemon, services: string[]) {
  return <h4>
    {services.join(", ") + " : "}
    <Button.Group>
      <Button color="orange" disabled={false}
        onClick={changeComposeStatus.bind(
          null,
          daemon._id,
          "stop",
          services
        )}>
        Stop
      </Button>
      <Button.Or />
      <Button color="red" disabled={false}
        onClick={changeComposeStatus.bind(
          null,
          daemon._id,
          "remove",
          services
        )}
      >
        Remove
      </Button>
      <Button.Or />
      <Button color="green" disabled={false}
        onClick={changeComposeStatus.bind(
          null,
          daemon._id,
          "start",
          services
        )}
      >
        Start
      </Button>
    </Button.Group>
  </h4>
}
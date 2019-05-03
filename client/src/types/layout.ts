import { SemanticCOLORS } from 'semantic-ui-react';

export interface IMessage {
  icon: string;
  color: SemanticCOLORS;
  header: string;
  content: string;
}
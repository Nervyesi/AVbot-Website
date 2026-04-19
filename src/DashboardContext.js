import { createContext } from 'react';

export const DashboardContext = createContext({
  server:    null,       // { id, name, icon, members }
  user:      null,       // { user_id, username, avatar }
  servers:   [],         // all servers where bot is present
  setServer: () => {},   // switch active server
});

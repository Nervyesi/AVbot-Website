import { createContext } from 'react';

export const DashboardContext = createContext({
  server:         null,       // { id, name, icon, members, is_premium }
  user:           null,       // { user_id, username, avatar }
  servers:        [],         // all servers where bot is present and user is admin/owner
  setServer:      () => {},   // switch active server
  isPremium:      false,      // true only for premium-plan guilds
  accessError:    null,       // 403 error message string, or null
  setAccessError: () => {},   // set a 403 access-denied message
});

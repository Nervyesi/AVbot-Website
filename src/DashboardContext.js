import { createContext } from 'react';

// Shared context so Overview, Analytics, settings pages can all read
// the active server + logged-in user without prop-drilling.
export const DashboardContext = createContext({
  server: null,   // { id, name, icon, members }
  user:   null,   // { user_id, username, avatar, guilds }
});

import { databasePlugin } from "./Database.ts";

export const initializePlugins = () => {
  // creates the database, and closes the connection
  databasePlugin()();
  return () => {};
};

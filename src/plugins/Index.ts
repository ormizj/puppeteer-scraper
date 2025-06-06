import { databasePlugin } from "./Database.ts";

export default () => {
  // creates the database and closes the connection
  databasePlugin()();
  // cleanup function
  return () => {};
};

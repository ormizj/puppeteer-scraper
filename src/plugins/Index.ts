import { databasePlugin } from "./databasePlugin.ts";
import { runtimeConfigPlugin } from "./runtimeConfigPlugin.ts";

export default () => {
  databasePlugin();
  runtimeConfigPlugin();
};

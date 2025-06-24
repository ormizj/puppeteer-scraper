import { random } from "./numberUtil.ts";

export const sleep = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const jitter = async (min: number, max: number) => {
  await sleep(random(min, max));
};

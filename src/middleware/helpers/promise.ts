import { ConnectionI } from "../interfaces/connection";
import { PromiseMethod } from "../types/promise-handler";

export const createPromise = (): [
  PromiseMethod,
  PromiseMethod,
  Promise<ConnectionI | string>
] => {
  let resolver = (value: ConnectionI | string) => {};
  let rejecter = (value: ConnectionI | string) => {};
  const promise = new Promise<ConnectionI | string>((resolve, reject) => {
    resolver = resolve;
    rejecter = reject;
  });
  return [resolver, rejecter, promise];
};

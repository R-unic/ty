import { primitiveGuards } from "./primitives";
import type { GuardMeta } from "./types";
import * as customGuards from "./guards";

type MethodsToFunctions<T> = {
  [K in keyof T]:
  T[K] extends (...args: infer A) => infer R
  ? GuardMeta & ((...args: A) => R)
  : T[K];
};

type ty = MethodsToFunctions<typeof _ty>;
const _ty = { ...primitiveGuards, ...customGuards };
const ty = table.freeze(_ty as never as ty);

export * from "./types";
export default ty;
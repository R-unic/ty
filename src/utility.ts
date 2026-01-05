import repr, { type ReprOptions } from "@rbxts/repr";

import type { Guard, ValidationResult, ValidationSuccess, ValidationFailure, GuardError } from "./types";

export const ROOT_PATH = "$";

const REPR_OPTIONS: ReprOptions = { pretty: true };

export function guard<T, Name extends string>(typeName: Name, callback: (value: unknown, path?: string) => ValidationResult<T>): Guard<T, Name> {
  return setmetatable({ typeName }, {
    __call: (_, value, path) => callback(value, path as never),
    __tostring: () => typeName
  }) as Guard<T, Name>;
}

export function success<T>(value: T): ValidationSuccess<T> {
  return {
    success: true,
    value
  };
}

export function failure(errors: GuardError[]): ValidationFailure;
export function failure(path: string, expected: string, actual: unknown, message?: string): ValidationFailure;
export function failure(errors: GuardError[] | string, expected?: string, actual?: unknown, message?: string): ValidationFailure {
  return {
    success: false,
    errors: typeIs(errors, "string") ? [guardError(errors, expected!, actual, message)] : errors
  };
}

export function guardError(path: string, expected: string, actual: unknown, message?: string): GuardError {
  return {
    path, expected, actual,
    message: message ?? `Expected '${expected}', got: ${repr(actual, REPR_OPTIONS)}` + (path !== ROOT_PATH && path !== expected ? ` (${path})` : "")
  };
}

export function pathJoin(...paths: string[]): string {
  return paths.filter(p => p !== ROOT_PATH).map(p => p.match("(\&|\|)")[0] !== undefined ? `(${p})` : p).join(".");
}
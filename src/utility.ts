import repr, { type ReprOptions } from "@rbxts/repr";

import type { Guard, ValidationResult, ValidationSuccess, ValidationFailure } from "./types";

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

export function failure(path: string, expected: string, actual: unknown, message?: string): ValidationFailure {
  return {
    success: false,
    errors: [{
      path,
      expected,
      actual,
      message: message ?? `Expected '${expected}', got: ${repr(actual, REPR_OPTIONS)}`
    }]
  };
}

export function pathJoin(...paths: string[]): string {
  return paths.filter(p => p !== ROOT_PATH).join("/");
}
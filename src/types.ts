export interface GuardError {
  readonly path: string;
  readonly expected: string;
  readonly actual: unknown;
  readonly message: string;
}

export interface ValidationSuccess<T> {
  readonly success: true;
  readonly value: T;
}

export interface ValidationFailure {
  readonly success: false;
  readonly errors: GuardError[];
}

export type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure;
export type InferGuard<T> = T extends Guard<infer U> ? U : never;
export interface GuardMeta<Name extends string = string> {
  readonly typeName: Name;
}

export interface Guard<T, Name extends string = string> extends GuardMeta<Name> {
  (value: unknown, path?: string): ValidationResult<T>;
}

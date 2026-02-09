import { Modding } from "@flamework/core";
import { Assert } from "@rbxts/runit";

import type { ValidationFailure, ValidationResult } from "@rbxts/ty";

type CallsiteMetadata = Modding.CallerMany<"line" | "character">;

/** @metadata macro */
export function assertSuccessValue<T>(result: ValidationResult<T>, value: T, meta?: CallsiteMetadata): void {
  Assert.true(result.success, meta);
  Assert.equal(value, result.value, meta);
}

/** @metadata macro */
export function assertSuccessType(
  result: ValidationResult<any>,
  typeName: keyof CheckableTypes,
  meta?: CallsiteMetadata
): void {
  Assert.true(result.success, meta);
  Assert.isCheckableType(result.value, typeName, meta);
}

/** @metadata macro */
export function assertSingleError(
  result: ValidationResult<unknown>,
  expectedTypeName: string,
  expectedValueText: string,
  expectedPath?: string,
  meta?: CallsiteMetadata
): asserts result is ValidationFailure {
  assertSingleErrorWhoCaresAboutTheMessage(result, meta);
  const pathText = expectedPath !== undefined ? " (" + expectedPath + ")" : "";
  Assert.equal(`Expected '${expectedTypeName}', got: ${expectedValueText}${pathText}`, result.errors[0].message, meta);
}

/** @metadata macro */
export function assertSingleErrorWhoCaresAboutTheMessage(
  result: ValidationResult<unknown>,
  meta?: CallsiteMetadata
): asserts result is ValidationFailure {
  Assert.false(result.success, meta);
  Assert.single(result.errors, meta);
}
import { Assert } from "@rbxts/runit";

import type { ValidationFailure, ValidationResult } from "@rbxts/ty";

export function assertSuccessValue<T>(result: ValidationResult<T>, value: T): void {
  Assert.true(result.success);
  Assert.equal(value, result.value);
}

export function assertSuccessType(result: ValidationResult<any>, typeName: keyof CheckableTypes): void {
  Assert.true(result.success);
  Assert.isCheckableType(result.value, typeName);
}

export function assertSingleError(result: ValidationResult<unknown>, expectedTypeName: string, expectedValueText: string, expectedPath?: string): asserts result is ValidationFailure {
  assertSingleErrorWhoCaresAboutTheMessage(result);
  const pathText = expectedPath !== undefined ? " (" + expectedPath + ")" : "";
  Assert.equal(`Expected '${expectedTypeName}', got: ${expectedValueText}${pathText}`, result.errors[0].message);
}

export function assertSingleErrorWhoCaresAboutTheMessage(result: ValidationResult<unknown>): asserts result is ValidationFailure {
  Assert.false(result.success);
  Assert.single(result.errors);
}
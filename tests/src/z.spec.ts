import { Assert, Fact } from "@rbxts/runit";
import z, { ValidationResult } from "@rbxts/z";

function assertSuccessValue<T>(result: ValidationResult<T>, value: T): void {
  Assert.true(result.success);
  Assert.equal(value, result.value);
}

function assertSuccessType(result: ValidationResult<any>, typeName: keyof CheckableTypes): void {
  Assert.true(result.success);
  Assert.isCheckableType(result.value, typeName);
}

function assertSingleError(result: ValidationResult<unknown>, expectedTypeName: string, expectedValueText: string): void {
  Assert.false(result.success);
  Assert.single(result.errors);
  Assert.equal(`Expected '${expectedTypeName}', got: ${expectedValueText}`, result.errors[0].message);
}

class ZTest {
  @Fact
  public object(): void {
    const guard = z.object({
      foo: z.string
    }, "Foo");

    const validResult = guard({ foo: "bar" });
    const invalidResult = guard("abc");
    const invalidResult2 = guard({});
    assertSingleError(invalidResult, "Foo", "\"abc\"");
    assertSingleError(invalidResult2, "string", "nil");
    assertSuccessType(validResult, "table");
  }

  @Fact
  public intersection(): void {
    const guard = z.intersection(
      z.object({
        a: z.string
      }, "Foo"),
      z.object({
        b: z.number
      }, "Bar")
    );

    const validResult = guard({ a: "abc", b: 69 });
    const invalidResult = guard({ a: "abc" });
    assertSuccessType(validResult, "table");
    assertSingleError(invalidResult, "Foo & Bar", "{\n   a = \"abc\"\n}");
  }

  @Fact
  public union(): void {
    const guard = z.union(z.number, z.boolean);
    const validResult = guard(69);
    const validResult2 = guard(true);
    const invalidResult = guard("abc");
    assertSuccessValue(validResult, 69);
    assertSuccessValue(validResult2, true);
    assertSingleError(invalidResult, "number | boolean", "\"abc\"");
  }

  @Fact
  public range(): void {
    const guard = z.range(0, 100);
    const validResult = guard(69);
    const invalidResult = guard(255);
    assertSuccessValue(validResult, 69);
    assertSingleError(invalidResult, "number (0-100)", "255");
  }

  @Fact
  public nan(): void {
    const NaN = 0 / 0;
    const validResult = z.nan(NaN);
    const invalidResult = z.nan(69);
    Assert.true(validResult.success);
    Assert.notEqual(validResult.value, NaN); // cause nan lol
    assertSingleError(invalidResult, "nan", "69");
  }

  @Fact
  public primitive(): void {
    const validResult = z.number(69);
    const invalidResult = z.number(true);
    assertSuccessValue(validResult, 69);
    assertSingleError(invalidResult, "number", "true");
  }
}

export = ZTest;
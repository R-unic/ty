import { Assert, Fact } from "@rbxts/runit";
import ty from "@rbxts/ty";

import { assertSingleError, assertSingleErrorWhoCaresAboutTheMessage, assertSuccessType, assertSuccessValue } from "./utility";

class TyTest {
  @Fact
  public object(): void {
    const guard = ty.object({
      foo: ty.string
    }, "Foo");

    const validResult = guard({ foo: "bar" });
    const invalidResult = guard("abc");
    const invalidResult2 = guard({});
    assertSingleError(invalidResult, "Foo", "\"abc\"");
    assertSingleError(invalidResult2, "string", "nil", "Foo.foo");
    assertSuccessType(validResult, "table");
  }

  @Fact
  public intersection(): void {
    const guard = ty.intersection(
      ty.object({
        a: ty.string
      }, "Foo"),
      ty.object({
        b: ty.number
      }, "Bar")
    );

    const validResult = guard({ a: "abc", b: 69 });
    const invalidResult = guard({ a: "abc" });
    const invalidResult2 = guard({ c: 69 });
    const invalidResult3 = guard({ a: 69, b: "abc" });
    assertSuccessType(validResult, "table");
    assertSingleError(invalidResult, "number", "nil", "Bar.b");
    Assert.false(invalidResult2.success);
    Assert.count(2, invalidResult2.errors);
    Assert.equal("Expected 'string', got: nil (Foo.a)", invalidResult2.errors[0].message);
    Assert.equal("Expected 'number', got: nil (Bar.b)", invalidResult2.errors[1].message);

    Assert.false(invalidResult3.success);
    Assert.count(2, invalidResult3.errors);
    Assert.equal("Expected 'string', got: 69 (Foo.a)", invalidResult3.errors[0].message);
    Assert.equal(`Expected 'number', got: "abc" (Bar.b)`, invalidResult3.errors[1].message);
  }

  @Fact
  public union(): void {
    const guard = ty.union(ty.number, ty.boolean);
    const validResult = guard(69);
    const validResult2 = guard(true);
    const invalidResult = guard("abc");
    assertSuccessValue(validResult, 69);
    assertSuccessValue(validResult2, true);
    assertSingleError(invalidResult, "number | boolean", "\"abc\"");
  }

  @Fact
  public instanceIsA(): void {
    const className = "BasePart";
    const guard = ty.instanceIsA(className);
    const validResult = guard(new Instance("Part"));
    const validResult2 = guard(new Instance("MeshPart"));
    const invalidResult = guard("abc");
    const invalidResult2 = guard(new Instance("ScreenGui"));
    assertSuccessType(validResult, "Instance");
    assertSuccessType(validResult2, "Instance");
    assertSingleErrorWhoCaresAboutTheMessage(invalidResult);
    assertSingleErrorWhoCaresAboutTheMessage(invalidResult2);
  }

  @Fact
  public instanceClass(): void {
    const className = "Part";
    const guard = ty.instanceIsA(className);
    const validResult = guard(new Instance("Part"));
    const invalidResult = guard("abc");
    const invalidResult2 = guard(new Instance("MeshPart"));
    assertSuccessType(validResult, "Instance");
    assertSingleErrorWhoCaresAboutTheMessage(invalidResult);
    assertSingleErrorWhoCaresAboutTheMessage(invalidResult2);
  }

  @Fact
  public range(): void {
    const guard = ty.range(0, 100);
    const validResult = guard(69);
    const invalidResult = guard(255);
    assertSuccessValue(validResult, 69);
    assertSingleError(invalidResult, "number (0-100)", "255");
  }

  @Fact
  public literal(): void {
    const abcGuard = ty.literal("abc");
    const validResult = abcGuard("abc");
    const invalidResult = abcGuard(69);
    assertSuccessValue(validResult, "abc");
    assertSingleError(invalidResult, "\"abc\"", "69");
  }

  @Fact
  public nan(): void {
    const NaN = 0 / 0;
    const validResult = ty.nan(NaN);
    const invalidResult = ty.nan(69);
    Assert.true(validResult.success);
    Assert.notEqual(validResult.value, NaN); // cause nan lol
    assertSingleError(invalidResult, "nan", "69");
  }

  @Fact
  public defined(): void {
    const validResult = ty.defined(69);
    const invalidResult = ty.defined(undefined);
    assertSuccessValue(validResult, 69);
    assertSingleError(invalidResult, "defined", "nil");
  }

  @Fact
  public primitive(): void {
    const validResult = ty.number(69);
    const invalidResult = ty.number(true);
    assertSuccessValue(validResult, 69);
    assertSingleError(invalidResult, "number", "true");
  }
}

export = TyTest;
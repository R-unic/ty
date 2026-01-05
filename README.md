# @rbxts/ty

Type validation with detailed errors.

Alternative to `@rbxts/t`.

## Basics

```ts
import ty from "@rbxts/ty";

{
  const result = ty.string("hello!");
  if (result.success)
    print(result.value) // hello!
}
{
  const result = ty.string(69);
  if (!result.success)
    print(result.errors[0].message) // Expected 'string', got: 69
}
```

## Literals

```ts
import ty from "@rbxts/ty";

const abcGuard = ty.literal("abc");
{
  const result = abcGuard("abc");
  if (result.success)
    print(result.value) // abc
}
{
  const result = abcGuard(69);
  if (!result.success)
    print(result.errors[0].message) // Expected '"abc"', got: 69
}
```

## Objects

```ts
const weaponGuard = ty.object({
  name: ty.string,
  damage: ty.number
}, "Weapon");

{
  const result = weaponGuard({
    name: "Gun",
    damage: 50
  });
  if (result.success)
    print(result.value) // { name = "Gun", damage = 50 }
}
{
  const result = weaponGuard(69);
  if (!result.success)
    print(result.value) // Expected 'Weapon', got: 69
}
{
  const result = weaponGuard({ name: "Fists" });
  if (!result.success)
    print(result.value) // Expected 'number', got: nil (Weapon.damage)
}
```

## Unions

```ts
const isStringOrNumber = ty.union(ty.string, ty.number);

{
  const result = isStringOrNumber(69);
  if (result.success)
    print(result.value) // 69
}
{
  const result = isStringOrNumber("abc");
  if (result.success)
    print(result.value) // abc
}
{
  const result = isStringOrNumber(true);
  if (!result.success)
    print(result.value) // Expected 'string | number', got: true
}
```

## Intersections

```ts
const isFooBar = ty.intersection(
  ty.object({
    a: ty.string
  }, "Foo"),
  ty.object({
    b: ty.number
  }, "Bar")
);

{
  const result = isFooBar({ a: "abc", b: 69 });
  if (result.success)
    print(result.value) // { a = "abc", b = 69 }
}
{
  const result = isFooBar({ a: "abc" });
  if (!result.success)
    print(result.value) // Expected 'number', got nil (Bar.b)
}
```

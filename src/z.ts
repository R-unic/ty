import { primitiveGuards } from "./primitives";
import { guard, success, failure, ROOT_PATH, pathJoin, guardError } from "./utility";
import type { Guard, GuardError, InferGuard } from "./types";

type IndexType = number | string;
type LiteralBase = string | number | boolean;
type ElementType<A extends any[]> = A extends (infer E)[] ? E : never;

const nan = guard(
  "nan",
  (value, path = ROOT_PATH) => {
    const primitiveResult = primitiveGuards.number(value);
    return primitiveResult.success && value !== value
      ? success(primitiveResult.value)
      : failure(path, "nan", value)
  }
);


function literal<T extends LiteralBase>(literalValue: T): Guard<T> {
  const typeName = typeIs(literalValue, "string") ? '"' + literalValue + '"' : tostring(literalValue);
  const primitiveType = typeOf(literalValue) as keyof typeof primitiveGuards;

  return guard(
    typeName,
    (value, path = ROOT_PATH) => {
      const primitiveResult = primitiveGuards[primitiveType](value, path);
      return primitiveResult.success && primitiveResult.value === literalValue
        ? success(primitiveResult.value as T)
        : failure(path, typeName, value)
    }
  );
}

function range(min: number, max: number): Guard<number> {
  const typeName = `number (${min}-${max})`;
  return guard(
    typeName,
    (value, path = ROOT_PATH) => {
      const primitiveResult = primitiveGuards.number(value, path);
      return primitiveResult.success && primitiveResult.value >= min && primitiveResult.value <= max
        ? success(primitiveResult.value)
        : failure(path, typeName, value)
    }
  );
}

function intersection<T extends Guard<any>[]>(...guards: T): Guard<UnionToIntersection<InferGuard<T[number]>>> {
  const typeName = guards.join(" & ");
  return guard(
    typeName,
    (value, path = ROOT_PATH) => {
      const results = guards.map(guard => guard(value, path))
      const errors: GuardError[] = [];
      for (const intersectionGuard of results) {
        if (intersectionGuard.success) continue;
        for (const typeError of intersectionGuard.errors)
          errors.push(typeError);
      }

      return errors.isEmpty()
        ? success(value as never)
        : failure(errors);
    }
  );
}

function union<T extends Guard<any>[]>(...guards: T): Guard<InferGuard<ElementType<T>>> {
  const typeName = guards.join(" | ");
  return guard(
    typeName,
    (value, path = ROOT_PATH) => {
      const results = guards.map(guard => guard(value, path))
      return results.every(result => !result.success)
        ? failure(path, typeName, value)
        : success(value as never);
    }
  );
}

function object<T extends Record<IndexType, Guard<any>>, Name extends string>(guardRecord: T, typeName: Name = "AnonymousObject" as never): Guard<{ [K in keyof T]: InferGuard<T[K]> }> {
  return guard(
    typeName,
    (value, path = typeName) => {
      if (path === ROOT_PATH)
        path = typeName;
      if (!typeIs(value, "table"))
        return failure(path, typeName, value);

      const errors: GuardError[] = [];
      for (const [fieldName, guard] of pairs(guardRecord)) {
        const fieldPath = pathJoin(path, fieldName as string);
        const result = (guard as Guard<T[keyof T]>)((value as T)[fieldName as keyof T], fieldPath);
        if (result.success) continue;

        for (const fieldError of result.errors)
          errors.push(fieldError);
      }

      return errors.isEmpty()
        ? success(value as never)
        : failure(errors);
    }
  );
}

const z = {
  ...primitiveGuards,
  nan,
  range,
  literal,
  intersection,
  union,
  object
};
table.freeze(z);

export = z;
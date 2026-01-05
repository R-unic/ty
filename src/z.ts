import { primitiveGuards } from "./primitives";
import { guard, success, failure, ROOT_PATH, pathJoin } from "./utility";
import type { Guard, InferGuard } from "./types";

type IndexType = number | string;
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

function range(min: number, max: number): Guard<number> {
  const typeName = `number (${min}-${max})`;
  return guard(
    typeName,
    (value, path = ROOT_PATH) => {
      const primitiveResult = primitiveGuards.number(value);
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
      const results = guards.map(guard => guard(value))
      return results.some(result => !result.success)
        ? failure(path, typeName, value)
        : success(value as never);
    }
  );
}

function union<T extends Guard<any>[]>(...guards: T): Guard<InferGuard<ElementType<T>>> {
  const typeName = guards.join(" | ");
  return guard(
    typeName,
    (value, path = ROOT_PATH) => {
      const results = guards.map(guard => guard(value))
      return results.every(result => !result.success)
        ? failure(path, typeName, value)
        : success(value as never);
    }
  );
}

function object<T extends Record<IndexType, Guard<any>>, Name extends string>(guardRecord: T, typeName: Name = "AnonymousObject" as never): Guard<{ [K in keyof T]: InferGuard<T[K]> }> {
  return guard(
    typeName,
    (value, path = pathJoin(ROOT_PATH, typeName)) => {
      if (!typeIs(value, "table"))
        return failure(path, typeName, value);

      for (const [fieldName, guard] of pairs(guardRecord)) {
        const result = (guard as Guard<T[keyof T]>)((value as T)[fieldName as keyof T]);
        if (result.success) continue;

        const fieldPath = pathJoin(path, fieldName as string);
        return failure(fieldPath, result.errors[0].expected, result.errors[0].actual, result.errors[0].message);
      }

      return success(value as never);
    }
  );
}

const z = {
  ...primitiveGuards,
  nan,
  range,
  intersection,
  union,
  object
};
table.freeze(z);

export = z;
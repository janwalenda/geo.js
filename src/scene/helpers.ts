/**
 * A copy of `options` without the keys whose value is `undefined`, so that
 * spreading it over defaults keeps the defaults for those keys.
 */
export function definedOnly<T extends object>(options: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(options).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

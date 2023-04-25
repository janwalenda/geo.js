import { WritableKeysOf } from "./WritableKeysOf";

export type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

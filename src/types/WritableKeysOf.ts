import { IfEquals } from "./";

export type WritableKeysOf<T> = {
    [P in keyof T]: IfEquals<{
        [Q in P]: T[P];
    }, {
            -readonly [Q in P]: T[P];
        }, P, never>;
}[keyof T];

// Fix: @types/express v5 changed ParamsDictionary to `[key: string]: string | string[]`.
// Express route params are always plain strings at runtime. This augmentation
// restores the v4-compatible signature to eliminate TS2345 errors across all controllers.
//
// This file must contain an `export {}` to be treated as a module, which is
// required for `declare module` augmentations to work correctly.
export {};

declare module 'express-serve-static-core' {
    interface ParamsDictionary {
        [key: string]: string;
    }
}

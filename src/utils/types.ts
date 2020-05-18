/**
 * Type utlities.
 */

export type Nullable<T> = T | null

export const isNonNull = <T>(obj: T | null | undefined): obj is T => obj != null

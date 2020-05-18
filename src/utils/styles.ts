/**
 * Style utilites.
 */

import { isNonNull } from 'utils/types'

/**
 * Join list of class names. Allowed type of false allow classNames(..., condition && 'className').
 */
export const classNames = (
  ...classNames: (string | undefined | null | false)[]
) =>
  classNames
    .filter((name) => name !== false && isNonNull<string>(name))
    .join(' ')

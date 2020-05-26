/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Various utilities that don't fit in a standalone lib

import { Hash } from './types';

// Recursively merge an object
export function deepMerge(
  target: Hash<any>,
  ...sources: Hash<any>[]
): Hash<any> {
  if (!sources.length) {
    return target;
  }

  const source = sources.shift();

  for (const key in source) {
    if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) {
        Object.assign(target, { [key]: {} });
      }

      deepMerge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }

  return deepMerge(target, ...sources);
}

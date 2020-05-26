/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { deepMerge } from './utilities';

describe('deepMerge', () => {
  it('recursively merges multiple objects', () => {
    const objectOne = {
      value1: 'a',
      // replaced in objectTwo
      value2: 'b',
    };
    const objectTwo = {
      // replaces value in objectOne
      value2: 'c',
      value3: {
        nested1: {
          // replaced in objectThree
          nested2: 'd',
        },
      },
    };
    const objectThree = {
      value3: {
        nested1: {
          // replaces value in objectTwo
          nested2: 'f',
        },
        // added to value in objectTwo
        nested3: 'g',
      },
      value4: 'h',
    };

    const mergedObject = deepMerge(objectOne, objectTwo, objectThree);

    expect(mergedObject).toStrictEqual({
      value1: 'a',
      value2: 'c',
      value3: {
        nested1: {
          nested2: 'f',
        },
        nested3: 'g',
      },
      value4: 'h',
    });
  });
});

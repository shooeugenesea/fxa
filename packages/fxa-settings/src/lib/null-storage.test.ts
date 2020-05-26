/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import NullStorage from './null-storage';

let storage: NullStorage;

beforeEach(function () {
  storage = new NullStorage();
});

describe('get/set', function () {
  it('can take a key value pair', function () {
    storage.setItem('key', 'value');
    expect(storage.getItem('key')).toStrictEqual('value');
  });

  it('can take object values', function () {
    storage.setItem('key', { foo: 'bar' });
    expect(storage.getItem('key').foo).toStrictEqual('bar');
  });
});

describe('remove', function () {
  it('with a key clears item', function () {
    storage.setItem('key', 'value');
    storage.removeItem('key');

    expect(storage.getItem('key')).toBeUndefined();
  });
});

describe('clear', function () {
  it('clears all items', function () {
    storage.setItem('key', 'value');
    storage.clear();

    expect(storage.getItem('key')).toBeUndefined();
  });
});

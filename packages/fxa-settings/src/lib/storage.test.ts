/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import NullStorage from './null-storage';
import Storage, { StorageError } from './storage';

let storage: Storage;
let nullStorage: NullStorage;

beforeEach(function () {
  nullStorage = new NullStorage();
  storage = new Storage(nullStorage);
});

afterEach(function () {
  storage.clear();
});

function generateAccessDenied() {
  var lsError = new Error('access denied');
  lsError.name = 'NS_ERROR_FILE_ACCESS_DENIED';

  throw lsError;
}

describe('get/set', function () {
  it('can take a key value pair', function () {
    storage.set('key', 'value');
    expect(storage.get('key')).toStrictEqual('value');
  });

  it('can take object values', function () {
    storage.set('key', { foo: 'bar' });
    expect(storage.get('key').foo).toStrictEqual('bar');
  });

  it('can take null values', function () {
    storage.set('key', null);
    expect(storage.get('key')).toBeNull();
  });

  it('can take falsey values', function () {
    storage.set('key', '');
    expect(storage.get('key')).toStrictEqual('');
  });

  it('returns undefined if the backend/parsing fails', function () {
    storage.set('key', 'value');
    jest.spyOn(nullStorage, 'getItem').mockReturnValue('not stringified JSON');
    expect(storage.get('key')).toBeUndefined();
    expect(nullStorage.getItem).toHaveBeenCalled();
  });
});

describe('remove', function () {
  it('with a key clears item', function () {
    storage.set('key', 'value');
    storage.remove('key');

    expect(storage.get('key')).toBeUndefined();
  });
});

describe('clear', function () {
  it('clears all items', function () {
    storage.set('key', 'value');
    storage.clear();

    expect(storage.get('key')).toBeUndefined();
  });
});

describe('testLocalStorage', function () {
  describe('if localStorage cannot be accessed', function () {
    let err: StorageError;

    beforeEach(function () {
      jest
        .spyOn(window.localStorage.__proto__, 'setItem')
        .mockImplementationOnce(generateAccessDenied);

      try {
        Storage.testLocalStorage(globalThis.window);
      } catch (e) {
        err = e;
      }
    });

    it('throws a normalized error', function () {
      expect(err.context).toStrictEqual('storage');
      expect(err.errno).toStrictEqual('NS_ERROR_FILE_ACCESS_DENIED');
      expect(err.namespace).toStrictEqual('localStorage');
    });
  });

  describe('if localStorage access is allowed', function () {
    it('succeeds', function () {
      Storage.testLocalStorage(globalThis.window);
    });
  });
});

describe('testSessionStorage', function () {
  describe('if sessionStorage cannot be accessed', function () {
    let err: StorageError;

    beforeEach(function () {
      jest
        .spyOn(window.localStorage.__proto__, 'setItem')
        .mockImplementationOnce(generateAccessDenied);

      try {
        Storage.testSessionStorage(globalThis.window);
      } catch (e) {
        err = e;
      }
    });

    it('throws a normalized error', function () {
      expect(err.context).toStrictEqual('storage');
      expect(err.errno).toStrictEqual('NS_ERROR_FILE_ACCESS_DENIED');
      expect(err.namespace).toStrictEqual('sessionStorage');
    });
  });

  describe('if sessionStorage access is allowed', function () {
    it('succeeds', function () {
      Storage.testSessionStorage(globalThis.window);
    });
  });
});

describe('factory', function () {
  it('creates localStorage instance', function () {
    jest.spyOn(window.localStorage.__proto__, 'setItem');

    var store = Storage.factory('localStorage', globalThis.window);
    store.set('foo', 'bar');
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });

  it('creates sessionStorage instance', function () {
    jest.spyOn(window.localStorage.__proto__, 'setItem');

    var store = Storage.factory('sessionStorage', globalThis.window);
    store.set('foo', 'bar');
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });

  it('creates null storage instance otherwise', function () {
    var store = Storage.factory(null, globalThis.window);
    store.set('foo', 'bar');

    expect(store.get('foo')).toStrictEqual('bar');
  });
});

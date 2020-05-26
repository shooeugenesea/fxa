/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  searchParam,
  searchParams,
  hashParams,
  objToSearchString,
  objToHashString,
  objToUrlString,
  getOrigin,
  updateSearchString,
  cleanSearchString,
} from './url';

describe('searchParam', () => {
  it('returns a parameter from window.location.search, if it exists', () => {
    expect(searchParam('color', '?color=green')).toStrictEqual('green');
  });

  it('returns empty if parameter is empty', () => {
    expect(searchParam('color', '?color=')).toStrictEqual('');
  });

  it('returns empty if parameter is a space', () => {
    expect(searchParam('color', '?color= ')).toStrictEqual('');
  });

  it('returns undefined if parameter does not exist', () => {
    expect(searchParam('animal', '?color=green')).toBeUndefined();
  });
});

describe('searchParams', () => {
  const search = `?color=green&email=${encodeURIComponent(
    'testuser@testuser.com'
  )}#color=brown&email=${encodeURIComponent('hash@testuser.com')}`;

  it('converts search string to an object, returns all key/value pairs if no allowlist specified', () => {
    const params = searchParams(search);
    expect(params.color).toStrictEqual('green');
    expect(params.email).toStrictEqual('testuser@testuser.com');
  });

  it('returns only items in allow list of one is specified', () => {
    const params = searchParams(search, ['color', 'notDefined']);
    expect(params.color).toStrictEqual('green');
    expect('email' in params).toBeFalsy();
    expect('notDefined' in params).toBeFalsy();
  });

  it('returns an empty object if no query params', () => {
    let params = searchParams('');
    expect(Object.keys(params)).toHaveLength(0);

    params = searchParams('', ['blue']);
    expect(Object.keys(params)).toHaveLength(0);
  });
});

describe('hashParams', () => {
  const search = `?color=green&email=${encodeURIComponent(
    'testuser@testuser.com'
  )}#color=brown&email=${encodeURIComponent('hash@testuser.com')}`;

  it('converts hash string to an object, returns all key/value pairs if no allowlist specified', () => {
    const params = hashParams(search);
    expect(params.color).toStrictEqual('brown');
    expect(params.email).toStrictEqual('hash@testuser.com');
  });

  it('returns only items in allow list of one is specified', () => {
    const params = hashParams(search, ['color', 'notDefined']);
    expect(params.color).toStrictEqual('brown');
    expect('email' in params).toBeFalsy();
    expect('notDefined' in params).toBeFalsy();
  });

  it('returns an empty object if no hash params', () => {
    let params = hashParams('');
    expect(Object.keys(params)).toHaveLength(0);

    params = hashParams('', ['blue']);
    expect(Object.keys(params)).toHaveLength(0);
  });
});

describe('objToSearchString', () => {
  it('includes all keys with values', () => {
    var params = {
      hasValue: 'value',
      nullNotIncluded: null,
      undefinedNotIncluded: undefined,
    };

    expect(objToSearchString(params)).toStrictEqual('?hasValue=value');
  });

  it('returns an empty string if no parameters are passed in', () => {
    expect(objToSearchString({})).toStrictEqual('');
  });
});

describe('objToHashString', () => {
  it('includes all keys with values', () => {
    var params = {
      hasValue: 'value',
      nullNotIncluded: null,
      undefinedNotIncluded: undefined,
    };

    expect(objToHashString(params)).toStrictEqual('#hasValue=value');
  });

  it('returns an empty string if no parameters are passed in', () => {
    expect(objToHashString({})).toStrictEqual('');
  });
});

describe('objToUrlString', () => {
  it('includes all keys with values', () => {
    var params = {
      hasValue: 'value',
      nullNotIncluded: null,
      undefinedNotIncluded: undefined,
    };

    expect(objToUrlString(params, '#')).toStrictEqual('#hasValue=value');
  });

  it('returns an empty string if no parameters are passed in', () => {
    expect(objToUrlString({})).toStrictEqual('');
  });
});

describe('getOrigin', () => {
  it('returns the origin portion of the URL', () => {
    expect(
      getOrigin('https://marketplace.firefox.com/redirect/to_this_page')
    ).toStrictEqual('https://marketplace.firefox.com');
  });

  it('works with non-standard ports', () => {
    expect(getOrigin('http://testdomain.org:8443/strips/this')).toStrictEqual(
      'http://testdomain.org:8443'
    );
  });

  it('returns correct origin if query directly follows hostname', () => {
    expect(getOrigin('http://testdomain.org?query')).toStrictEqual(
      'http://testdomain.org'
    );
  });

  it('returns correct origin if query directly follows port', () => {
    expect(getOrigin('http://testdomain.org:8443?query')).toStrictEqual(
      'http://testdomain.org:8443'
    );
  });

  it('returns correct origin if hash directly follows hostname', () => {
    expect(getOrigin('http://testdomain.org#hash')).toStrictEqual(
      'http://testdomain.org'
    );
  });

  it('returns correct origin if hash directly follows port', () => {
    expect(getOrigin('http://testdomain.org:8443#hash')).toStrictEqual(
      'http://testdomain.org:8443'
    );
  });

  it('returns `null` if scheme is missing', () => {
    expect(getOrigin('testdomain.org')).toBeNull();
  });

  it('returns `null` if scheme is missing and port specified', () => {
    expect(getOrigin('testdomain.org:8443')).toBeNull();
  });

  it('returns `null` if hostname is missing', () => {
    expect(getOrigin('http://')).toBeNull();
  });
});

describe('updateSearchString', () => {
  it('adds new params while leaving the old ones intact', () => {
    var updated = updateSearchString('?foo=one', {
      bar: 'two',
      baz: 'three',
    });
    expect(updated).toStrictEqual('?foo=one&bar=two&baz=three');
  });

  it('updates values for existing params', () => {
    var updated = updateSearchString('?foo=one', {
      foo: 'two',
    });
    expect(updated).toStrictEqual('?foo=two');
  });

  it('adds a search string if none exists', () => {
    var updated = updateSearchString('http://example.com', {
      bar: 'two',
      foo: 'one',
    });
    expect(updated).toStrictEqual('http://example.com?bar=two&foo=one');
  });
});

describe('cleanSearchString', () => {
  it('works correctly if no search params are passed', () => {
    const cleanedSearchString = cleanSearchString(
      'https://accounts.firefox.com/'
    );

    expect(cleanedSearchString).toStrictEqual('https://accounts.firefox.com/');
  });

  it('removes any undeclared search parameters', () => {
    const cleanedSearchString = cleanSearchString(
      'https://accounts.firefox.com/?allowed=true&notAllowed=false',
      ['allowed']
    );

    expect(cleanedSearchString).toStrictEqual(
      'https://accounts.firefox.com/?allowed=true'
    );
  });
});

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// A set of utilities to deal with URLs

/**
 * Convert a search string to its object representation, one entry
 * per query parameter. Assumes the string is a search string and
 * not a full URL without a search string.
 */
export function searchParams(str = '', allowedFields?: string[]) {
  // ditch everything before the ? and from # to the end
  const search = str.replace(/(^.*\?|#.*$)/g, '').trim();
  if (!search) {
    return {};
  }

  return splitEncodedParams(search, allowedFields!);
}

/**
 * Return the value of a single query parameter in the string
 */
export function searchParam(name: string, str?: string): string {
  return searchParams(str)[name];
}

/**
 * Convert a hash string to its object representation, one entry
 * per query parameter
 */
export function hashParams(str = '', allowedFields?: string[]) {
  // ditch everything before the #
  const hash = str.replace(/^.*#/, '').trim();
  if (!hash) {
    return {};
  }

  return splitEncodedParams(hash, allowedFields);
}

/**
 * Convert a URI encoded string to its object representation.
 *
 * `&` is the expected delimiter between parameters.
 * `=` is the delimiter between a key and a value.
 */
export function splitEncodedParams(str = '', allowedFields?: string[]) {
  const pairs = str.split('&');
  const terms: { [key: string]: string } = {};

  pairs.forEach((pair) => {
    const [key, value] = pair.split('=');
    terms[key] = decodeURIComponent(value).trim();
  });

  if (!allowedFields) {
    return terms;
  }

  return Object.keys(terms)
    .filter((key) => allowedFields.indexOf(key) >= 0)
    .reduce((newObj, key) => Object.assign(newObj, { [key]: terms[key] }), {});
}

/**
 * Convert an object to a search string.
 */
export function objToSearchString(obj: {}) {
  return objToUrlString(obj, '?');
}

/**
 * Convert an object to a hash string.
 */
export function objToHashString(obj: {}) {
  return objToUrlString(obj, '#');
}

/**
 * Convert an object to a URL safe string
 */
export function objToUrlString(obj: { [key: string]: any } = {}, prefix = '?') {
  const params: string[] = [];

  for (const paramName in obj) {
    if (paramName) {
      const paramValue = obj[paramName];
      if (paramValue != null && paramValue.length) {
        params.push(paramName + '=' + encodeURIComponent(paramValue));
      }
    }
  }

  if (!params.length) {
    return '';
  }

  return prefix + params.join('&');
}

/**
 * Get the origin portion of the URL
 */
export function getOrigin(url: string): string | null {
  if (!url) {
    return '';
  }

  // The URL API is only supported by new browsers, a workaround is used.
  const anchor = document.createElement('a');

  // Fx 18 (& FxOS 1.*) do not support anchor.origin. Build the origin
  // out of the protocol and host.
  // Use setAttribute instead of a direct set or else Fx18 does not
  // update anchor.protocol & anchor.host.
  anchor.setAttribute('href', url);

  if (!(anchor.protocol && anchor.host)) {
    // malformed URL. Return null. This is the same behavior as URL.origin
    return null;
  }

  // IE10 always returns port, Firefox and Chrome hide the port if it is the default port e.g 443, 80
  // We normalize IE10 output, use the hostname if it is a default port to match Firefox and Chrome.
  // Also IE10 returns anchor.port as String, Firefox and Chrome use Number.
  const host =
    Number(anchor.port) === 443 || Number(anchor.port) === 80
      ? anchor.hostname
      : anchor.host;
  const origin = anchor.protocol + '//' + host;

  // if only the domain is specified without a protocol, the anchor
  // will use the page's origin as the URL's origin. Check that
  // the created origin matches the first portion of
  // the passed in URL. If not, then the anchor element
  // modified the origin.
  if (url.indexOf(origin) !== 0) {
    return null;
  }

  return origin;
}

/**
 * Update the search string in the given URL.
 */
export function updateSearchString(uri: string, newParams: {}): string {
  let params = {};
  const startOfParams = uri.indexOf('?');
  if (startOfParams >= 0) {
    params = searchParams(uri.substring(startOfParams + 1));
    uri = uri.substring(0, startOfParams);
  }
  params = Object.assign(params, newParams);
  return uri + objToSearchString(params);
}

/**
 * Clean the search string by only allowing search parameters declared in
 * `allowedFields`
 */
export function cleanSearchString(uri: string, allowedFields?: string[]) {
  const [base, search = ''] = uri.split('?');
  const cleanedQueryParams = searchParams(search, allowedFields);
  return base + objToSearchString(cleanedQueryParams);
}

/**
 * Set a new value for the query search string in place. This does
 * not reload the page but rather updates the window state history.
 */
export function setSearchString(param: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(param, value);

  // This will update the url with new params inplace
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

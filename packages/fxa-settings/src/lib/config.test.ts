/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import config, {
  getDefault,
  readConfigMeta,
  decode,
  reset,
  update,
} from './config';

beforeEach(reset);

describe('readConfigMeta', () => {
  it('throws an error when the meta tag element cannot be found', () => {
    expect(() =>
      readConfigMeta(() => {
        return null;
      })
    ).toThrowError('<meta name="fxa-config"> is missing');
  });

  it('throws an error when the content of the meta tag is not decodable', () => {
    expect(() =>
      readConfigMeta(() => {
        return {
          getAttribute() {
            return null;
          },
        };
      })
    ).toThrowError();
  });

  it('merges the returned meta tag content value with the config', () => {
    const data = {
      widow: 'marches',
    };

    readConfigMeta(() => {
      return {
        getAttribute() {
          return encodeURIComponent(JSON.stringify(data));
        },
      };
    });

    expect((config as any).widow).toBeDefined();
    expect((config as any).widow).toStrictEqual(data.widow);
  });
});

describe('decode', () => {
  it('converts a JSON-stringified, URI-encoded string to a proper object', () => {
    const data = {
      decimated: 'dreams',
    };

    const encodedData = encodeURIComponent(JSON.stringify(data));
    const decodedData = decode(encodedData);

    expect(decodedData).toStrictEqual(data);
  });

  describe('development', () => {
    beforeAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'development' });
      jest.spyOn(global.console, 'warn').mockReturnValue();
    });

    it('warns when server config is missing', () => {
      decode(null);
      expect(global.console.warn).toHaveBeenCalledWith(
        'fxa-settings is missing server config'
      );
    });

    it('warns when an invalid server config is supplied', () => {
      decode('thou shalt not decode');
      expect(global.console.warn).toHaveBeenCalledWith(
        'fxa-settings server config is invalid'
      );
    });
  });

  describe('production', () => {
    beforeAll(() => {
      Object.defineProperty(process.env, 'NODE_ENV', { value: 'production' });
    });

    it('warns when server config is missing', () => {
      expect(() => decode(null)).toThrowError('Configuration is empty');
    });

    it('warns when an invalid server config is supplied', () => {
      const decodingValue = 'not gonna happen';
      expect(() => decode(decodingValue)).toThrowError(
        `Invalid configuration \"${decodingValue}\": ${decodingValue}`
      );
    });
  });
});

describe('update', () => {
  it('recursively updates the config', () => {
    expect(config.sentry.url).toBeDefined();
    const oldSentryUrl = config.sentry.url;

    const newData = {
      sentry: {
        url: 'http://sentry-rulez.net',
      },
    };
    update(newData);

    expect(config.sentry.url).not.toStrictEqual(oldSentryUrl);
    expect(config.sentry.url).toStrictEqual(newData.sentry.url);
  });

  it('can add new items', () => {
    expect(config.version).toBeUndefined();

    const newData = {
      version: '0.1.0',
    };
    update(newData);

    expect(config.version).toBeDefined();
    expect(config.version).toStrictEqual(newData.version);
  });
});

describe('reset', () => {
  it('resets to the default config values', () => {
    const initialConfig = getDefault();
    expect(config).toStrictEqual(initialConfig);

    const newSentryUrl = 'http://sentry-rulez.net';
    update({ sentry: { url: newSentryUrl } });
    expect(config.sentry.url).toStrictEqual(newSentryUrl);

    reset();
    expect(config.sentry.url).not.toStrictEqual(newSentryUrl);
    expect(config).toStrictEqual(initialConfig);
  });

  it('removes any keys that are not in the default config', () => {
    expect(config.version).toBeUndefined();

    const newData = {
      version: '0.1.0',
    };
    update(newData);
    expect(config.version).toBeDefined();

    reset();
    expect(config.version).toBeUndefined();
  });
});

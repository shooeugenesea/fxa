/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import convict from 'convict';
import fs from 'fs';
import path from 'path';

export interface MySQLConfig {
  database: string;
  host: string;
  password: string;
  port: number;
  user: string;
}

export interface RedisConfig {
  host: string;
  keyPrefix: string;
  port: number;
}

function makeMySQLConfig(envPrefix: string, database: string) {
  return {
    database: {
      default: database,
      doc: 'MySQL database',
      env: envPrefix + '_MYSQL_DATABASE',
      format: String,
    },
    host: {
      default: 'localhost',
      doc: 'MySQL host',
      env: envPrefix + '_MYSQL_HOST',
      format: String,
    },
    password: {
      default: '',
      doc: 'MySQL password',
      env: '_MYSQL_PASSWORD',
      format: String,
    },
    port: {
      default: 3306,
      doc: 'MySQL port',
      env: '_MYSQL_PORT',
      format: Number,
    },
    user: {
      default: 'root',
      doc: 'MySQL username',
      env: '_MYSQL_USERNAME',
      format: String,
    },
  };
}

function makeRedisConfig(envPrefix: string, prefix: string) {
  return {
    host: {
      default: 'localhost',
      env: envPrefix + '_REDIS_HOST',
      format: String,
      doc: 'Url for redis host',
    },
    keyPrefix: {
      default: prefix,
      env: envPrefix + '_REDIS_KEY_PREFIX',
      format: String,
      doc: 'Redis key prefix to use',
    },
    port: {
      default: 6379,
      env: envPrefix + '_REDIS_PORT',
      format: 'port',
      doc: 'Port for redis server',
    },
  };
}

const conf = convict({
  authHeader: {
    default: 'authorization',
    doc: 'Authentication header that should be logged for the user',
    env: 'AUTH_HEADER',
    format: String,
  },
  authServer: {
    url: {
      doc: 'URL of fxa-auth-server',
      env: 'AUTH_SERVER_URL',
      default: 'http://localhost:9000/v1',
    },
  },
  database: {
    mysql: {
      auth: makeMySQLConfig('AUTH', 'fxa'),
      profile: makeMySQLConfig('PROFILE', 'fxa_profile'),
    },
    redis: {},
  },
  env: {
    default: 'production',
    doc: 'The current node.js environment',
    env: 'NODE_ENV',
    format: ['development', 'test', 'stage', 'production'],
  },
  logging: {
    app: { default: 'fxa-graphql-api-server' },
    fmt: {
      default: 'heka',
      env: 'LOGGING_FORMAT',
      format: ['heka', 'pretty'],
    },
    level: {
      default: 'info',
      env: 'LOG_LEVEL',
    },
    routes: {
      enabled: {
        default: true,
        doc: 'Enable route logging. Set to false to trimming CI logs.',
        env: 'ENABLE_ROUTE_LOGGING',
      },
      format: {
        default: 'default_fxa',
        format: ['default_fxa', 'dev_fxa', 'default', 'dev', 'short', 'tiny'],
      },
    },
  },
  image: {
    maxSize: {
      doc: 'Maximum bytes allow for uploads',
      default: 1024 * 1024 * 1, // 1MB
      env: 'IMG_UPLOADS_DEST_MAX_SIZE',
    },
    types: {
      doc: 'A mapping of allowed mime types and their file signatures',
      format: Object,
      default: {
        // see https://en.wikipedia.org/wiki/List_of_file_signatures
        'image/jpeg': [
          [0xff, 0xd8, 0xff, 0xdb],
          [0xff, 0xd8, 0xff, 0xe0],
          [0xff, 0xd8, 0xff, 0xe1],
        ],
        'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
      },
    },
  },
  oauth: {
    clientId: {
      default: '98e6508e88680e1a',
      doc: 'OAuth client id to identify with to the profile-server',
      env: 'OAUTH_CLIENT_ID',
      format: String,
    },
  },
  profileServer: {
    url: {
      doc: 'URL of fxa-aprofile-server',
      env: 'PROFILE_SERVER_URL',
      default: 'http://localhost:1111/v1',
    },
  },
  redis: {
    accessTokens: {
      host: {
        default: 'localhost',
        env: 'ACCESS_TOKEN_REDIS_HOST',
        format: String,
      },
      port: {
        default: 6379,
        env: 'ACCESS_TOKEN_REDIS_PORT',
        format: 'port',
      },
      prefix: {
        default: 'at:',
        env: 'ACCESS_TOKEN_REDIS_KEY_PREFIX',
        format: String,
        doc: 'Key prefix for access tokens in Redis',
      },
    },
  },
  sentryDsn: {
    default: '',
    doc: 'Sentry DSN for error and log reporting',
    env: 'SENTRY_DSN',
    format: 'String',
  },
});

// handle configuration files.  you can specify a CSV list of configuration
// files to process, which will be overlayed in order, in the CONFIG_FILES
// environment variable.

// Need to move two dirs up as we're in the compiled directory now
const configDir = path.dirname(path.dirname(__dirname));
let envConfig = path.join(configDir, 'config', `${conf.get('env')}.json`);
envConfig = `${envConfig},${process.env.CONFIG_FILES || ''}`;
const files = envConfig.split(',').filter(fs.existsSync);
conf.loadFile(files);
conf.validate({ allowed: 'strict' });
const Config = conf;

export type AppConfig = typeof Config;
export default Config;

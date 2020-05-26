/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import 'reflect-metadata';
import { Container } from 'typedi';

import express from 'express';
import mozlog from 'mozlog';
import FxAccountClient from 'fxa-js-client';
import { graphqlUploadExpress } from 'graphql-upload';

import { configContainerToken, loggerContainerToken, fxAccountClientToken } from '../lib/constants';
import { setupAuthDatabase, setupProfileDatabase } from '../lib/db';
import Config from '../config';

const config = Config.getProperties();

const logger = mozlog(config.logging)('graphql-api');
Container.set(loggerContainerToken, logger);

import { dbHealthCheck } from '../lib/db';
import { loadBalancerRoutes } from '../lib/middleware';
import { configureSentry } from '../lib/sentry';
import { createServer } from '../lib/server';
import { version } from '../lib/version';

configureSentry({ dsn: config.sentryDsn, release: version.version });

async function run() {
  Container.set(configContainerToken, Config);

  // Setup the auth client
  Container.set(fxAccountClientToken, FxAccountClient(config.authServer.url, {}));

  // Setup the databases
  const authKnex = setupAuthDatabase(config.database.mysql.auth);
  const profileKnex = setupProfileDatabase(config.database.mysql.profile);
  if (config.env === 'development') {
    authKnex.on('query', data => {
      logger.info('Query', data);
    });
    profileKnex.on('query', data => {
      logger.info('Query', data);
    });
  }

  const app = express();
  app.use(graphqlUploadExpress({ maxFileSize: 10000000 }));
  const server = await createServer(config, logger);
  server.applyMiddleware({ app });

  app.use(loadBalancerRoutes(dbHealthCheck));
  app.listen({ port: 8290 }, () => {
    logger.info('startup', {
      message: `Server is running, GraphQL Playground available at http://localhost:8290${server.graphqlPath}`,
    });
  });
}

run().catch(err => {
  logger.error('startup', { err });
});

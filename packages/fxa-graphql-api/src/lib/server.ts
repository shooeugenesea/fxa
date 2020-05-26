/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Container } from 'typedi';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import { Request } from 'express';
import { Logger } from 'mozlog';
import * as TypeGraphQL from 'type-graphql';

import { AccountResolver } from './resolvers/account-resolver';
import { reportGraphQLError } from './sentry';
import { SessionTokenAuth } from './auth';
import { AuthServerSource } from './datasources/authServer';
import { ProfileServerSource } from './datasources/profileServer';
import { GraphQLError } from 'graphql';

type ServerConfig = {
  authHeader: string;
  env: string;
};

function formatError(debug: boolean, logger: Logger, err: GraphQLError) {
  if (debug) {
    return err;
  }

  if (err.name === 'ValidationError') {
    return new Error('Request error');
  }

  const graphPath = err.path?.join('.');

  logger.error('graphql', { path: graphPath, error: err.originalError?.message });

  reportGraphQLError(err);
  return new Error('Internal server error');
}

/**
 * Context available to resolvers
 */
export type Context = {
  authUser: string;
  token: string;
  dataSources: DataSources;
  logger: Logger;
};

export type DataSources = {
  authAPI: AuthServerSource;
  profileAPI: ProfileServerSource;
};

export async function createServer(
  config: ServerConfig,
  logger: Logger,
  context?: () => object
): Promise<ApolloServer> {
  const schema = await TypeGraphQL.buildSchema({
    container: Container,
    resolvers: [AccountResolver],
    validate: false,
  });
  const authHeader = config.authHeader.toLowerCase();
  const authUser = Container.get(SessionTokenAuth);
  const debugMode = config.env !== 'production';
  const defaultContext = async ({ req }: { req: Request }) => {
    const bearerToken = req.headers[authHeader];
    if (typeof bearerToken !== 'string') {
      throw new AuthenticationError('Invalid authentcation header found at: ' + authHeader);
    }
    const userId = await authUser.lookupUserId(bearerToken);
    return {
      authUser: userId,
      token: bearerToken,
      logger,
    };
  };

  return new ApolloServer({
    context: context ?? defaultContext,
    dataSources: () => ({
      authAPI: new AuthServerSource(),
      profileAPI: new ProfileServerSource(),
    }),
    formatError: err => formatError(debugMode, logger, err),
    schema,
    uploads: false,
    debug: ['production', 'test'].includes(config.env),
    logger: {
      debug: msg => logger.debug(msg, {}),
      error: msg => logger.error(msg, {}),
      info: msg => logger.info(msg, {}),
      warn: msg => logger.warn(msg, {}),
    },
  });
}

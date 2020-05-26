/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import { render } from 'react-dom';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
import App from './components/App';
import sentryMetrics from 'fxa-shared/lib/sentry';
import config, { readConfigMeta } from './lib/config';
import { searchParams } from './lib/url';
import Storage from './lib/storage';
import './index.scss';

const storage = Storage.factory('localStorage');

function getSessionToken(): string {
  const storedAccounts = storage.get('accounts');
  const currentAccountUid = storage.get('currentAccountUid');
  return storedAccounts[currentAccountUid].sessionToken;
}

try {
  sentryMetrics.configure(config.sentry.dsn, config.version);
  readConfigMeta((name: string) => {
    return document.head.querySelector(name);
  });

  if (!config.servers.gql.url) {
    throw new Error('GraphQL API URL not set');
  }

  const apolloClient = new ApolloClient({
    cache: new InMemoryCache(),
    uri: `${config.servers.gql.url}/graphql`,
    headers: {
      authorization: getSessionToken(),
    },
  });
  const queryParams = searchParams(window.location.search);

  render(
    <React.StrictMode>
      <ApolloProvider client={apolloClient}>
        <App {...{ queryParams }} />
      </ApolloProvider>
    </React.StrictMode>,
    document.getElementById('root')
  );
} catch (error) {
  console.log('Error initializing FXA Settings', error);
}

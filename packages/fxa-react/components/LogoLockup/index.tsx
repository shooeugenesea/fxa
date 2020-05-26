/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React, { ReactElement } from 'react';
import { ReactComponent as Logo } from '../../images/ff-logo.svg';

type LogoLockupProps = {
  children: string | ReactElement;
};

export const LogoLockup = ({ children }: LogoLockupProps) => (
  <>
    <Logo className="h-auto w-10 mr-4" role="img" aria-label="Firefox logo" />
    <h1 className="hidden tablet:inline-flex self-center text-xl">
      {children}
    </h1>
  </>
);

export default LogoLockup;

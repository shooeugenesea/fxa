/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import React from 'react';
import LogoLockup from '@fxa-react/components/LogoLockup';
import Header from '@fxa-react/components/Header';
import LinkExternal from '@fxa-react/components/LinkExternal';
import { ReactComponent as Help } from '../../images/help.svg';
import { ReactComponent as Bento } from '../../images/bento.svg';
import { ReactComponent as DefaultAvatar } from '../../images/avatar-default.svg';
import { ReactComponent as Menu } from '../../images/menu.svg';

const leftHeaderContent = (
  <>
    <button className="desktop:hidden mr-6 w-8 h-6 self-center">
      <Menu />
    </button>
    <a href="#" title="Back to top" className="flex">
      <LogoLockup>
        <>
          <span className="font-bold mr-2">Firefox</span> account
        </>
      </LogoLockup>
    </a>
  </>
);

const rightHeaderContent = (
  <>
    <LinkExternal
      href="https://support.mozilla.org"
      title="Help"
      className="self-center"
    >
      <Help aria-label="Help" title="Help" role="img" className="w-6" />
    </LinkExternal>
    <Bento
      aria-label="Firefox Account Menu"
      role="img"
      className="w-6 mx-6 desktop:mx-8"
    />
    <DefaultAvatar aria-label="Default avatar" role="img" className="w-10" />
  </>
);

const HeaderLockup = () => (
  <Header left={leftHeaderContent} right={rightHeaderContent} />
);

export default HeaderLockup;

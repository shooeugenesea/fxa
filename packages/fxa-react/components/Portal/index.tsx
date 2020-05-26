import React, { memo, useEffect } from 'react';
import { createPortal } from 'react-dom';

import './index.scss';

type PortalProps = {
  id: string;
  headerId?: string;
  descId?: string;
  children: React.ReactNode;
};

const setA11yOnAdjacentElementsAndBody = (els: NodeListOf<HTMLElement>) => {
  document.body.classList.add('overflow-hidden');
  els.forEach((el) => {
    el.setAttribute('aria-hidden', 'true');
    el.classList.add('pointer-events-none');
  });
};

const resetA11yOnAdjacentElementsAndBody = (els: NodeListOf<HTMLElement>) => {
  document.body.classList.remove('overflow-hidden');
  els.forEach((el) => {
    el.removeAttribute('aria-hidden');
    el.classList.remove('pointer-events-none');
  });
};

const Portal = ({
  id,
  headerId = '',
  descId = '',
  children,
}: PortalProps): React.ReactPortal | null => {
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.setAttribute('class', 'portal');
    el.setAttribute('id', id);
    el.setAttribute('role', 'dialog');
    document.body.appendChild(el);

    if (id === 'modal') {
      el.setAttribute('aria-labelledby', headerId);
      el.setAttribute('aria-describedby', descId);
      setA11yOnAdjacentElementsAndBody(
        document.querySelectorAll('body > div:not(#modal)')
      );
    }
  }

  useEffect(() => {
    // Last child out of the portal gets to remove the parent from the DOM.
    return () => {
      let el = document.getElementById(id);
      if (el && el.children.length === 1) {
        el.remove();

        if (id === 'modal') {
          resetA11yOnAdjacentElementsAndBody(
            document.querySelectorAll('body > div:not(#modal)')
          );
        }
      }
    };
  }, [id]);

  return createPortal(children, el);
};

export default memo(Portal);

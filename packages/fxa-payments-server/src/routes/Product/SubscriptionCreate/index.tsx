import React, { useState, useCallback, useEffect, useContext } from 'react';
import { Plan } from '../../../store/types';

import { State as ValidatorState } from '../../../lib/validator';

import { useNonce } from '../../../lib/hooks';
import { getErrorMessage } from '../../../lib/errors';

import { SignInLayoutContext } from '../../../components/AppLayout';
import PaymentForm from '../../../components/PaymentForm';
import ErrorMessage from '../../../components/ErrorMessage';
import AcceptedCards from '../AcceptedCards';

import { ProductProps } from '../index';
import * as Amplitude from '../../../lib/amplitude';
import { Localized } from '@fluent/react';

import './index.scss';

export type SubscriptionCreateProps = {
  accountActivated: boolean;
  selectedPlan: Plan;
  couponId: string;
  createSubscriptionAndRefresh: ProductProps['createSubscriptionAndRefresh'];
  createSubscriptionStatus: ProductProps['createSubscriptionStatus'];
  resetCreateSubscription: ProductProps['resetCreateSubscription'];
  validatorInitialState?: ValidatorState;
};

export const SubscriptionCreate = ({
  accountActivated,
  selectedPlan,
  couponId,
  createSubscriptionAndRefresh: createSubscriptionAndRefreshBase,
  createSubscriptionStatus,
  resetCreateSubscription: resetCreateSubscriptionBase,
  validatorInitialState,
}: SubscriptionCreateProps) => {
  const [submitNonce, refreshSubmitNonce] = useNonce();

  const resetCreateSubscription = useCallback(async () => {
    resetCreateSubscriptionBase();
    refreshSubmitNonce();
  }, [resetCreateSubscriptionBase, refreshSubmitNonce]);

  const createSubscriptionAndRefresh = useCallback(
    async (...args: Parameters<typeof createSubscriptionAndRefreshBase>) => {
      await createSubscriptionAndRefreshBase(...args);
      refreshSubmitNonce();
    },
    [createSubscriptionAndRefreshBase, refreshSubmitNonce]
  );

  // Hide the Firefox logo in layout if we want to display the avatar
  const { setHideLogo } = useContext(SignInLayoutContext);
  useEffect(() => {
    setHideLogo(!accountActivated);
  }, [setHideLogo, accountActivated]);

  const onFormMounted = useCallback(
    () => Amplitude.createSubscriptionMounted(selectedPlan),
    [selectedPlan]
  );

  const onFormEngaged = useCallback(
    () => Amplitude.createSubscriptionEngaged(selectedPlan),
    [selectedPlan]
  );

  // Reset subscription creation status on initial render.
  useEffect(
    () => void resetCreateSubscription(),
    // Prevent an infinite loop, here
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [createTokenError, setCreateTokenError] = useState({
    type: '',
    error: false,
  });

  const inProgress = createSubscriptionStatus.loading;

  const isCardError =
    createSubscriptionStatus.error !== null &&
    (createSubscriptionStatus.error.code === 'card_declined' ||
      createSubscriptionStatus.error.code === 'incorrect_cvc');

  // clear any error rendered with `ErrorMessage` on form change
  const onChange = useCallback(() => {
    if (createTokenError.error) {
      setCreateTokenError({ type: '', error: false });
    } else if (isCardError) {
      resetCreateSubscription();
    }
  }, [
    createTokenError,
    setCreateTokenError,
    resetCreateSubscription,
    isCardError,
  ]);

  const onPayment = useCallback(
    (
      tokenResponse: stripe.TokenResponse,
      name: string,
      idempotencyKey: string
    ) => {
      if (tokenResponse && tokenResponse.token) {
        createSubscriptionAndRefresh(
          tokenResponse.token.id,
          selectedPlan,
          couponId,
          name,
          idempotencyKey
        );
      } else {
        // This shouldn't happen with a successful createToken() call, but let's
        // display an error in case it does.
        const error: any = { type: 'api_error', error: true };
        setCreateTokenError(error);
      }
    },
    [selectedPlan, createSubscriptionAndRefresh, setCreateTokenError]
  );

  const onPaymentError = useCallback(
    (error: any) => {
      error.error = true;
      setCreateTokenError(error);
    },
    [setCreateTokenError]
  );

  return (
    <div className="product-payment" data-testid="subscription-create">
      <div
        className="subscription-create-heading"
        data-testid="subscription-create-heading"
      >
        <Localized id="product-plan-details-heading">
          <h2>Set up your subscription</h2>
        </Localized>
        <Localized id="sub-guarantee">
          <p className="subheading">30-day money-back guarantee</p>
        </Localized>
      </div>

      <h3 className="billing-title">
        <Localized id="sub-update-title">
          <span className="title">Billing Information</span>
        </Localized>
      </h3>

      <AcceptedCards />

      <ErrorMessage isVisible={!!createTokenError.error}>
        {createTokenError.error && (
          <Localized id={getErrorMessage(createTokenError.type)}>
            <p data-testid="error-payment-submission">
              {getErrorMessage(createTokenError.type)}
            </p>
          </Localized>
        )}
      </ErrorMessage>

      <ErrorMessage isVisible={isCardError}>
        <Localized id={getErrorMessage('card_error')}>
          <p data-testid="error-card-rejected">
            {getErrorMessage('card_error')}
          </p>
        </Localized>
      </ErrorMessage>

      <ErrorMessage
        isVisible={!!(createSubscriptionStatus.error && !isCardError)}
      >
        {createSubscriptionStatus.error ? (
          <p data-testid="error-sub-status">
            {createSubscriptionStatus.error.message}
          </p>
        ) : null}
      </ErrorMessage>

      <PaymentForm
        {...{
          submitNonce,
          onPayment,
          onPaymentError,
          onChange,
          inProgress,
          validatorInitialState,
          confirm: true,
          plan: selectedPlan,
          onMounted: onFormMounted,
          onEngaged: onFormEngaged,
        }}
      />
    </div>
  );
};

export default SubscriptionCreate;

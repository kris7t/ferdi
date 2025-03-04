import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { defineMessages, injectIntl } from 'react-intl';

import ErrorBoundary from '../util/ErrorBoundary';
import { oneOrManyChildElements } from '../../prop-types';
import Appear from '../ui/effects/Appear';

const messages = defineMessages({
  closeSettings: {
    id: 'settings.app.closeSettings',
    defaultMessage: 'Close settings',
  },
});

@observer
class SettingsLayout extends Component {
  static propTypes = {
    navigation: PropTypes.element.isRequired,
    children: oneOrManyChildElements.isRequired,
    closeSettings: PropTypes.func.isRequired,
  };

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown.bind(this), false);
  }

  componentWillUnmount() {
    document.removeEventListener(
      'keydown',
      // eslint-disable-next-line unicorn/no-invalid-remove-event-listener
      this.handleKeyDown.bind(this),
      false,
    );
  }

  handleKeyDown(e) {
    if (e.keyCode === 27) {
      // escape key
      this.props.closeSettings();
    }
  }

  render() {
    const { navigation, children, closeSettings } = this.props;

    const { intl } = this.props;

    return (
      <Appear transitionName="fadeIn-fast">
        <div className="settings-wrapper">
          <ErrorBoundary>
            <button
              type="button"
              className="settings-wrapper__action"
              onClick={closeSettings}
              aria-label={intl.formatMessage(messages.closeSettings)}
            />
            <div className="settings franz-form">
              {navigation}
              {children}
              <button
                type="button"
                className="settings__close mdi mdi-close"
                onClick={closeSettings}
                aria-label={intl.formatMessage(messages.closeSettings)}
              />
            </div>
          </ErrorBoundary>
        </div>
      </Appear>
    );
  }
}

export default injectIntl(SettingsLayout);

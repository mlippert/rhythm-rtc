import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import { connect } from 'react-redux'
import auth from "../../firebase"
import {
  handleChangeEmail,
  handleEmailInput,
  clearEmailError}
from "../../redux/actions/profile"
import { push } from 'connected-react-router'
import ProfileView from './ProfileView'

const processEmailMessage = (msg) => {
  if (msg.indexOf('This operation') > -1) {
    return "Oops! For your security, we need you to log in again before you can change your email.";
  } else {
    return msg;
  }
};

const mapStateToProps = state => ({
  user: state.auth.user,
  emailMessage: processEmailMessage(state.profile.changeEmailMessage),
  emailStatus: state.profile.changeEmailStatus,
  emailInput: (state.profile.emailInput == "" ? state.auth.user.email : state.profile.emailInput)
});

const mapDispatchToProps = dispatch => ({
  handleKeyPress: event => {
    if (event.key == 'Enter') {
      dispatch(handleChangeEmail(event.target.value));
    }
  },
  clearEmailError: () => {
    dispatch(clearEmailError());
  },
  handleEmailSubmit: (email) => {
    dispatch(handleChangeEmail(email));
  },
  handleEmailInput: email => {
    dispatch(handleEmailInput(email));
  }
});

export default withRouter(
  connect(mapStateToProps,
          mapDispatchToProps)(ProfileView));

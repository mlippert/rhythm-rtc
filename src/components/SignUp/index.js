import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import auth from "../../firebase";
import {
  attemptUserCreate,
  clearAuthError,
  changePasswordState,
  changeEmailState }
from "../../redux/actions/auth";
import { push } from 'connected-react-router';
import SignUpView from "./SignUpView";


const mapStateToProps = state => ({
  error: state.auth.error,
  email: state.auth.input.email,
  password: state.auth.input.password,
  isInvalid: state.auth.input.email == '' || state.auth.input.password == '',
})

const mapDispatchToProps = dispatch => ({
  handleSignUp: event => {
    event.preventDefault();
    console.log("Handlng signup...")
    const {email, password} = event.target.elements;
    dispatch(attemptUserCreate(email.value, password.value));
  },

  handlePassword: pass => {
    dispatch(changePasswordState(pass));
  },

  handleEmail: email => {
    console.log("handling email...")
    dispatch(changeEmailState(email));
  },

  clearError: event => {
    event.preventDefault();
    console.log("event", event, event.target);
    dispatch(clearAuthError());
  }
})

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(SignUpView))

//export default withRouter(SignUpContainer);

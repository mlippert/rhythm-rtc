import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import { connect } from 'react-redux'
import auth from "../../firebase"
import {
  attemptUserSignIn,
  clearAuthError,
  changePasswordState,
  changeEmailState }
from "../../redux/actions/auth"
import { push } from 'connected-react-router'
import LogInView from "./LogInView"


const mapStateToProps = state => ({
  error: state.auth.error,
  email: state.auth.input.email,
  password: state.auth.input.password,
  isInvalid: state.auth.input.email == '' || state.auth.input.password == '',
})

const mapDispatchToProps = dispatch => ({
  handleLogIn: event => {
    event.preventDefault();
    console.log("Handlng signup...")
    const {email, password} = event.target.elements;
    dispatch(attemptUserSignIn(email.value, password.value));
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
)(LogInView))

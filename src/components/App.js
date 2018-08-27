import React from 'react';
import ReactDOM from 'react-dom';
import Home from './Home';
import SignUp from "./SignUp"
import LogIn from "./LogIn"
import Profile from "./Profile"
import Chat from "./Chat"
import NavBar from "./NavBar"
import styled, { injectGlobal, keyframes } from 'styled-components';
import store from '../redux/store'
import { connect } from 'react-redux'
import { withRouter } from "react-router-dom"
import {
  Router,
  Route,
  Link,
  Switch,
  Redirect,
} from 'react-router';

import browserHistory from "../history";
import firebase from "../firebase";
import addAuthListener from '../redux/authListener.js';
import { attemptLoginAnonymous } from '../redux/actions/auth';
import { attemptRiffAuthenticate } from '../redux/actions/riff';

const Footer = styled.footer.attrs({
  className: 'footer'
})`
  background-color: #f6f0fb;
`;

const mapStateToProps = state => ({
  auth: state.auth
});

const mapDispatchToProps = dispatch => ({
  logInAnonymously: () => {
    attemptLoginAnonymous();
  },
  authenticateRiff: () => {
    console.log("attempt riff auth");
    dispatch(attemptRiffAuthenticate());
  },
  dispatch: dispatch
});

// App component
class App extends React.Component {

  constructor(props) {
    super(props);
    addAuthListener(this.props.dispatch,
                    this.props.auth);
  }

  componentDidMount() {
    console.log("App component loaded.");
    if (!this.props.auth.user.uid && !this.props.auth.uid) {
      console.log("No user detected, creating anonymous ID");
      this.props.logInAnonymously();
    }
    this.props.authenticateRiff();
  }

  render() {
    var localVideoId = "local-video";
    return (
      <div>
        <title>Riff</title>
        <Router history={browserHistory}>
          <div>
            <NavBar>
            </NavBar>
            <Route path="/home" component={Home}/>
            <Route exact path="/room" component={Chat}/>
            <Route exact path="/signup" component={SignUp} />
            <Route exact path="/login" component={LogIn} />
            <Route exact path="/profile" component={Profile} />
          </div>
        </Router>
      </div>
    );
  };
}

export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
)(App));

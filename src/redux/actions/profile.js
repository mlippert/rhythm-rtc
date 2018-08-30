import {
  CHANGE_EMAIL,
  CHANGE_EMAIL_INPUT} from '../constants/ActionTypes';
import firebase from "firebase";
import app from "../../firebase";
import { push } from 'connected-react-router';

export const changeEmail = (email) => {
  console.log("got email:", email);
  return {type: CHANGE_EMAIL, email: email, status: 'success'};
};

export const changeEmailError = (errorMessage) => {
  return {type: CHANGE_EMAIL, status: 'error', message: errorMessage};
};

export const changeEmailLoading = () => {
  return {type: CHANGE_EMAIL, status: 'loading'};
};

export const clearEmailError = () => {
  return {type: CHANGE_EMAIL, status: 'waiting'};
};

export const handleChangeEmail = (email) => dispatch => {
  dispatch(changeEmailLoading());
  let user = firebase.auth().currentUser;
  user.updateEmail(email).then(() => {
    dispatch(changeEmail(email));
    setTimeout(()=> dispatch(clearEmailError()), 3000);
  }).catch((err) => {
    dispatch(changeEmailError(err.message));
  });
};

export const handleEmailInput = (email) => {
  return {type: CHANGE_EMAIL_INPUT, 'email': email};
}

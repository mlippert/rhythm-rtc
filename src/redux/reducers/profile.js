import {
  CHANGE_EMAIL,
  CHANGE_EMAIL_INPUT
} from '../constants/ActionTypes';

const initialState = {
  changeEmailMessage: '',
  changeEmailStatus: 'waiting',
  emailInput: ''
};

const profile = (state=initialState, action) => {
  switch(action.type) {
  case(CHANGE_EMAIL_INPUT):
    return {...state, emailInput: action.email};
  case(CHANGE_EMAIL):
    return {...state,
            changeEmailStatus: action.status,
            changeEmailMessage: (action.message ? action.message : state.changeEmailMessage),
            emailInput: (action.status == 'error' ? state.emailInput : action.emailInput)
           };
  default:
    return state;
  }
};

export default profile;

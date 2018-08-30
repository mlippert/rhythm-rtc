import {
  CREATE_USER_SUCCESS,
  CREATE_USER_FAIL,
  CLEAR_ERROR,
  LOG_OUT,
  LOGIN_USER_SUCCESS,
  LOGIN_USER_FAIL,
  LOGIN_ANONYMOUS,
  INPUT_STATE_CHANGE
} from '../constants/ActionTypes';

const initialState = {
  loggingIn: false,
  loggedIn: false,
  signingIn: false,
  loggingOut: false,
  anonymous: true,
  uid: null,
  user: {
    email: null,
    uid: null,
    verified: null
  },
  error: null,
  input: {
    email: '',
    password: ''
  }
}


const auth = (state = initialState, action) => {
  switch(action.type) {
  case(LOGIN_USER_SUCCESS):
    return { ...state, loggedIn: true, user: action.user, anonymous: false}
  case(LOGIN_USER_FAIL):
    return { ...state, loggedIn: false, error: action.error }
  case(LOG_OUT):
    console.log("USER LOGGED OUT");
    return initialState;
  case(CREATE_USER_SUCCESS):
    return { ...state, loggedIn: true, user: action.user, anonymous: false}
  case(CREATE_USER_FAIL):
    return { ...state, loggedIn: false, error: action.error}
  case(CLEAR_ERROR):
    return { ...state, error: null}
  case(LOGIN_ANONYMOUS):
    return {...state, anonymous: true, uid: action.uid, user: { ...state.user, uid: action.uid}}
  case(INPUT_STATE_CHANGE):
    return { ...state, input: {
      email: action.email || state.input.email,
      password: action.password || state.input.password
    }}
  default:
    return state;
  }
}

export default auth;

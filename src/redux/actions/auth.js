import { CREATE_USER_SUCCESS,
         CREATE_USER_FAIL,
         LOGIN_USER_SUCCESS,
         LOGIN_USER_FAIL,
         LOGIN_ANONYMOUS,
         INPUT_STATE_CHANGE,
         CLEAR_ERROR,
         LOG_OUT} from '../constants/ActionTypes';
import firebase from "firebase";
import app from "../../firebase"
import { push } from 'connected-react-router'

export const createUserSuccess = (resp) => {
  console.log("create user success...", resp)
  let user  = {
    email: resp.user.email,
    uid: resp.user.uid,
    verified: resp.user.emailVerified
  };
  return {
    type: CREATE_USER_SUCCESS,
    user: user,
  };
};

export const createUserFail = (error) => {
  return {
    type: CREATE_USER_FAIL,
    error
  };
};

export const loginUserSuccess = (resp) => {
  let user  = {
    email: resp.user.email,
    uid: resp.user.uid,
    verified: resp.user.emailVerified
  };
  return {
    type: LOGIN_USER_SUCCESS,
    user: user,
  };
};

export const loginUserFail = (error) => {
  return {
    type: LOGIN_USER_FAIL,
    error
  };
};

export const changeInputState = (email, password) => {
  return {
    type: INPUT_STATE_CHANGE,
    email: email,
    password: password
  };
};

export const clearAuthError = () => {
  return {
    type: CLEAR_ERROR
  };
};

export const logOutUser = () => {
  return {
    type: LOG_OUT
  };
};

export const changePasswordState = (pass) => {
  return changeInputState(null, pass);
};

export const changeEmailState = (email) => {
  return changeInputState(email, null);
};

export const loginAnonymously = (uid) => {
  console.log("Logged in anonymously!");
  console.log(">>UID:", uid);
  return {
    type: LOGIN_ANONYMOUS,
    uid: uid
  };
};

export const attemptLoginAnonymous = () => {
  firebase.auth().signInAnonymously().catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log("signed in anonymously...");
    if (errorCode === 'auth/operation-not-allowed') {
      alert('You must enable Anonymous auth in the Firebase Console.');
    } else {
      console.error(error);
    }
  });
}

export const attemptUserCreate = (email, pass) => dispatch => {
  var credential = firebase.auth.EmailAuthProvider.credential(email, pass);
  app.auth().currentUser.linkAndRetrieveDataWithCredential(credential).then(function (usercred) {
    var user = usercred.user;
    dispatch(createUserSuccess(usercred));
  }).then(() => {
    dispatch(push("/home"));
  }).catch((error => dispatch(createUserFail(error))));
};

export const attemptUserSignIn = (email, pass) => dispatch => {
  app.auth().signInWithEmailAndPassword(email, pass)
    .then((resp) => {
      dispatch(loginUserSuccess(resp));
    }).then(() => {
      dispatch(push("/profile"));
    })
    .catch((error) => dispatch(loginUserFail(error)));
}

  //
  // module.exports = {
  //
  //   // called at app start
  //   startListeningToAuth: function(){
  //     return function(dispatch,getState){
  //       fireRef.onAuth(function(authData){
  //         if (authData){
  //           dispatch({
  //             type: C.LOGIN_USER,
  //             uid: authData.uid,
  //             username: authData.github.displayName || authData.github.username
  //           });
  //         } else {
  //           if (getState().auth.currently !== C.ANONYMOUS){ // log out if not already logged out
  //             dispatch({type:C.LOGOUT});
  //           }
  //         }
  //       });
  //     }
  //   },
  //   attemptLogin: function(){
  //     return function(dispatch,getState){
  //       dispatch({type:C.ATTEMPTING_LOGIN});
  //       fireRef.authWithOAuthPopup("github", function(error, authData) {
  //         if (error) {
  //           dispatch({type:C.DISPLAY_ERROR,error:"Login failed! "+error});
  //           dispatch({type:C.LOGOUT});
  //         } else {
  //           // no need to do anything here, startListeningToAuth have already made sure that we update on changes
  //         }
  //       });
  //     };
  //   },
  //   logoutUser: function(){
  //     return function(dispatch,getState){
  //       dispatch({type:C.LOGOUT}); // don't really need to do this, but nice to get immediate feedback
  //       fireRef.unauth();
  //     };
  //   }
  // };

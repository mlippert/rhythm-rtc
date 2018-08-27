import app from '../firebase';
import { loginAnonymously } from './actions/auth.js';


export default function (dispatch, authState) {

  app.auth().onAuthStateChanged((user) => {
    console.log("Auth state changed.", user);
    var isAnonymous = user.isAnonymous;
    var uid = user.uid;
    if (user.isAnonymous) {
      console.log("user is anonymous!", user.uid);
      dispatch(loginAnonymously(uid));
    } else {
      console.log("Have a user", user);
    }
  });
}


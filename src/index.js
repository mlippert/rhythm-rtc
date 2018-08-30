import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import {getUrlParam} from "./libs/utils";
import "./index.scss";
import 'webrtc-adapter';  // see https://bloggeek.me/webrtc-adapter-js/ for what this does.

import history from './history';
import { AppContainer } from 'react-hot-loader';
import {store, persistor} from './redux/store'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
import { ConnectedRouter } from 'connected-react-router'

import browserHistory from './history'

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <ConnectedRouter history={browserHistory}>
        <App/>
      </ConnectedRouter>
    </PersistGate>
  </Provider>,
  document.getElementById('root'));
//registerServiceWorker();


// let user_data = window.user_data || {};
// user_data.user_id = user_data.user_id || getUrlParam("user") || window.prompt("Please enter a username!","name") || "default";
// user_data.email = user_data.email || getUrlParam("email") || window.prompt("Please enter your email!","email");
// // default to user id if not provided
// user_data.name = user_data.name || user_data.user_id;
// user_data.room = user_data.room || getUrlParam("room") || window.prompt("Please enter a room name!","room");

// if (user_data.room === undefined) {
//   // just in case
//   user_data.room = "DEMOROOM"
// }
// console.log("debug mode: ", window.client_config.react_app_debug)


// //registerServiceWorker();

// // OK. this is hacky and i hate it. but clmtrackr requires height and width
// // to be populated on the element itself.
// var video = document.getElementById('local-video');
// var overlay = document.getElementById('video-overlay');
// var vid_height = video.height;
// var vid_width = video.width;

// function adjustVideoProportions() {
//   // COPIED / BORROWED from auduno/clmtrackr examples.
//   // resize overlay and video if proportions are not 4:3
//   // keep same width, just change height
//   console.log(vid_height)
//   var proportion = video.videoWidth/video.videoHeight;
//   vid_height = Math.round(vid_width / proportion);
//   video.height = vid_height;
//   overlay.height = vid_height;
// }


// function resize () {
//   adjustVideoProportions();
// }


// video.addEventListener("resize", resizeThrottler, false);

// var resizeTimeout;
// function resizeThrottler() {
//   // ignore resize events as long as an actualResizeHandler execution is in the queue
//   if (!resizeTimeout) {
//     resizeTimeout = setTimeout(function() {
//       resizeTimeout = null;
//       adjustVideoProportions();
//       // The actualResizeHandler will execute at a rate of 15fps
//     }, 66);
//   }
// }

// resize()

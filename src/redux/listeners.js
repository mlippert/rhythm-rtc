import SimpleWebRTC from 'simplewebrtc';
import sibilant from 'sibilant-webaudio';
import { JOINING_ROOM,
         JOINED_ROOM,
         IN_ROOM,
         ADD_PEER,
         REMOVE_PEER,
         CHAT_READY_TO_CALL,
         CHAT_SET_WEBRTC_CONFIG,
         CHAT_START_WEBRTC,
         CHAT_GET_MEDIA_ERROR,
         CHAT_SHARE_STREAM,
         CHAT_VOLUME_CHANGED
       } from './constants/ActionTypes';
import ReactDOM from 'react-dom';


const addPeer = (peer) => {
  return {
    type: ADD_PEER,
    peer: peer
  };
};

const removePeer = (peer) => {
  return {
    type: REMOVE_PEER,
    peer: peer
  };
};


const readyToCall = (roomName) => {
  return {
    type: CHAT_READY_TO_CALL,
    roomName: roomName
  };
};

const shareStream = (stream) => {
  return {
    type: CHAT_SHARE_STREAM,
    stream: stream
  };
};

const volumeChanged = (vol) => {
  return{
    type: CHAT_VOLUME_CHANGED,
    volume: vol
  };
};

const getMediaError = (error) => {
  return {
    type: CHAT_GET_MEDIA_ERROR,
    error: error
  };
};


export default function (nick, localVideoNode, dispatch, chatState) {
  let signalmasterPath = window.client_config.signalMaster.path || '';
  signalmasterPath += '/socket.io';
  let webRtcConfig = {
    localVideoEl: localVideoNode,
    remoteVideosEl: "", // handled by our component
    autoRequestMedia: true,
    url: window.client_config.signalMaster.url,
    nick: nick,
    socketio: {
      path: signalmasterPath,
      forceNew: true
    },
    debug: !!window.client_config.webrtc_debug
  };

  const webrtc = new SimpleWebRTC(webRtcConfig);

  console.log("Creating webrtc constant...");

  webrtc.on('videoAdded', function (video, peer) {
    console.log("added vidieo")
    dispatch(addPeer(peer));
  });

  webrtc.on('videoRemoved', function (video, peer) {
    console.log("removed video")
    dispatch(removePeer(peer));
  });

  webrtc.on('localStreamRequestFailed', function (event) {
    console.log("failed request:", event);
    dispatch(getMediaError(event));
  });

  // in the future, dispatch a sibilant action to start measuring maybe
  let stream = localVideoNode.captureStream ? localVideoNode.captureStream() : localVideoNode.mozCaptureStream();
  var sib = new sibilant(stream);

  webrtc.on('readyToCall', function (video, peer) {
    webrtc.joinRoom(chatState.roomName, function (err, rd) {
      console.log(err, "---", rd);
    });
    console.log("sib:", sib);
    // use this to show user volume to confirm audio/video working
    sib.bind('volumeChange', function (data) {
      dispatch(volumeChanged(data));
    });

    dispatch(readyToCall(chatState.roomName));
//    dispatch(shareStream(webrtc.webrtc.localStreams[0]));
  });

  webrtc.stopSibilant = function () {
    sib.unbind('volumeChange');
  };

  return webrtc;
}

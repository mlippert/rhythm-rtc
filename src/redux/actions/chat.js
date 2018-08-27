import { JOINING_ROOM,
         JOINED_ROOM,
         IN_ROOM,
         ADD_PEER,
         REMOVE_PEER,
         MUTE_AUDIO,
         UNMUTE_AUDIO,
         CHAT_LEAVE_ROOM,
         CHAT_READY_TO_CALL,
         CHAT_SET_WEBRTC_CONFIG,
         CHAT_START_WEBRTC,
         CHAT_CHANGE_ROOM_NAME,
         CHAT_CHANGE_DISPLAY_NAME,
         CHAT_CHANGE_PEER_DISPLAY_NAME,
         CHAT_GET_MEDIA_ERROR,
         CHAT_SHARE_STREAM,
         CHAT_VOLUME_CHANGED,
         CHAT_JOIN_ROOM_ERROR,
         CHAT_CLEAR_JOIN_ROOM_ERROR
       } from '../constants/ActionTypes';
import SimpleWebRTC from 'simplewebrtc';
import ReactDOM from 'react-dom';
import app from "../../firebase";
import { push } from 'connected-react-router';

export const joinRoomError = (errMsg) => {
  return {
    type: CHAT_JOIN_ROOM_ERROR,
    msg: errMsg
  };
};

export const clearJoinRoomError = (errMsg) => {
  return {
    type: CHAT_CLEAR_JOIN_ROOM_ERROR,
  };
};

export const addPeer = (peer) => {
  return {
    type: ADD_PEER,
    peer: peer
  };
};

export const removePeer = (peer) => {
  return {
    type: REMOVE_PEER,
    peer: peer
  };
};


export const readyToCall = (roomName) => {
  return {
    type: CHAT_READY_TO_CALL,
    roomName: roomName
  };
};

export const shareStream = (stream) => {
  return {
    type: CHAT_SHARE_STREAM,
    stream: stream
  };
};

export const volumeChanged = (vol) => {
  return{
    type: CHAT_VOLUME_CHANGED,
    volume: vol
  };
};

export const getMediaError = (error) => {
  return {
    type: CHAT_GET_MEDIA_ERROR,
    error: error
  };
};

export const changeRoomName = (roomName) => {
  return {type: CHAT_CHANGE_ROOM_NAME,
          roomName: roomName};
};

export const changeDisplayName = (displayName) => {
  return {type: CHAT_CHANGE_DISPLAY_NAME,
          displayName: displayName};
}

export const changePeerDisplayName = (peer, displayName) => {
  return {type: CHAT_CHANGE_PEER_DISPLAY_NAME,
          peer: peer,
          displayName: displayName};
};

export const joinedRoom = (name) => {
  return {type: JOINED_ROOM,
          name: name};
};

export const muteAudio = () => {
  console.log("muting audio");
  return {type: MUTE_AUDIO};
};

export const unMuteAudio = () => {
  return {type: UNMUTE_AUDIO};
};

export const leaveRoom = () => {
  return {type: CHAT_LEAVE_ROOM};
};

export const joinWebRtc = (localVideoRef, email) => dispatch => {
  console.log("trying to start....;;;;")
//  let { webRtcConfig, signalMasterPath } = setWebRtcConfig(localVideoRef, email);
//  dispatch(saveWebRtcConfig(webRtcConfig, signalMasterPath));
//  dispatch(startWebRtc(webRtcConfig));
}

import {
  CHAT_SET_WEBRTC_CONFIG,
  JOIN_ROOM,
  JOINED_ROOM,
  JOINING_ROOM,
  IN_ROOM,
  MUTE_AUDIO,
  UNMUTE_AUDIO,
  MUTE_VIDEO,
  ADD_PEER,
  REMOVE_PEER,
  CHAT_LEAVE_ROOM,
  CHAT_READY_TO_CALL,
  CHAT_VOLUME_CHANGED,
  CHAT_GET_MEDIA_ERROR,
  CHAT_CHANGE_ROOM_NAME,
  CHAT_CHANGE_DISPLAY_NAME,
  CHAT_CHANGE_PEER_DISPLAY_NAME,
  CHAT_JOIN_ROOM_ERROR,
  CHAT_CLEAR_JOIN_ROOM_ERROR
} from '../constants/ActionTypes';

const initialState = {
  joiningRoom: false,
  getMediaError: true,
  inRoom: false,
  roomName: "",
  audioMuted: false,
  videoMuted: false,
  displayName: "",
  joinRoomError: null,
  rhythm: {
    authenticated: false,
    token: null,
    error: null
  },
  volume: 0,
  webRtcPeers: [],
  webRtcPeerDisplayNames: [],
  readyToCall: false,
  webRtc: {
    config: null,
    signalMasterPath: ''
  }
};

const chat = (state = initialState, action) => {
  switch (action.type) {
  case(JOIN_ROOM):
    return {...state, joiningRoom: true, roomName: action.roomName, inRoom: false};
  case(CHAT_CHANGE_ROOM_NAME):
    return {...state, roomName: action.roomName};
  case(CHAT_CHANGE_DISPLAY_NAME):
    return {...state, displayName: action.displayName};
  case(CHAT_SET_WEBRTC_CONFIG):
    return {...state, webRtc: {config: action.webRtcConfig,
                               signalMasterPath: action.signalMasterPath}};
  case(ADD_PEER):
    // this removes any null peers
    const peers = state.webRtcPeers.filter(n => !(n === null));
    let peer_ids = state.webRtcPeers.map(p => p.id);
    if (peer_ids.indexOf(action.peer.id) >= 1) {
      console.log("not re-adding a peer...");
      return state;
    } else {
      return {...state,
              webRtcPeers: [...peers, action.peer.peer],
              webRtcPeerDisplayNames: [...state.webRtcPeerDisplayNames, ""]};
    }
  case(REMOVE_PEER):
    let peer = action.peer.peer;
    const index = state.webRtcPeers.map(item => item.id).indexOf(peer.id);
    return {...state,
            webRtcPeers: [...state.webRtcPeers.slice(0, index),
                          ...state.webRtcPeers.slice(index + 1)],
            webRtcPeerDisplayNames: [...state.webRtcPeerDisplayNames.slice(0, index),
                                     ...state.webRtcPeerDisplayNames.slice(index + 1)]};
  case(CHAT_CHANGE_PEER_DISPLAY_NAME):
    let p = action.peer;
    const idx = state.webRtcPeers.map(item => item.id).indexOf(p.id);
    return {...state, webRtcPeerDisplayNames: [...state.webRtcPeerDisplayNames.slice(0, idx),
                                    action.displayName,
                                    ...state.webRtcPeerDisplayNames.slice(idx + 1)]};
  case(CHAT_GET_MEDIA_ERROR):
    return{...state, getMediaError: action.error};
  case(CHAT_READY_TO_CALL):
    return {...state, readyToCall: true, getMediaError: false};
  case(JOINED_ROOM):
    return{...state, inRoom: true, joiningRoom: false};
  case(CHAT_LEAVE_ROOM):
    return {...state, roomName: null, inRoom: false,
            webRtcPeers: []};
  case(CHAT_VOLUME_CHANGED):
    return {...state, volume: action.volume};
  case(CHAT_JOIN_ROOM_ERROR):
    return {...state, joinRoomError: action.msg};
  case(CHAT_CLEAR_JOIN_ROOM_ERROR):
    return {...state, joinRoomError: null};
  case(MUTE_AUDIO):
    return {...state, audioMuted: true};
  case(UNMUTE_AUDIO):
    return {...state, audioMuted: false};
  default:
    return state;
  }
};

export default chat;

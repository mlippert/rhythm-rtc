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
       } from '../constants/ActionTypes';
import {
  addPeer,
  removePeer,
  readyToCall,
  shareStream,
  volumeChanged,
  getMediaError,
  changeRoomName,
  muteAudio,
  unMuteAudio,
  leaveRoom,
  saveLocalWebrtcId,
  changePeerDisplayName,
  changePeerRiffId
} from '../actions/chat';
import {
  updateRiffMeetingId,
  participantLeaveRoom
} from '../actions/riff';
import ReactDOM from 'react-dom';

import { app, socket } from '../../riff';
import captureSpeaking from '../../libs/audio';


export default function (nick, localVideoNode, dispatch, getState) {
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

  console.log("Creating webrtc constant...", webrtc);
//  console.log("Local Session ID:", webrtc.connection.socket.sessionId)

  webrtc.on('videoAdded', function (video, peer) {
    console.log("added video", peer, video, "nick:", peer.nick);
    dispatch(addPeer({peer: peer, videoEl: video}));
    let [riffId, nick] = peer.nick.split(' ');
    dispatch(changePeerRiffId(peer, riffId));
    dispatch(changePeerDisplayName(peer, nick));
  });

  webrtc.on('videoRemoved', function (video, peer) {
    let state = getState();
    dispatch(removePeer({peer: peer,
                         videoEl: video}));
    if (state.chat.inRoom) {
      console.log("riff removing participant: ", peer.nick, "from meeting", state.riff.meetingId);
      let [riffId, ...rest] = peer.nick.split(" ");
      participantLeaveRoom(state.riff.meetingId, riffId);
    }
  });

  webrtc.on('localStreamRequestFailed', function (event) {
      dispatch(getMediaError(event));
  });

  webrtc.on('localStream', function (event) {
    if (event.active) {
      dispatch(getMediaError(false));
    }
  });

  webrtc.changeNick = function (nick) {
    this.config.nick = nick;
    this.webrtc.config.nick = nick;
  };

  webrtc.on('readyToCall', function (video, peer) {
    let stream = localVideoNode.captureStream ? localVideoNode.captureStream() : localVideoNode.mozCaptureStream();
    console.log("videoNode:", localVideoNode)
    console.log("video:", video);
    console.log("stream:", stream)
    dispatch(getMediaError(false));
    console.log("local webrtc connection id:", webrtc.connection.connection.id);
    dispatch(saveLocalWebrtcId(webrtc.connection.connection.id));


    var sib = new sibilant(localVideoNode);

    if (sib) {
      webrtc.stopVolumeCollection = function () {
        //sib.unbind('volumeChange');
      };

      webrtc.startVolumeCollection = function () {
        sib.bind('volumeChange', function (data) {
          let state = getState();
          if (!state.chat.inRoom) {
            dispatch(volumeChanged(data));
          }
        }.bind(getState));
      };

      // bind stopSibilant
      webrtc.stopSibilant = function () {
        //sib.unbind('volumeChange');
        sib.unbind('stoppedSpeaking');
      };

      // use this to show user volume to confirm audio/video working
      webrtc.startVolumeCollection();
      // sib.bind('volumeChange', function (data) {
      //   let state = getState();
      //   if (!state.chat.inRoom) {
      //     dispatch(volumeChanged(data));
      //   }
      // }.bind(getState));

      sib.bind('stoppedSpeaking', (data) => {
        app.service('utterances').create({
          participant: getState().auth.user.uid,
          room: getState().chat.roomName,
          startTime: data.start.toISOString(),
          endTime: data.end.toISOString(),
          token: getState().riff.authToken
        }).then(function (res) {
          //console.log("speaking event recorded:", res)
          dispatch(updateRiffMeetingId(res.meeting));
        }).catch(function (err) {
          console.log("ERROR", err);
        });
      });
      dispatch(readyToCall());      
    }


  });

  return webrtc;
}

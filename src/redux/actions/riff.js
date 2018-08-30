import {
  RIFF_AUTHENTICATE_SUCCESS,
  RIFF_AUTHENTICATE_FAIL,
  RIFF_PARTICIPANTS_CHANGED,
  RIFF_TURN_UPDATE,
  RIFF_JOIN_ROOM,
  RIFF_MEETING_ID_UPDATE
} from '../constants/ActionTypes';

import { app, socket} from "../../riff";

export const riffAuthSuccess = (token) => {
  return {type: RIFF_AUTHENTICATE_SUCCESS,
          token: token};
};

export const riffAuthFail = (err) => {
  return {type: RIFF_AUTHENTICATE_FAIL,
          error: err};
};

export const updateTurnData = (transitions, turns) => {
  console.log("updating turn data:", transitions, turns);
  return {type: RIFF_TURN_UPDATE,
          transitions: transitions,
          turns: turns};
};

export const updateMeetingParticipants = (participants) => {
  console.log("updating riff meeting participants", participants);
  return {type: RIFF_PARTICIPANTS_CHANGED,
          participants: participants};
};

export const updateRiffMeetingId = (meetingId) => {
  return {type: RIFF_MEETING_ID_UPDATE,
          meetingId: meetingId};
};

export const participantLeaveRoom = (meetingId, participantId) => {
  return app.service('meetings').patch(meetingId, {
    remove_participants: [participantId]
  }).then(function (res) {
    console.log("removed participant:", participantId, "from meeting ", meetingId);
    return true;
  }).catch(function (err) {
    return false;
    console.log("shit, caught an error:", err);
  });
};

export const attemptRiffAuthenticate = () => dispatch => {
  app.authenticate({
    strategy: 'local',
    email: window.client_config.dataServer.email,
    password: window.client_config.dataServer.password,
  }).then(function (result) {
    console.log("auth result!: ", result);
    dispatch(riffAuthSuccess(result.accessToken));
    //return this.recordMeetingJoin();
  }.bind(this)).catch(function (err) {
    console.log('auth ERROR:', err);
    dispatch(riffAuthFail(err));
  });
  // we used to automatically join a meeting.
  // .then(function (result) {
  //    log('meeting result:', result);
  //     // we've confirmed auth & meeting join- start communication w/ server
  //     this.record();
  // }.bind(this));
};

export const riffAddUserToMeeting = (uid, email, roomName, nickName,
                                     url, currentUsers, token) => 
  {
    console.log("[riff] adding users to meeting ");

    let parts = currentUsers.map(
      (user) => { return { "participant": user.id }; });

    return socket.emit('meetingJoined', {
      participant: uid,
      email: email,
      name: nickName,
      participants: parts,
      room: roomName,
      meetingUrl: url,
      consent: true,
      consentDate: new Date().toISOString(),
      token: token
    });
  };


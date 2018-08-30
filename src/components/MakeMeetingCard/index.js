import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import auth from "../../firebase";
import {
  changeRoomNameState,
  joinRoom}
from "../../redux/actions/makeMeeting";
import { push } from 'connected-react-router';
import MakeMeetingCardView from './MakeMeetingCardView';

const mapStateToProps = state => ({
  user: state.auth.user,
  joiningRoom: state.chat.joiningRoom,
  inRoom: state.chat.inRoom,
  roomName: state.makeMeeting.roomName,
  isInvalid: state.makeMeeting.roomName == ''
})

const mapDispatchToProps = dispatch => ({
  handleRoomNameChange: roomName => {
    dispatch(changeRoomNameState(roomName))
  },

  handleKeyPress: event => {
    if (event.key == 'Enter') {
      console.log("whoooops")
      dispatch(joinRoom(event.target.value));
      dispatch(push("/room"));
    }
  },

  joinRoom: (roomName) => {
    //console.log("event:", event);
    dispatch(joinRoom(roomName))
    dispatch(push("/room"))
  }
})

export default withRouter(
  connect(mapStateToProps,
          mapDispatchToProps)(MakeMeetingCardView))



import React, { Component } from "react";
import ReactDOM from 'react-dom';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import styled, { injectGlobal, keyframes } from 'styled-components';
import auth from "../../firebase";
import sibilant from 'sibilant-webaudio';
import RemoteVideoContainer from "./RemoteVideoContainer";
import MeetingMediator from "./MeetingMediator";
import MaterialIcon from 'material-icons-react';
import {
  setWebRtcConfig,
  joinWebRtc,
  joinedRoom,
  leaveRoom,
  muteAudio,
  unMuteAudio,
  changeRoomName,
  changeDisplayName,
  joinRoomError,
  clearJoinRoomError,
  saveDisplayName,
  saveLocalWebrtcId}
from "../../redux/actions/chat";
import { participantLeaveRoom } from '../../redux/actions/riff';
import { push } from 'connected-react-router';
import addWebRtcListeners from "../../redux/listeners/webrtc";
import { riffAddUserToMeeting } from '../../redux/actions/riff';
import { store, persistor } from '../../redux/store';
import LeaveRoomButton from './LeaveRoomButton';
import {ScaleLoader} from 'react-spinners';
import app from '../../firebase';
let db = app.firestore();


const mapStateToProps = state => ({
  user: state.auth.user,
  joiningRoom: state.chat.joiningRoom,
  inRoom: state.chat.inRoom,
  roomName: state.chat.roomName,
  readyToCall: state.chat.readyToCall,
  mediaError: state.chat.getMediaError,
  joinRoomError: state.chat.joinRoomError,
  webRtc: state.chat.webRtc,
  webrtcId: state.chat.webrtcId,
  displayName: state.chat.displayName,
  savedDisplayName: state.chat.savedDisplayName,
  webRtcPeers: state.chat.webRtcPeers[0] === null ? [] : state.chat.webRtcPeers,
  isAudioMuted: state.chat.audioMuted,
  volume: state.chat.volume,
  chat: state.chat,
  auth: state.auth,
  riff: state.riff,
  state: state
});

const mapDispatchToProps = dispatch => ({
  leaveRoom: () => {
    dispatch(push('/riffs'));
    dispatch(leaveRoom());
  },
  leaveRiffRoom: (meetingId, uid) => {
    return participantLeaveRoom(meetingId, uid);
  },
  clearJoinRoomError: () => {
    dispatch(clearJoinRoomError());
  },
  handleRoomNameChange: (roomName) => {
    dispatch(changeRoomName(roomName));
  },
  handleDisplayNameChange: (displayName, webrtc) => {
    //    webrtc.changeNick(displayName);
    dispatch(changeDisplayName(displayName));
  },
  joinWebRtc: (localVideoRef, nick) => {
    dispatch(joinWebRtc(localVideoRef, nick));
  },
  handleReadyClick: (event, name, chat, auth, riff, webrtc) => {
    if ((chat.roomName == '' || chat.displayName == '')) {
      dispatch(joinRoomError('You need to specify a room and a display name!'));
    }  else if (chat.getMediaError) {
      dispatch(joinRoomError('Make sure your camera and microphone are ready.'));
    } else {
      event.preventDefault();
      webrtc.stopVolumeCollection();
      webrtc.joinRoom(chat.roomName, function (err, rd) {
        console.log(err, "---", rd);
      });

      dispatch(joinedRoom(name));
      riffAddUserToMeeting(auth.user.uid,
                           auth.user.email ? auth.user.email : "",
                           chat.roomName,
                           chat.displayName,
                           chat.roomName,
                           chat.webRtcPeers,
                           riff.authToken
                          );
      // use nick property to share riff IDs with all users
      webrtc.changeNick(auth.user.uid + " " + chat.displayName);
    }
  },
  handleMuteAudioClick: (event, muted, webrtc) => {
    console.log(event, muted);
    if (muted) {
      dispatch(unMuteAudio());
      webrtc.unmute();
    } else {
      dispatch(muteAudio());
      webrtc.mute();
    }
  },
  saveLocalWebrtcId: (webrtcId) => {
    dispatch(saveLocalWebrtcId(webrtcId));
  },
  dispatch: dispatch,
});

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
  withRef: true,
  handleKeypress: (event, webrtc) => {
    if (Event.key == 'Enter') {
      dispatchProps.handleReadyClick(event,
                                     stateProps.displayName,
                                     stateProps.chat,
                                     stateProps.auth,
                                     stateProps.riff,
                                     webrtc);
    }
  },
});


const VideoPlaceholder = styled.div.attrs({
  className: 'has-text-centered',
  ref: 'local'
})`
background: linear-gradient(30deg, rgba(138,106,148,1) 12%, rgba(171,69,171,1) 87%);
height: 144px;
width: 200px;
border-radius: 5px;
display: flex;
align-items: center;
color: #fff;
padding: 5px;
`;

const ErrorNotification = styled.div.attrs({
  className: 'notification is-warning has-text-centered'
})`
margin-top: 10px;
`;


const MenuLabel = styled.div.attrs({
  className: 'menu-label'
})`
font-size: 14px;
text-transform: none;
letter-spacing: 0em;
`;

const MenuLabelCentered = styled.div.attrs({
  className: 'menu-label has-text-centered'
})`

text-transform: none;
letter-spacing: 0em;
`;

const Menu = styled.aside.attrs({
  className: 'menu'
})`
max-width: 13rem;
padding-right: 10px;
border-right: 1px solid rgba(171,69,171,1);
`;

const RoomNameEntry = styled.input.attrs({
  className: 'is-size-4'
})`
//background: linear-gradient(30deg, rgba(138,106,148,1) 12%, rgba(171,69,171,1) 87%);
background: #f6f0fb;
//border-radius: 2px;
border: none;
box-shadow: none;
border-bottom: 5px solid rgba(171,69,171,1);
text-align: left;
padding-top: 2px;
padding-bottom: 2px;
color: rgba(171,69,171,1);
:focus: {
outline-width: 0;
box-shadow: none;
border-bottom: 5px solid rgba(171,69,171,1);
}
.textarea {
color: rgba(171,69,171,1);
}
::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
    color: rgba(171,69,171,1);;
    opacity: 0.5; /* Firefox */
}

:-ms-input-placeholder {
    color: rgba(171,69,171,1);
    opacity: 0.5; /* Firefox */
}

::-ms-input-placeholder { /* Microsoft Edge */
    color: rgba(171,69,171,1);
opacity: 0.5;
}
`;


const RenderVideos = ({inRoom, webRtcPeers, roomName, displayName,
                       handleKeyPress, handleDisplayNameChange, handleRoomNameChange,
                       savedDisplayName,
                       handleReadyClick,
                       clearJoinRoomError,
                       joinRoomError,
                       joinButtonDisabled,
                       webrtc, chat}) =>
      {
        //console.log("webrtc peers:", webRtcPeers);
        if (webRtcPeers.length > 0) {
          return (
            <div class="column">
              <RemoteVideoContainer ref = "remote" peers = {webRtcPeers} chat={chat}/>
            </div>
          );
        } else {
          return (
            <div class="column">
              <div class="columns has-text-centered is-centered">
                {!inRoom ?
                  <div>
                      <div class='has-text-centered column is-half' style={{whiteSpace: 'nowrap'}}>
                          <div class="columns">
                              <div class="column">
                                  <h2 class="is-size-4">Joining room</h2>
                                </div>
                                <div class="column">
                                    <RoomNameEntry
                                        type="text"
                                        name="name"
                                        placeholder="my-room-name"
                                        value={roomName}
                                        onChange={event => handleRoomNameChange(event.target.value)}/>
                                  </div>
                            </div>
                        </div>
                        <div class='has-text-centered column is-half' style={{whiteSpace: 'nowrap'}}>
                            <div class="columns">
                                <div class="column">
                                    <h2 class="is-size-4">With display name </h2>
                                  </div>
                                  <div class="column">
                                      <RoomNameEntry
                                          type="text"
                                          name="name"
                                          placeholder="Your Name"
                                          value={displayName}
                                          onKeyPress={ (event) => handleKeyPress(event, webrtc) }
                                          onChange={event => handleDisplayNameChange(event.target.value)}/>
                                    </div>
                              </div>
                          </div>
                          <div class='has-text-centered is-centered column' >
                              <a class="button is-outlined is-primary"
                                   style={{'marginTop': '10px'}}
                                   disabled={joinButtonDisabled}
                                   onClick={handleReadyClick}>Join Room</a>
                                { joinRoomError &&
                                  <ErrorNotification>
                                      <button class="delete" onClick={clearJoinRoomError}></button>
                                        {joinRoomError}
                                    </ErrorNotification>
                                    }
                            </div>
                    </div>
                    :
                    <div class="columns has-text-centered is-centered is-vcentered"
                           style={{minHeight: "80vh", minWidth: "80vw"}}>
                        <div class="column is-vcentered has-text-centered">
                          <h1>Nobody else here...</h1>
                          <ScaleLoader color={"#8A6A94"}/>
                          </div>
                    </div>
                    }
              </div>
            </div>
          );
        }};

class Chat extends Component {
  constructor (props) {
    super(props);
    this.onUnload = this.onUnload.bind(this);
  }

  componentDidMount() {
    let localVideo = ReactDOM.findDOMNode(this.refs.local);
    this.webrtc = addWebRtcListeners(this.props.user.email,
                                     localVideo,
                                     this.props.dispatch,
                                     store.getState);
    console.log("> webrtc connection ID:", this.webrtc.connection.connection.id);

    // leave chat when window unloads
    window.addEventListener("beforeunload", this.onUnload);
  }

  onUnload(event) {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>UNLOADING!", event, this.props.riff.meetingId);
    if (!this.props.inRoom) {
      return undefined;
    }

    if (event) {
      event.preventDefault();
    }

    if (event) {
      console.log(event);
      event.returnValue = "If you leave, you'll have to re-join the room.";
      return true;
    }
    this.props.leaveRiffRoom(
      this.props.riff.meetingId,
      this.props.user.uid).then(function (res) {

        console.log("remove participant:", res);
        this.props.leaveRoom();
        this.webrtc.leaveRoom();
        if (this.webrtc.stopSibilant) {
          this.webrtc.stopSibilant();
        }
      }.bind(this));
  };

  componentWillUnmount() {
    this.webrtc.stopLocalVideo();
    this.onUnload();
    window.removeEventListener('beforeunload', this.onUnload);
  }

  videoStyle() {
    if (this.props.mediaError) {
      return {'borderRadius': '5px', 'display': 'none'};
    } else {
      return {'borderRadius': '5px', 'display': 'inline-block'};
    }
  }

  placeholderStyle() {
    if (!this.props.mediaError) {
      return {'borderRadius': '5px', 'display': 'none'};
    } else {
      return {'borderRadius': '5px', 'display': 'inline-block'};
    }
  }

  render () {
    return (
      <div class="section">
        <div class="columns">
          <Menu>
            {!this.props.inRoom ?
              <MenuLabelCentered>
                  Check your media and add a room name and display name before joining.
                </MenuLabelCentered> :
                <MenuLabelCentered>
                    {this.props.inRoom && <LeaveRoomButton webrtc={this.webrtc} leaveRiffRoom={this.props.leaveRiffRoom} leaveRoom={this.props.leaveRoom}/>}
             </MenuLabelCentered>
            }
            {this.props.inRoom &&
                  <MenuLabel>Name: <span style={{fontWeight: 'bold'}}>{this.props.displayName}</span></MenuLabel>
                  }
                  {this.props.inRoom &&
                    <MenuLabel>Room: <span style={{fontWeight: 'bold'}}>{this.props.roomName}</span></MenuLabel>
                    }

            <video className = "local-video"
                   id = 'local-video'
                   // this is necessary for thumos. yes, it is upsetting.
                   height="175" width = "250"
                   ref = "local"
                   style={this.videoStyle()}/>
              <canvas id = "video-overlay"
                      height = "175" width = "250"
                      style={{'display': 'none'}}>
              </canvas>
            {this.props.mediaError &&
                <VideoPlaceholder style={this.placeholderStyle()}>
                  <p> Can't see your video? Make sure your camera is enabled.
                    </p>
                </VideoPlaceholder>}
              <p class="menu-label">{this.props.user.email}</p>
              {this.props.inRoom &&
                <div class="has-text-centered">
                    <div class="control">
                        {this.props.isAudioMuted ?
                          <a class="button is-rounded is-danger"  onClick={event => this.props.handleMuteAudioClick(event, this.props.isAudioMuted, this.webrtc)}>
                              <MaterialIcon icon="mic_off"/>
                            </a>
                          :
                            <a class="button is-rounded" onClick={event => this.props.handleMuteAudioClick(event, this.props.isAudioMuted, this.webrtc)}>
                                <MaterialIcon icon="mic"/>
                              </a>
                          }
                          </div>
                  </div>
              }
            {!this.props.inRoom ?
              <div class="has-text-centered">
                  <div class="level">
                      <div class="level-item" style={{'maxWidth': '20%'}}>
                          <MaterialIcon icon="mic"></MaterialIcon>
                        </div>
                        <div class="level-item">
                            <progress style={{maxWidth: '100%'}} class="progress is-success" value={this.props.volume} max="100"></progress>
                          </div>
                    </div>
                    <p>Having trouble? <a href="/room">refresh the page</a> and allow access to your camera and mic.</p>
                    </div>
                :
                <MeetingMediator></MeetingMediator>
            }
          </Menu>
          <RenderVideos inRoom={this.props.inRoom}
                        roomName={this.props.roomName}
                        displayName={this.props.displayName}
                        handleKeyPress={this.handleKeyPress}
                        handleDisplayNameChange={this.props.handleDisplayNameChange}
                        savedDisplayName={this.props.savedDisplayName}
                        webRtcPeers={this.props.webRtcPeers}
                        handleRoomNameChange={this.props.handleRoomNameChange}
                        handleReadyClick={(event) => this.props.handleReadyClick(event, this.name, this.props.chat, this.props.auth, this.props.riff, this.webrtc)}
            joinButtonDisabled={(this.props.roomName == '' || this.props.displayName == '')}
            clearJoinRoomError={this.props.clearJoinRoomError}
            joinRoomError={this.props.joinRoomError}
            chat={this.props.chat}
            webrtc={this.webrtc}>
          </RenderVideos>
        </div>
      </div>
    );
  }
}


export default withRouter(connect(mapStateToProps, mapDispatchToProps, mergeProps)(Chat));

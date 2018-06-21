import React from 'react';
import ReactDOM from 'react-dom';
import SimpleWebRTC from 'simplewebrtc';
import RemoteVideoContainer from './RemoteVideoContainer';
import Sibilant from 'sibilant-webaudio';
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';
import captureSpeakingEvent from '../libs/audio';
import io from 'socket.io-client';
import cookie from 'react-cookie';
import Mediator from '../libs/charts';
import MuteButton from './MuteButton';
import {log} from '../libs/utils';
import trackFace from '../libs/face'
require('dotenv').config()


class WebRtc extends React.Component {

  constructor(props) {
    super(props);
    this.addVideo = this.addVideo.bind(this);
    this.removeVideo = this.removeVideo.bind(this);
    this.readyToCall = this.readyToCall.bind(this);
    this.state = {
      peers: [],
      muted: false
    }

    this.connectToServer();

    // rssi value over which we will consider a speaking event
    this.THRESHOLD = process.env.SPEAKING_THRESHOLD || -35;
    this.server_email = window.client_config.dataServer.email;
    this.server_password = window.client_config.dataServer.password;
    this.signalmaster_url = window.client_config.signalMaster.url;

    log("using email and pass: ", this.server_email, this.server_password)
  }

  connectToServer() {
    // we create our socket + initialize our feathers app with it
    let dataserverPath = window.client_config.dataServer.path || '';
    dataserverPath += '/socket.io';
    this.socket = io(window.client_config.dataServer.url, {
      'path': dataserverPath,
      'transports': [
        'websocket',
        'flashsocket',
        'htmlfile',
        'xhr-polling',
        'jsonp-polling'
      ]
    })

    this.app = feathers()
      .configure(socketio(this.socket))
      .configure(auth({jwt: {}, local: {}}));
  }

  componentDidMount() {
    console.log("signalmaster url:", this.signalmaster_url)
    //this.signalmaster_url = "http://carcosa.media.mit.edu/"
    let signalmasterPath = window.client_config.signalMaster.path || '';
    signalmasterPath += '/socket.io';
    let webRtcConfig = {
      localVideoEl: ReactDOM.findDOMNode(this.refs.local),
      remoteVideosEl: "", // handled by our component
      autoRequestMedia: true,
      url: this.signalmaster_url,
      socketio: {
        path: signalmasterPath,
        forceNew: true,
      },
      nick: this.props.options.username,
      debug: !!window.client_config.webrtc_debug,
    };
    log('WebRTC config: ', webRtcConfig);
    this.webrtc = new SimpleWebRTC(webRtcConfig);

    this.webrtc.on('connectionReady', function (sessionId) {
        log("connected! session id:", sessionId)
        log("current peers:", this.webrtc.getPeers())
        log("webrtc object:", this.webrtc)
        log("webrtc connection object:", this.webrtc.connection)
    })

    // register our webrtc functions with the corresponding events
    this.webrtc.on('videoAdded', this.addVideo);
    this.webrtc.on('videoRemoved', this.removeVideo);
    this.webrtc.on('readyToCall', this.readyToCall);

    log("webrtc component mounted");
  }

  componentDidUpdate() {
    // we need to make sure meeting mediator updates when
    // our participants change
    // in the future this can be handled by state
    if (this.mm) {
      this.mm.update_users(this.getParticipants());
    }
  }

  addVideo(video, peer) {
    log('PEER adding video', peer);
    // we let the child component handle the dirty work
    this.setState(function(state) {
      return {
        peers: state.peers.concat(peer)
      }
    })
  }

  removeVideo(video, peer) {
    // remove the peer from state,
    // our child component will handle it automatically

    // sanity check / make sure we weren't called erroneously
    if (!peer) {
      return;
    }

    log("removing peer: " + peer.id);
    this.setState(function(state) {
      return {
        peers: state.peers.filter((x) => x.id !== peer.id)
      }
    });

    log('video removed ', peer);
  }

  getUserId() {
    return this.props.options.username;
  }

  getUserEmail() {
    return this.props.options.email;
  }

  getRoomname() {
    return this.props.options.roomname
  }

  getName() {
    return this.props.options.name;
  }

  recordMeetingJoin() {
    // transform participants to fit the required
    // format of the rhythm-server
    let parts = this.getParticipants().map(
        (user) => { return { "participant": user } });

    return this.socket.emit('meetingJoined', {
      participant: this.getUserId(),
      email: this.getUserEmail(),
      name: this.getName(),
      participants: parts,
      room: this.getRoomname(),
      meetingUrl: window.location.href,
      consent: true,
      consentDate: new Date().toISOString(),
      token: this.token
    })
  }

  getLocalStream() {
    // this is gross. but, it seems simplewebrtc doesn't
    // support getting the local stream with its API
    // please forgive me for my sins
    // we need this to hook in the audio/video data collection
    return this.webrtc.webrtc.localStreams[0];
  }

  readyToCall() {
    log("ready");
    log("webrtc object:", this.webrtc)
    this.webrtc.joinRoom(this.props.options.roomname, function (err, rd) {
        log("err:", err, "rd:", rd);
        console.log("room description:", rd);
         // we do this after joinRoom to be sure the stream exists
        // set threshold to appropriate value
        this.speakingEvents = new Sibilant(this.getLocalStream(), {passThrough: false, threshold: this.THRESHOLD});
        // authenticate, and, on success, call record()
        this.authenticate();
    }.bind(this));
  }


  getParticipants() {
    // return an array of the participants' usernames
    let parts = this.state.peers.map(peer => peer.nick);
    parts.push(this.getUserId());
    return parts;
  }

  getInfo() {
    return {
      'username': this.getUserId(),
      'roomname': this.getRoomname(),
      'token': this.token
    };
  }

  startMM() {
    this.mm = new Mediator(
        this.app,
        this.getParticipants(),
        this.getUserId(),
        this.getRoomname()
    );
  }

  record() {
    // begin tracking user events and sending them to server
    this.speakingEvents.bind(
      'stoppedSpeaking',
      captureSpeakingEvent(this.app, this.getInfo())
    );
    this.startMM();
    if (window.client_config.faceTracking.enabled) {
      trackFace(this.app, this.getUserId(), this.getRoomname(), this.props.id);
    }

  }

  authenticate() {
    /**
     * Authenticate w/ the Rhythm server and, on success,
     * begin recording events and offloading to server
     *
     * Calls the given function upon auth success
     */
    this.app.authenticate({
      strategy: 'local',
      email: this.server_email,
      password: this.server_password,
    }).then(function (result) {
      log("auth result!: ", result);
      this.token = result.accessToken;
      return this.recordMeetingJoin();
    }.bind(this)).catch(function (err) {
      log('auth ERROR:', err);
    }).then(function (result) {
      log('meeting result:', result);
      // we've confirmed auth & meeting join- start communication w/ server
      this.record();
    }.bind(this));
  }

  mute() {
    this.webrtc.mute();
    log("muted!");
  }

  unmute() {
    this.webrtc.unmute();
    log("unmuted!");
  }

  muteClick() {
    // mute the webrtc stream and update the state

    if (this.state.muted) {
      this.unmute();
    } else {
      this.mute();
    }

    this.setState(function(state) {
      return {
        peers: state.peers,
        muted: !state.muted
      }
    });
  }

  render() {
    return (<div>
              <aside id = "sidebar">
                <div id = 'local-container'>
                  <video className = "local-video"
                    id = {this.props.id}
                    // this is necessary for thumos. yes, it is upsetting.
                    height = "225" width = "300"
                    ref = "local" >
                  </video>
                  <canvas id = "video-overlay"
                    height = "225" width = "300">
                  </canvas>
                </div>
                <MuteButton onClick = {this.muteClick.bind(this)} muted = {this.state.muted}/>
                <div id = "meeting-mediator"/>
              </aside>
              <RemoteVideoContainer ref = "remote" peers = {this.state.peers}/>
            </div >
        );
  }
}

export default WebRtc

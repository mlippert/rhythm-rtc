import React from 'react';
import {log} from '../libs/utils';

class RemoteVideoContainer extends React.Component {
  constructor(props) {
    super(props);
  }


  videos() {
    // there may be a more elegant way to do this
    // but i can't think of it in < 3 minutes
    let peerLen = this.props.peers.length;
    let colVal;
    if (peerLen <= 1) {
      colVal = "s12 one-to-two-remote";
    } else if (peerLen === 2) {
      colVal = "s6 one-to-two-remote";
    } else if (peerLen < 5) {
      colVal = "s6 three-to-five-remote";
    } else {
      colVal = "s4 six-plus-remote";
    }

    return this.props.peers.map(function(peer) {
      return (
        <div className = {"col videoContainer remotes " + colVal} id = {"container_" + peer.id}>
        </div>
      );
    });
  }


  componentWillUpdate(nextProps, nextState) {
    // OK SO THIS IS GROSS BUT SIMPLEWEBRTC REQUIRES DOM MANIPULATION
    // convert to array of IDs for easier manipulation
    let newPeerList = nextProps.peers.map((peer) => peer.id);
    let currentPeerList = this.props.peers.map((peer) => peer.id);

    log("CURRENT PEER LIST " + currentPeerList);
    log("NEW PEER LIST " + newPeerList);


    //remove the missing stream(s) from the DOM
    currentPeerList.forEach(function(peer) {
      log("removing peer: " + peer + "from container container_" + peer);
      let container = document.getElementById("container_" + peer);
      // just in case, we iterate
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    });

  }

  componentDidUpdate() {
    // this is not very react-y but afaik the only way to get this to work
    // after we add the containers to the DOM via the react state change,
    // we have to attach the videos to their respective containers
    this.props.peers.map(function(peer) {
      // the container we added
      let container = document.getElementById('container_' + peer.id);
      if (!container.hasChildNodes()) {
        log("Adding peer: " + peer.id + "to container container_" + peer.id);
        let video = peer.videoEl;
        container.appendChild(video);
        video.load();
        video.play();
        video.oncontextmenu = function() {
          return true;
        };
      }

    });

    this.props.peers.map(function(peer) {
      peer.videoEl.play();
    });

  }
  render() {
    return (
      <div className = "remotes" id = "remoteVideos">
        <div ref = "remotes" className = "row">
          {this.videos()}
        </div>
      </div>
    );
  }

}

export default RemoteVideoContainer

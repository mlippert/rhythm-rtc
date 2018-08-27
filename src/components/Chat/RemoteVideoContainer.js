import React from 'react';
import {log} from '../../libs/utils';




class PeerVideo extends React.Component {
  constructor (props) {
    super(props);
    this.appendVideo = this.appendVideo.bind(this);
  }

  appendVideo (el) {
    console.log("appending?")
    if (el !== null) {
      let video = this.props.peer.videoEl;
      video.style.setProperty('overflow', 'hidden');
      video.style.setProperty('display', 'block');
      video.style.setProperty('width', '100%');
      video.style.setProperty('height', '100%');
      video.style.setProperty('margins', '5px');
      video.style.setProperty('object-fit', 'cover');
      video.style.setProperty('border-radius', '5px');
      el.appendChild(video);
    }
  }

  render () {
    if (this.props.peerLength < 4) {
      console.log("rendering over 3 peers");
      return (
        <div className = {"videoContainer remotes column"}
             id = {"container_" + this.props.peer.id}
             style = {{'width': '100vh', 'height': '75vh', 'padding': '0.25rem'}}
             ref={this.appendVideo}>
        </div>
      );
    } else {
      return (
        <div className = {"videoContainer remotes column is-narrow"}
             id = {"container_" + this.props.peer.id}
             style = {{'width': '50vh', 'height': '40vh', 'padding': '0.25rem'}}
             ref={this.appendVideo}>
        </div>
      );
    }
  }
}

class RemoteVideoContainer extends React.Component {
  constructor(props) {
    super(props);
    console.log("remote video props:", props);
  }

  videos() {
    let peerLength = this.props.peers.length;
    console.log("rendering", peerLength, "peers....");
    return this.props.peers.map(function (peer) {
      return (<PeerVideo key={ peer.id } peer = { peer } peerLength = {peerLength}></PeerVideo>);
    });
  };

  render() {
    return (
      <div className = "remotes" id = "remoteVideos">
        <div ref = "remotes" className = "columns is-multiline is-centered is-mobile">
          {this.videos()}
        </div>
      </div>
    );
  }

}

export default RemoteVideoContainer;

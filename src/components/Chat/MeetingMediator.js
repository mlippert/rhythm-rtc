import util from 'util';
import * as d3 from 'd3';
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import Mediator from '../../libs/charts';
import { app, socket} from "../../riff";

const mapStateToProps = state => ({
  turns: state.riff.turns,
  transitions: state.riff.transitions,
  user: state.auth.user,
  roomName: state.chat.roomName,
  riffParticipants: state.riff.participants,
  riff: state.riff
});

const mapDispatchToProps = dispatch => ({
});

class MeetingMediator extends Component {
  componentDidUpdate() {
    if (this.mm) {
      this.mm.update_users(this.props.riffParticipants);
    }
  }

  componentDidMount() {
    this.startMM();
  }

  startMM() {
    this.mm = new Mediator(
      app,
      this.props.riffParticipants,
      this.props.user.uid,
      this.props.roomName
    );
  }

  render() {
    return (
      <div id = "meeting-mediator">
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MeetingMediator);

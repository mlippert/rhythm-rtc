import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import auth from "../../firebase";
import moment from 'moment';
import {
  loadRecentMeetings,
  selectMeeting,
  loadMeetingData}
from "../../redux/actions/dashboard";
import { push } from 'connected-react-router';
import { riffAddUserToMeeting } from '../../redux/actions/riff';
import lifecycle from 'react-pure-lifecycle';
import DashboardView from './DashboardView';

const mapStateToProps = state => ({
  user: state.auth.user,
  riff: state.riff,
  riffAuthToken: state.riff.authToken,
  meetings: state.dashboard.meetings,
  numMeetings: state.dashboard.numMeetings,
  fetchMeetingsStatus: state.dashboard.fetchMeetingsStatus,
  fetchMeetingsMessage: state.dashboard.fetchMeetingsMessage,
  lastFetched: state.dashboard.lastFetched,
  shouldFetch: state.dashboard.shouldFetch,
  selectedMeeting: state.dashboard.selectedMeeting || "",
  processedUtterances: state.dashboard.processedUtterances,
  statsStatus: state.dashboard.statsStatus,
});

const mapDispatchToProps = dispatch => ({
  loadRecentMeetings: (uid) => {
    dispatch(loadRecentMeetings(uid));
  },
  handleRefreshClick: (event, uid) => {
    dispatch(loadRecentMeetings(uid));
  },
  handleMeetingClick: (event, meeting) => {
    event.preventDefault();
    console.log("selected meeting", meeting._id);
    dispatch(selectMeeting(meeting));
    dispatch(loadMeetingData(meeting._id));
  },
});


const formatMeetingDuration = (meeting) => {
  if (!meeting.endTime) {
    meeting = { ...meeting, endTime: new Date()  };
  };
  let diff = moment(new Date(meeting.endTime)).diff(moment(new Date(meeting.startTime)), 'minutes');
  return diff + " minutes";
}

const mapMergeProps = (stateProps, dispatchProps, ownProps) => ({
  ...stateProps,
  ...dispatchProps,
  ...ownProps,
  selectedMeetingDuration: formatMeetingDuration(stateProps.selectedMeeting)
});

const componentDidUpdate = (props) => {
  console.log("component updating...", props.riffAuthToken);
  if (props.riffAuthToken && props.shouldFetch) {
    console.log("going to load recent meetings");
    props.loadRecentMeetings(props.user.uid);
  }
}

const componentDidMount = (props) => {
  if (props.riffAuthToken) {
    console.log("going to load recent meetings");
    props.loadRecentMeetings(props.user.uid);
  }
};

const methods = {
  componentDidUpdate,
  componentDidMount
};

const Dashboard = lifecycle(methods)(DashboardView);

export default withRouter(
  connect(mapStateToProps,
          mapDispatchToProps,
          mapMergeProps)(Dashboard));

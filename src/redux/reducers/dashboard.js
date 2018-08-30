import {
  DASHBOARD_FETCH_MEETINGS,
  DASHBOARD_SELECT_MEETING,
  DASHBOARD_FETCH_MEETING_STATS,
  LOG_OUT
} from '../constants/ActionTypes';

const initialState = {
  numMeetings: 0,
  fetchMeetingsStatus: 'loading',
  fetchMeetingsMessage: 'loading',
  meetings: [],
  lastFetched: new Date('January 1, 2000 00:01:00'),
  shouldFetch: true,
  numMeetings: 0,
  selectedMeeting: "",
  processedUtterances: [],
  statsStatus: 'loading'
};

const dashboard = (state=initialState, action) => {
  switch(action.type) {
  case(LOG_OUT):
    console.log("log out in dashboard");
    return initialState;
  case(DASHBOARD_FETCH_MEETINGS):
    //console.log("time diff:", (((new Date()).getTime() - new Date(state.lastFetched).getTime())/1000) > 5)
    return {...state, fetchMeetingsStatus: action.status,
            fetchMeetingsMessage: action.message,
            meetings: action.meetings ? action.meetings : state.meetings,
            numMeetings: action.meetings ? action.meetings.length : state.meetings.length,
            lastFetched: new Date(),
            shouldFetch: (((new Date()).getTime() - new Date(state.lastFetched).getTime())/(1000) > 5*60)};
  case(DASHBOARD_SELECT_MEETING):
    return {...state, selectedMeeting: action.meeting};
  case(DASHBOARD_FETCH_MEETING_STATS):
    return {...state,
            statsStatus: action.status,
            processedUtterances: action.processedUtterances ? action.processedUtterances : state.processedUtterances};
  default:
    return state;
  }
};

export default dashboard;

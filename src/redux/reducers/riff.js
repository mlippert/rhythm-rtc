import {
  RIFF_AUTHENTICATE_SUCCESS,
  RIFF_AUTHENTICATE_FAIL,
  RIFF_PARTICIPANTS_CHANGED,
  RIFF_TURN_UPDATE,
  RIFF_MEETING_ID_UPDATE
} from '../constants/ActionTypes';

const initialState = {
  meetingId: null,
  authToken: null,
  authError: null,
  participants: [],
  turns: [],
  transitions: []
};

const riff = (state = initialState, action) => {
  switch(action.type) {
  case(RIFF_AUTHENTICATE_SUCCESS):
    return {...state, authToken: action.token, authError: null};
  case(RIFF_AUTHENTICATE_FAIL):
    return {...state, authToken: null, authError: action.error};
  case(RIFF_PARTICIPANTS_CHANGED):
    return {...state, participants: action.participants};
  case(RIFF_TURN_UPDATE):
    return {...state, turns: action.turns, transitions: action.transitions};
  case(RIFF_MEETING_ID_UPDATE):
    return {...state, meetingId: action.meetingId};
  default:
    return state;
  }
}

export default riff;

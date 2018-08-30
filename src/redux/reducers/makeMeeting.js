import {
  MAKE_MEETING_INPUT_CHANGE,
} from '../constants/ActionTypes'

const initialState = {
  roomName: '',
  error: null,
  joiningRoom: false
}

// Note that a risk here is that room state is persisted when a user closes a
// window. this could cause some weird behavior, let's remember that.
const makeMeeting = (state = initialState, action) => {
  switch (action.type) {
  case(MAKE_MEETING_INPUT_CHANGE):
    return {...state, roomName: action.roomName}
    // issue here is to send join room event, have make meeting reducer do a
    // redirect and have... what? update in two different parts of state?
  default:
    return state
  }
};

export default makeMeeting;

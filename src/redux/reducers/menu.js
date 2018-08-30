import {
  OPEN_NAV_MENU,
  CLOSE_NAV_MENU
} from '../constants/ActionTypes';

const initialState = {
  menuOpen: false
};

const menu = (state = initialState, action) => {
  switch(action.type) {
  case(OPEN_NAV_MENU):
    return {...state, menuOpen: true};
  case(CLOSE_NAV_MENU):
    return {...state, menuOpen: false};
  default:
    return state;
  }
}

export default menu;

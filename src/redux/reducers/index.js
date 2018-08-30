import { combineReducers } from 'redux';
import auth from './auth';
import chat from './chat';
import menu from './menu';
import dashboard from './dashboard';
import makeMeeting from './makeMeeting';
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web and AsyncStorage for react-native
import { connectRouter } from 'connected-react-router'
import { persistReducer } from 'redux-persist'
import riff from './riff';
import browserHistory from "../../history"


const rootPersistConfig = {
  key: 'root',
  storage,
  blacklist: ['router', 'chat', 'riff']
};

// we want our webRTC peers to be populated by our server,
// not state.
const chatPersistConfig = {
  key: 'chat',
  storage: storage,
  blacklist: ['webRtcPeers', 'volume', 'roomName', 'inRoom', 'joiningRoom', 'getMediaError']
};

const dashPersistConfig = {
  key: 'dashboard',
  storage: storage,
  blacklist: ['shouldFetch', 'fetchMeetingStatus', 'statsStatus']
};

export default persistReducer(
  rootPersistConfig,
  connectRouter(browserHistory)(
    combineReducers({
      auth: auth,
      riff: riff,
      menu: menu,
      dashboard: dashboard,
      chat: persistReducer(chatPersistConfig, chat),
      makeMeeting: makeMeeting
    })));

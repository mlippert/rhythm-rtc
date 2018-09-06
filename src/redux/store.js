import { Provider } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web and AsyncStorage for react-native
import thunk from 'redux-thunk';
import browserHistory from "../history";
import rootReducer from './reducers';
import addRiffListener from './listeners/riff';


const composeEnhancers = composeWithDevTools({
  // Specify custom devTools options
});

// Apply the middleware to the store
let store = createStore(
  rootReducer,
  composeEnhancers(
    applyMiddleware(thunk),
    applyMiddleware(routerMiddleware(browserHistory))
  ));

addRiffListener(store.dispatch, store.getState);

let persistor = persistStore(store);
export {store, persistor};


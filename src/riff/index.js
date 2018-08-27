import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import auth from '@feathersjs/authentication-client';
import io from 'socket.io-client';

// access to api

let dataserverPath = window.client_config.dataServer.path || '';
dataserverPath += '/socket.io';

export const socket = io(window.client_config.dataServer.url, {
  'path': dataserverPath,
  'transports': [
    'websocket',
    'flashsocket',
    'htmlfile',
    'xhr-polling',
    'jsonp-polling'
  ]
});


export var app = feathers()
  .configure(socketio(socket))
  .configure(auth({jwt: {}, local: {}}));

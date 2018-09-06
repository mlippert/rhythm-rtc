import {log} from './utils';

export default function captureSpeakingEvent(server, userinfo) {
  /*
   * returns a function to consume speaking data + offload it to server,
   * closing over the server + userinfo args
   */
  return function(data) {
    log(userinfo)
    server.service('utterances').create({
      'participant': userinfo.username,
      'room': userinfo.roomName,
      'startTime': data.start.toISOString(),
      'endTime': data.end.toISOString(),
      'token': userinfo.token
    }).then(function (res) {
      log('speaking event recorded!', res);
      var start = new Date(res['startTime']);
      var end = new Date(res['endTime']);
      var duration = end - start;
      log(duration);
    }).catch(function (err) {
      log('ERROR:', err)
    })
  }
}

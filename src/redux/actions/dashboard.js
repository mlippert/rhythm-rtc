import {
  DASHBOARD_UPDATE_MEETING_LIST,
  DASHBOARD_FETCH_MEETINGS,
  DASHBOARD_SELECT_MEETING,
  DASHBOARD_FETCH_MEETING_STATS
} from '../constants/ActionTypes';
import _ from 'underscore';
import { app, socket} from "../../riff";
import fs from '../../firebase';

let db = fs.firestore();

export const updateMeetingList = (meetings) => {
  return {type: DASHBOARD_FETCH_MEETINGS,
          status: 'loaded',
          meetings: meetings};
};

export const selectMeeting = (meeting) => {
  return {type: DASHBOARD_SELECT_MEETING,
          meeting: meeting};
};

export const loadRecentMeetings = (uid) => dispatch => {
  dispatch({type: DASHBOARD_FETCH_MEETINGS, status: 'loading'});
  return app.service('participants').find({query: {_id: uid}}).then((res) => {
    if (res.data.length == 0) {
      // no found participants. Throw an error to break out early.
      throw new Error("no participant");
    }
    console.log(">>fetched participant:", res);
    return res.data[0];
  }).then((participant) => {
    return participant.meetings;
  }).then((meetingIds) => {
    return app.service('meetings').find({query: {_id: meetingIds}});
  }).then((meetingObjects) => {
    console.log("raw meeting objects received:", meetingObjects);
    meetingObjects = _.filter(meetingObjects, (m, idx) => {
      if (!m.endTime) {
        return true;
      }
      let durationSecs = (new Date(m.endTime).getTime() - new Date(m.startTime).getTime()) / 1000;
      //console.log("duration secs:", durationSecs)
      return durationSecs > 2*60;
    });
    if (meetingObjects.length == 0) {
      console.log("no meetings over 2 minutes", );
      throw new Error("no meetings after filter");
    }
    console.log("meeting objs after duration filter:", meetingObjects);
    return meetingObjects;
    //dispatch(updateMeetingList(meetingObjects));
  }).then(meetingObjects => {
    let pEvents = _.map(meetingObjects, (m) => {
      return app.service('participantEvents').find({query: {meeting: m._id, $limit: 500}})
    });
    return Promise.all(pEvents)
      .then(function (vals) {
        console.log("pevents in promise", vals);
        return {meetings: meetingObjects, pEvents: vals};
      });
  }).then(({meetings, pEvents}) => {
    console.log("got pevents:", pEvents);
    console.log("got meetings:", meetings);
    // only return meetings that have over 1 participant.
    let numParticipants = _.map(pEvents, pe => {
      return _.uniq(_.flatten(_.map(pe.data, (p) => { return p.participants}))).length;
    });
    // TODO: this will include meetings where someone joins but does not speak.
    // because we use the utterance data to inform our shit, the # of attendees will also be wrong.
    // right thing to do here is to try and create a service on the server that will reliably give
    // us # of attendees
    console.log("num participants:", numParticipants, meetings);
    meetings = _.filter(meetings, (m, idx) => {return numParticipants[idx] >= 2});
    console.log("kept meetings:", meetings);
    if (meetings.length == 0) {
      throw new Error("no meetings after nparticipants filter");
    }
    dispatch(updateMeetingList(meetings));
    //return meetings;
  }).catch((err) => {
    if (err.message == 'no participant') {
      dispatch({type: DASHBOARD_FETCH_MEETINGS,
                status: 'error',
                message: "No meetings found. Meetings that last for over two minutes will show up here."});
    } else if (err.message == 'no meetings after filter') {
      dispatch({type: DASHBOARD_FETCH_MEETINGS,
                status: 'error',
                message: "We'll only show meetings that lasted for over two minutes. Go have a riff!"});
    } else if (err.message == 'no meetings after nparticipants filter') {
      dispatch({type: DASHBOARD_FETCH_MEETINGS,
                status: 'error',
                message: "Only had meetings by yourself? Come back after some meetings with others to explore some insights."});
    } else {
      // infinite loop?
      console.log("Couldn't retrieve meetings", err);
      dispatch(loadRecentMeetings(uid));
    }
  });
};

let processUtterances = (utterances, meetingId) => {
  console.log("processing utterances:", utterances);
  // {'participant': [utteranceObject, ...]}
  var participantUtterances = _.groupBy(utterances, 'participant');
  // {'participant': number of utterances}
  var numUtterances = _.mapObject(participantUtterances, (val, key) => {
    return val.length;
  });
  var lengthUtterances = _.mapObject(participantUtterances, (val,key) => {
    var lengthsUtterances = val.map((utteranceObject) => {
      return (new Date(utteranceObject.endTime).getTime() - new Date(utteranceObject.startTime).getTime()) / 1000;
    });
    return lengthsUtterances.reduce((previous, current) => current + previous, 0);
  });
  // {'participant': mean length of utterances in seconds}
  var meanLengthUtterances = _.mapObject(participantUtterances, (val, key) => {
    var lengthsUtterances = val.map((utteranceObject) => {
      return (new Date(utteranceObject.endTime).getTime() - new Date(utteranceObject.startTime).getTime()) / 1000;
    });
    var sum = lengthsUtterances.reduce((previous, current) => current + previous, 0);
    return sum / lengthsUtterances.length;
  });
  let participants = Object.keys(participantUtterances);

  var visualizationData = participants.map((participantId) => {
    return {
      //    name: participant['name'],
      participantId: participantId,
      lengthUtterances: participantId in lengthUtterances ? lengthUtterances[participantId] : 0,
      numUtterances: participantId in numUtterances ? numUtterances[participantId] : 0,
      meanLengthUtterances: participantId in meanLengthUtterances ? meanLengthUtterances[participantId] : 0
    };
  });

  let promises = _.map(visualizationData, (v) => {
    let docId = v.participantId + "_" + meetingId;
    let docRef = db.collection('meetings').doc(docId);
    return docRef.get().then((doc) => {
      return Object.assign(v, {displayName: doc.displayName,
                               meetingId: meetingId});
    });
  });
  return Promise.all(promises);
  //console.log("data returned:", visualizationData);
  //return visualizationData;
};

export const loadMeetingData = (meetingId) => dispatch => {
  dispatch({type: DASHBOARD_FETCH_MEETING_STATS, status: 'loading'});
  console.log("finding utterances for meeting", meetingId);
  return app.service('utterances').find({query: {meeting: meetingId, $limit: 10000}})
    .then((utterances) => {
      // console.log("utterances", utterances);
      // console.log("processed:", processUtterances(utterances, meetingId));
      return processUtterances(utterances, meetingId);
    }).then(processedUtterances => {
      dispatch({type: DASHBOARD_FETCH_MEETING_STATS,
                status: 'loaded',
                processedUtterances: processedUtterances});
    }).catch(err => {
      console.log("couldn't retrieve meeting data", err);
    });
};

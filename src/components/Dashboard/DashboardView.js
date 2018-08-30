import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import styled, { injectGlobal, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import ReactChartkick, { ColumnChart, PieChart } from 'react-chartkick';
import {ScaleLoader} from 'react-spinners';
import MaterialIcon from 'material-icons-react';
import Chart from 'chart.js';
import moment from 'moment';

ReactChartkick.addAdapter(Chart);

const MeetingTabs = styled.div.attrs({
  className: 'tabs is-boxed is-size-5'
})`
overflow-y: scroll;
max-height: 80vh;
ul {
-webkit-flex-direction: column;
flex-direction: column;
}
li+li {
margin-left: 0
}
`;

const formatChartData = (processedUtterances, participantId) => {
  console.log("formatting:", processedUtterances);

  let ids = _.uniq(_.map(processedUtterances, (p) => { return p.participantId}));

  let data = _.map(processedUtterances, (p, idx) => {
    let label = (p.participantId == participantId ? 'You' : "User " + idx);
    //console.log(p)
    // use our display name from firebase if we've got it.
    label = p.displayName ? p.displayName : label;
    return [label, p.lengthUtterances];
  });
  let colors = _.map(processedUtterances, (p) => {
    if (p.participantId == participantId) {
      return "#ab45ab";
    } else {
      return "#bdc3c7";
    }
  });
  return {data: data, colors: colors};
};

const TurnChart = ({processedUtterances, participantId}) => {
  let r = formatChartData(processedUtterances, participantId);
  console.log("data for chart:", r.data);
  return (
    <PieChart donut={true} height="500px" width="800px" data={r.data} title="Seconds spoken" colors={r.colors}/>
  );
};

const MeetingView = ({meeting, handleMeetingClick}) => {
  let m = moment(meeting.startTime).format("ha MMM Do");
  return (
    <li><a onClick = {(event) => handleMeetingClick(event, meeting)}>
        <p>{m}</p>
    </a></li>
  );
};

const MeetingList = ({fetchMeetingsStatus, fetchMeetingsMessage, meetings, handleMeetingClick}) => {
  let meetingTiles = meetings.map((meeting) => {
    return (<MeetingView key={meeting._id} meeting={meeting} handleMeetingClick={handleMeetingClick}/>);
  });
  console.log("fetchmeetingstatus:", fetchMeetingsStatus);
  console.log("rendering meeting list");
  return (
    <MeetingTabs>
      <ul>
        {meetingTiles}
      </ul>
    </MeetingTabs>
  );
};

const DashboardView = ({user, riffAuthToken, meetings,
                        fetchMeetingsStatus, fetchMeetingsMessage, numMeetings,
                        handleMeetingClick, selectedMeeting,
                        processedUtterances, statsStatus,
                        handleRefreshClick, selectedMeetingDuration}) =>
      {
        console.log("fetch meetings status (view)", fetchMeetingsStatus, meetings);

        if (fetchMeetingsStatus == 'loading') {
          return (
            <div class="columns is-centered has-text-centered">
              <div class="column">
                <ScaleLoader color={"#8A6A94"}/>
              </div>
            </div>
          );
        } else if (fetchMeetingsStatus == 'error') {
          return (
            <div class="columns is-centered has-text-centered is-vcentered" style={{height: '90vh'}}>
              <div class="column is-vcentered" style={{alignItems: 'center'}}>
                <p class="is-size-4 is-primary">{fetchMeetingsMessage}</p>
                <ScaleLoader color={"#8A6A94"}/>
              </div>
            </div>
          );
        } else {
          return (
            <div>
              <div class="columns">
                <div class="column is-one-fifth has-text-centered">
                  <a class="button is-rounded"  onClick={event => handleRefreshClick(event, user.uid)}>
                    <MaterialIcon icon="refresh"/>
                  </a>
                </div>
              </div>
            <div class="columns has-text-centered">
              <div class="column is-one-quarter">
                <MeetingList meetings={meetings} fetchMeetingsStatus={fetchMeetingsStatus}
                             fetchMeetingsMessage={fetchMeetingsMessage}
                             handleMeetingClick={handleMeetingClick}/>
              </div>
              <div class="column">
                {statsStatus == 'loading' ?
                  <div>
                  <ScaleLoader color={"#8A6A94"}/>
                  </div>
                    :
                    <div class="has-text-left">
                        <p class="is-size-4 is-primary">Room: {selectedMeeting.room} </p>
                        <p class="is-size-5 is-primary">{processedUtterances.length} Attendees </p>
                        <p class="is-size-5 is-primary">{selectedMeetingDuration} </p>
                        <TurnChart processedUtterances={processedUtterances} participantId={user.uid}/>
                      </div>
                    }
              </div>
            </div>
            </div>
          );
        }
      };

export default DashboardView;

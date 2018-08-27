import React from 'react';
import ReactDOM from 'react-dom';
import {log} from '../libs/utils';
import MakeMeetingCard from './MakeMeetingCard';
import getUserMedia from 'getusermedia';
import attachMediaStream from 'attachmediastream';
import { withRouter } from "react-router-dom"
import styled, { injectGlobal, keyframes } from 'styled-components';

const Button = styled.button.attrs({
  className: 'btn waves-effect waves-light',
})`
  background-color: #93769D !important;

  &:focus {
    background-color: #A98AB5 !important;
  }
`;

const HomeSection = styled.section.attrs({
  className: 'section'
})`
  background-color: #f6f0fb;
`;

class Home extends React.Component {

  constructor(props) {
    super(props);
    console.log(props);
  }

  componentDidMount() {
    log("Dom node: ", this.bgvid);
  }

  render() {
    return (
      <HomeSection>
        <div class="columns">
          <div class="column">
            <div class="content">
              <h1> Riff is a new way to talk online. </h1>
              <p>
                Riff teaches you how to make your conversations better by measuring how
                you interact with others and giving you feedback about what happened.
                <span> <a href="">Learn more</a></span> (jump to blurb below)
              </p>

              <div>[Chat box and how-to infographic]</div>

              <h2> Why Riff? </h2>
              <p>
                Riff measures conversational dynamics and provides feedback during and
                after your conversations. Each participant receives objective data to help
                them learn about their interpersonal effectiveness, and their ability to
                work with others. Riff’s measurements can predict the engagement,
                satisfaction and performance on shared tasks.
              </p>

              <h2> Our Beta has three features </h2>
              <ul>
                <li>
                  Instrumented video chat — our proprietary WebRTC video chat application
                  measures how you talk, not what you say. We <strong>never</strong> record the content of a
                  conversation, but instead use the vocal activity and facial-gestural
                  patterns of participants to determine when people are talking, if they
                  appear to be agreeing, and how engaged they are.
                </li>

                <li>
                  Real-time feedback — during a video chat, you’ll see a visualization
                  called the “meeting mediator”. This mediator gives you feedback about
                  conversational dominance throughout the meeting. It uses our AI-driven
                  conversation models to track turn-taking, a key indicator of the degree of
                  collaboration happening in the meeting.
                </li>

                <li>
                  History and Analysis — after the meeting is over, you’ll have access to
                  the full history of all of your video chats. As the beta continues, we’ll
                  be adding additional measurements that reveal deeper insights about how
                  you interacted with others.
                </li>
              </ul>

              <p>
                If you have feedback to share, please do! <br/>
                Email us at <a href="mailto:beta@rifflearning.com">beta@rifflearning.com</a>.
              </p>
              <p>
                For more information, visit our Web site
                at <a href="https://www.rifflearning.com">www.rifflearning.com.</a>
              </p>
            </div>
          </div>
          <div class="column">
            <MakeMeetingCard>
            </MakeMeetingCard>
          </div>
        </div>
      </HomeSection>
     );
  }

}

export default withRouter(Home);

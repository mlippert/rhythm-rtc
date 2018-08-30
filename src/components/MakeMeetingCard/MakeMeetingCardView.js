import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import styled, { injectGlobal, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

const GradientCard = styled.div.attrs({
  className: 'card'
})`
background: linear-gradient(30deg, rgba(138,106,148,1) 12%, rgba(171,69,171,1) 87%);
border-radius: 5px;
.card-content p {
  color: #fff;
}
`

// linear-gradient(30deg, rgba(84,48,96,1) 20%, rgba(138,106,148,1) 50%, rgba(229,178,245,1) 100%);
//linear-gradient(66deg, rgba(70,19,85,1) 0%, rgba(138,106,148,1) 69%, rgba(201,155,215,0.9) 100%);

const TextInputStart = styled.a.attrs({
  className: 'button is-static'
})`
background-color: #fff;
border-color: #fff;
margin-left: 1px;
`

//TODO: fill in args
const MakeMeetingCardView = ({
  roomName,
  handleRoomNameChange,
  handleKeyPress,
  joinRoom,
  isInvalid}) => (
    <GradientCard>
      <div class="card-content">
        <p class="title">
          Start a room to make your meetings actually engaging.
        </p>
        <div class="field has-addons">
          <p class="control">
            <TextInputStart>
              riff.com/
            </TextInputStart>
          </p>
          <div class="control">
            <input class="input" type="text"
                   value={ roomName }
                   onChange={ event => handleRoomNameChange(event.target.value)}
              onKeyPress={ handleKeyPress }/>
          </div>
          <div class="control">
            <a class="button is-primary" disabled={isInvalid} onClick={ () => joinRoom(roomName) }>
              Go
            </a>
          </div>
        </div>
      </div>
    </GradientCard>
  )

export default MakeMeetingCardView;

import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import styled, { injectGlobal, keyframes } from 'styled-components';
import {BounceLoader} from 'react-spinners';
import MaterialIcon from 'material-icons-react';
import { Link } from 'react-router-dom';



const TextInputStart = styled.a.attrs({
  className: 'button is-static'
})`
background-color: #fff;
border-color: #fff;
margin-left: 1px;
`

const ProfileView = ({user, emailStatus, emailMessage, emailInput, clearEmailError,
                      handleEmailSubmit, handleEmailInput, handleKeyPress}) => (
  <div class="section">
    <div class="columns">
      <div class="column">
        <div class="columns">
          <div class="column">
            <h1 class='is-size-3'>Profile</h1>
            <p class='is-size-5'>Here you can change your email and your default display name. More coming soon! </p>
          </div>
        </div>
        <div class="columns is-centered has-text-centered">
          <div class="column is-two-thirds has-text-left">
            <div class="field has-addons">
              <p class="control">
                <TextInputStart>
                  Email
                </TextInputStart>
              </p>
              <div class="control">
                <input class="input"
                       type="text"
                       value={ emailInput }
                       onChange={ event => handleEmailInput(event.target.value)}
                  onKeyPress={ handleKeyPress }/>
              </div>
              <div class="control">
                <a class="button is-primary" onClick={ () => handleEmailSubmit(emailInput) }>
                  Change
                </a>
              </div>
              <div style={{marginLeft: '10px'}} class="has-text-centered">
                {emailStatus == "loading" &&
                <BounceLoader color={"#8A6A94"} size={30} sizeUnit={"px"}/>}
                {emailStatus == "success" &&
                <MaterialIcon icon="check_circle" color={"#8A6A94"}/>
                  }
              </div>
            </div>
            { emailStatus == 'error' && <div class="notification is-warning">
                <button class="delete" onClick={clearEmailError}></button>
                {emailMessage}</div> }
          </div>
        </div>
      </div>
  </div>
  </div>
)

export default ProfileView;

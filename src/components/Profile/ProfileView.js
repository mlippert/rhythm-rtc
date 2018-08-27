import React, { Component } from "react";
import { withRouter } from 'react-router-dom';
import styled, { injectGlobal, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';

const ProfileView = ({user}) => (
  <div class="columns">
    <div class="column">
      <p>{user.email}</p>
    </div>
  </div>
)

export default ProfileView;

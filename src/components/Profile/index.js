import React, { Component } from "react"
import { withRouter } from "react-router-dom"
import { connect } from 'react-redux'
import auth from "../../firebase"
import {
  changeEmailState }
from "../../redux/actions/auth"
import { push } from 'connected-react-router'
import ProfileView from './ProfileView'

const mapStateToProps = state => ({
  user: state.auth.user
})

const mapDispatchToProps = dispatch => ({

})

export default withRouter(
  connect(mapStateToProps,
          mapDispatchToProps)(ProfileView));

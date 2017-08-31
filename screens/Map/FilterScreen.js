import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ScrollView, StyleSheet, Text, TextInput, View, Button } from 'react-native';
import * as Actions from '../../actions';
import { NavigationActions } from 'react-navigation';
import Icon from 'react-native-vector-icons/FontAwesome';
import Expo from 'expo';
import firebase from 'firebase';
import db from '../../db';

const mapStateToProps = (state, ownProps) => {
  return {
    phototags: state.phototags,
  };
};

class FilterScreen extends Component {

  render(){
    return(
      <ScrollView>
        <ScrollView>
        </ScrollView>
        <TextInput>
        </TextInput>
      </ScrollView>
      )
  }
}

export default FilterScreen;

//need an option for favorites
//need a selector for recent, popular, most voted, most faved
//need to allow selection by tag (check marks?)
//allow for different zoom levels?
//change search radius
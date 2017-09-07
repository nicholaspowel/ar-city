import React from 'react';
import { MapView, Location, Permissions } from 'expo';
import { connect } from 'react-redux';
import { Button, Text, Image, StyleSheet, View, ScrollView, Alert } from 'react-native';
import db from '../../db';
import MarkerTag from '../../components/markerTag';
import ListView from './ListView.js';
import FilterScreen from './FilterScreen';
import * as Actions from '../../actions';

const mapStateToProps = (state, ownProps) => {
  return {
    phototags: state.phototags,
    location: state.location,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  // Define the function that will be passed as prop
  return {
    getLocation: () => {
      dispatch(Actions.getLocationAsync());
    },
  };
};

class MapScreen extends React.Component {
  state = {
    // the intial location must be set because props take time to init it could be anything
    region: {
      latitude: 20.750355960509054,
      longitude: -73.97669815393424,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    },
    markers: [],
    isMapToggled: true,
    modalVisible: false,
    filters: {
      selectedTags: [],
      numResults: 25,
      radius: 2,
      favorites: false,
      tags: ['trees', 'potholes', 'bench', 'garden', 'sidewalk', 'transit', 'art'],
      modalVisible: false,
      sortBy: 'Date',
      FavIsSelected: false,
      user: null,
    },
  };

  componentDidMount() {
    let locationOptions = {
      enableHighAccuracy: true,
      distanceFilter: 10,
      maximumAge: 1000,
      timeout: 20000,
    };
    Location.watchPositionAsync(locationOptions, location => {
      if (
        this.state.region.latitude !== location.coords.latitude &&
        this.state.region.longitude !== location.coords.longitude
      ) {
        console.log(
          `[watchPosition] old loc ${this.state.region.latitude} ${this.state.region
            .longitude} --> new loc ${location.coords.latitude} ${location.coords.longitude}`
        );
        // Only call getLocation if the location changed
        this.props.getLocation();
      }
    }).catch(err => {
      console.log('[watchPosition]', err);
      Alert.alert(
        'Unable to get location',
        'Please ensure location permissions are enabled for this app.'
      );
    });
  }

  componentWillReceiveProps(nextProps) {
    // Ensure the props received are the location props and that they are not empty, before updating location state
    if (!!nextProps.location.latitude && !!nextProps.location.longitude) {
      this.setLocation(nextProps.location);
    }

    // If location permissions are not enabled, alert with error
    if (nextProps.location && nextProps.location.error) {
      Alert.alert('Error', nextProps.location.error);
    }
  }

  toggleView = () => {
    let reverse = !this.state.isMapToggled;
    this.setState({ isMapToggled: reverse }, () => {
      console.log('toggled', this.state.isMapToggled);
    });
  };

  goToPhototags(marker) {
    this.props.navigation.navigate('PhototagFromMap', marker);
  }

  setLocation(location) {
    let tempRegion = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    this.setState({ region: tempRegion });
  }

  getFilters(filters) {
    this.setState({
      filters,
    });
  }

  filterPhotoTags(photoTags) {
    let filters = this.state.filters;
    let filteredTags = [];
    //when filtering for tags, need to make sure that photo has all of the tags in the array

    return filteredTags;
  }

  sortPhotoTags(photoTags) {
    let sortBy = this.state.filters.sortBy;
    if (sortBy === 'Date') {
      return photoTags.sort((a, b) => {
        return Date.parse(a.timestamp) - Date.parse(b.timestamp);
      });
    }
    if (sortBy === 'Popular') {
      return photoTags.sort((a, b) => {
        return Date.parse(a.timestamp) - Date.parse(b.timestamp);
      });
    }
    if (sortBy === 'Votes') {
      return photoTags.sort((a, b) => {
        return a.upvotes - b.upvotes;
      });
    }
    if (sortBy === 'Favorites') {
      return photoTags.sort((a, b) => {
        return a.upvotes - b.upvotes;
      });
    }
    return photoTags;
  }

  checkDistance(
    distance = 10,
    lat1,
    lon1,
    lat2 = this.state.region.latitude,
    lon2 = this.state.region.longitude
  ) {
    const deg2rad = deg => {
      return deg * (Math.PI / 180);
    };
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    // console.log(d);
    if (d > distance) return false;
    return true;
  }

  setMarkersByDistance() {
    var tempMarkers = [];
    this.state.markers.forEach(marker => {
      if (this.checkDistance(marker.locationLat, marker.locationLong)) {
        tempMarkers.push(marker);
      }
    });
    this.setState({ markers: tempMarkers }, () => {
      console.log('markers', this.state.markers);
    });
  }
  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  render() {
    if (this.state.isMapToggled === true) {
      return (
        <View style={{ height: '100%' }}>
          <FilterScreen getFilters={this.getFilters.bind(this)} />
          <MapView
            showsUserLocation
            followsUserLocation
            toolbarEnabled
            provider={MapView.PROVIDER_GOOGLE}
            style={styles.map}
            region={this.state.region}>
            <Button onPress={this.toggleView} title="Switch to List" />

            {this.props.phototags &&
              this.props.phototags
                .filter(marker =>
                  this.checkDistance(
                    this.state.filters.radius,
                    marker.locationLat,
                    marker.locationLong
                  )
                )
                .slice(0, this.state.filters.numResults)
                .map((markerMapped, i) => (
                  <MapView.Marker
                    key={markerMapped.id}
                    coordinate={{
                      latitude: markerMapped.locationLat,
                      longitude: markerMapped.locationLong,
                    }}
                    title={markerMapped.description}>
                    <MapView.Callout tooltip onPress={this.goToPhototags.bind(this, markerMapped)}>
                      <MarkerTag phototag={markerMapped} />
                    </MapView.Callout>
                  </MapView.Marker>
                ))}
          </MapView>
        </View>
      );
    } else {
      return (
        <View style={{ height: '100%' }}>
          <FilterScreen getFilters={this.getFilters.bind(this)} />
          <Button onPress={this.toggleView} title="Switch to Map" />
          <ListView
            phototags={this.sortPhotoTags(this.props.phototags).slice(
              0,
              this.state.filters.numResults
            )}
            navigation={this.props.navigation}
          />
        </View>
      );
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MapScreen);

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
});

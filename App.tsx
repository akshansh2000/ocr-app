import React, { Component } from 'react';
import { View, Button, PermissionsAndroid, Dimensions } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import RNRestart from 'react-native-restart';
import RNExitApp from 'react-native-exit-app';
import BarcodeMask from 'react-native-barcode-mask';
import ImageEditor from "@react-native-community/image-editor";
import ImageSize from 'react-native-image-size';
import PhotoView from 'react-native-photo-view';

class HomeScreen extends Component<{ navigation: any }> {
  render() {
    this.requestPermissions();

    const { navigate } = this.props.navigation

    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '80%',
          }}
        >
          <Button
            title="Camera"
            onPress={
              () => navigate('Camera')
            }
          />
          <Button
            title="Restart"
            onPress={
              () => RNRestart.Restart()
            }
            color='lightslategrey'
          />
          <Button
            title="Exit"
            onPress={
              () => RNExitApp.exitApp()
            }
            color='orangered'
          />
        </View>
      </View>
    );
  }

  requestPermissions = async function () {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA
    );
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
  }
}

class CameraScreen extends Component<{ navigation: any }> {
  picturesList: string[] = [];
  height: number = Dimensions.get('window').height;
  width: number = Dimensions.get('window').width;
  boxSize: number = Dimensions.get('window').width * 9 / 10;

  constructor(public navigation: any, public camera: RNCamera) {
    super(navigation, camera);
    setInterval(() => this.takePicture(this.camera), 2000);
  }

  render() {
    const { navigate } = this.props.navigation

    return (
      <View
        style={{
          width: '100%',
          height: '100%',
        }}
      >
        <RNCamera
          ref={
            ref => {
              this.camera = ref;
            }
          }
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
          }}
        >
          <BarcodeMask
            width={this.boxSize}
            height={this.boxSize}
            showAnimatedLine
          />
          <View
            style={{
              height: '100%',
              width: '100%',
              flexDirection: 'column-reverse',
            }}
          >
            <Button
              title="Show Last Capture"
              onPress={() => {
                navigate(
                  'Captures',
                  { lastPhotoString: this.picturesList[this.picturesList.length - 1] }
                )
              }}
            />
          </View>
        </RNCamera>
      </View>
    );
  }

  takePicture = async function (camera: RNCamera) {
    if (camera) {
      const options = {
        quality: 1,
        fixOrientation: true,
      };

      const data = await camera.takePictureAsync(options);

      ImageSize.getSize(data.uri).then(size => {
        const cropData = {
          offset: { x: size.width / 20, y: (size.height - size.width * 9 / 10) / 2 },
          size: { width: size.width * 9 / 10, height: size.width * 9 / 10 },
        };

        ImageEditor.cropImage(data.uri, cropData).then(async uri => {
          this.picturesList.push(uri);
          console.log(this.picturesList);
        });
      });
    }
  }
}

class CapturesScreen extends Component<{ navigation: any }> {
  render() {
    return (
      <View
        style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <PhotoView
          source={{ uri: this.props.navigation.state.params.lastPhotoString }}
          scale={1}
          style={{
            width: Dimensions.get('window').width * 9 / 10,
            height: Dimensions.get('window').width * 9 / 10,
          }}
        />
      </View>
    );
  }
}

const MainNavigator = createStackNavigator(
  {
    Home: { screen: HomeScreen },
    Camera: { screen: CameraScreen },
    Captures: { screen: CapturesScreen },
  },
  {
    initialRouteKey: 'Home',
  },
);

const App = createAppContainer(MainNavigator);

export default App;

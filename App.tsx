import React, { Component } from 'react';
import { View, Button, PermissionsAndroid, Dimensions, ImageStore } from 'react-native';
import { RNCamera } from 'react-native-camera';
import CameraRoll from "@react-native-community/cameraroll";
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import RNRestart from 'react-native-restart';
import RNExitApp from 'react-native-exit-app';
import BarcodeMask from 'react-native-barcode-mask';
import ImageEditor from "@react-native-community/image-editor";
import ImageSize from 'react-native-image-size';

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

class CameraScreen extends Component {
  picturesList: string[] = [];
  height: number = Dimensions.get('window').height;
  width: number = Dimensions.get('window').width;
  boxSize: number = Dimensions.get('window').width * 9 / 10;

  constructor(public camera: RNCamera) {
    super(camera);
    setInterval(() => this.takePicture(this.camera), 3000);
  }

  render() {
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
          <Button
            title="Show Captures"
            onPress={() => { }}
          />
        </RNCamera>
      </View>
    );
  }

  takePicture = async function (camera: RNCamera) {
    if (camera) {
      const options = {
        quality: 0.5,
      };

      const data = await camera.takePictureAsync(options);

      ImageSize.getSize(data.uri).then(size => {
        console.log(size);

        const cropData = {
          offset: { x: size.height / 20, y: (size.width - size.height * 9 / 10) / 2 },
          size: { width: size.height * 9 / 10, height: size.height * 9 / 10 },
        };

        ImageEditor.cropImage(data.uri, cropData).then(async uri => {
          var newPhotoLocation = await CameraRoll.saveToCameraRoll(uri);

          ImageSize.getSize(uri).then(size => {
            console.log(size);
          });

          this.picturesList.push(newPhotoLocation);
          console.log(this.picturesList);
        });
      });
    }
  }
}

class CapturesScreen extends Component { }

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

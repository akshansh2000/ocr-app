import React, { Component } from 'react';
import { View, Button, PermissionsAndroid, Dimensions, Text } from 'react-native';
import { RNCamera } from 'react-native-camera';
import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';
import RNRestart from 'react-native-restart';
import RNExitApp from 'react-native-exit-app';
import BarcodeMask from 'react-native-barcode-mask';
import ImageEditor from "@react-native-community/image-editor";
import ImageSize from 'react-native-image-size';
import RNTextDetector from 'react-native-text-detector';
import clear from 'react-native-clear-app-cache';
import CameraRoll from '@react-native-community/cameraroll';

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
              () => navigate('Camera', {
                widthFactor: 9 / 10,
                heightFactor: 1 / 3,
              })
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

  componentWillUnmount() {
    clear.clearAppCache(() => null);
  }
}

class CameraScreen extends Component<{ navigation: any }, { ocrText: String }> {
  re: RegExp = /^(?=.*[0-9])(?=.*[A-Z])([A-Z0-9\s]+)$/

  picturesList: string[] = [];
  croppedPicturesList: string[] = [];

  constructor(public navigation: any, public camera: RNCamera) {
    super(navigation, camera);
    this.state = {
      ocrText: 'Scan a license plate or a container code'
    };

    setTimeout(() => this.takePicture(this.camera), 2000);
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
            width={
              Dimensions.get('window').width * this.props.navigation.state.params.widthFactor
            }
            height={
              Dimensions.get('window').width * this.props.navigation.state.params.heightFactor
            }
            showAnimatedLine
          />
          <View
            style={{
              height: '100%',
              width: '100%',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <View
              style={{
                height: '15%',
                width: '90%',
                backgroundColor: 'white',
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 30,
                  color: 'black',
                  textAlign: 'center',
                }}
              >
                {this.state.ocrText}
              </Text>
            </View>
            <View
              style={{
                width: '100%',
              }}
            >
              <Button
                title="Submit"
                onPress={() => {
                  CameraRoll.saveToCameraRoll(
                    this.picturesList[this.picturesList.length - 1]
                  );
                  CameraRoll.saveToCameraRoll(
                    this.croppedPicturesList[this.croppedPicturesList.length - 1]
                  );
                  navigate('Home');
                }}
              />
            </View>
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
        skipProcessing: true,
        base64: true,
      };

      const data = await camera.takePictureAsync(options);
      this.picturesList.push(data.uri);

      ImageSize.getSize(data.uri).then(size => {
        const cropData = {
          offset: {
            x: size.width * (1 - this.props.navigation.state.params.widthFactor) / 2,
            y: (size.height - size.width * this.props.navigation.state.params.heightFactor) / 2
          },
          size: {
            width: size.width * this.props.navigation.state.params.widthFactor,
            height: size.width * this.props.navigation.state.params.heightFactor,
          },
        };

        ImageEditor.cropImage(data.uri, cropData).then(async uri => {
          this.croppedPicturesList.push(uri);
          this.detectText(uri);
        });
      });
    }
  }

  detectText = async function (uri: String) {
    const response = await RNTextDetector.detectFromUri(
      uri
    );

    response.map(item => {
      console.log(item.text);

      if (this.re.test(item.text))
        this.setState({
          ocrText: item.text,
        });
    });

    this.takePicture(this.camera);
  }
}

const MainNavigator = createStackNavigator(
  {
    Home: { screen: HomeScreen },
    Camera: { screen: CameraScreen },
  },
  {
    initialRouteKey: 'Home',
  },
);

const App = createAppContainer(MainNavigator);

export default App;

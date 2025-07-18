import { AppRegistry } from 'react-native';
import App from './src/App';

// Register the app for web
AppRegistry.registerComponent('ChunithmLocationMap', () => App);

// Run the app
AppRegistry.runApplication('ChunithmLocationMap', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
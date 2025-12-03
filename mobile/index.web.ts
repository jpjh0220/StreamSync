import { registerRootComponent } from 'expo';
import App from './App';

// Web doesn't need TrackPlayer service registration
// HTML5 Audio is used instead

registerRootComponent(App);

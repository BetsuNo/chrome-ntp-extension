import {h, render} from 'preact';
import Main from './views/Main';
import '@fortawesome/fontawesome-svg-core/styles.css';
import '@fortawesome/fontawesome-free/css/all.css';
import './main.scss';

render(<Main />, document.getElementById('app-mount-point'));

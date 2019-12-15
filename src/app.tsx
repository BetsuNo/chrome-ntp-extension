import Main from './views/Main';
import {h, render} from 'preact';
import './main.scss';

let el;
el = render(<Main />, document.getElementById('app-mount-point'), el);
import { render } from 'preact';
import { App } from './app.tsx';
import '@picocss/pico/css/pico.min.css';
import './styles/custom.css';

render(<App />, document.getElementById('app')!);

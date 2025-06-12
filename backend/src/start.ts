import { spawn } from 'child_process';

spawn('node', ['dbSetup.js'], { stdio: 'inherit' });
spawn('node', ['index.js'], { stdio: 'inherit' });

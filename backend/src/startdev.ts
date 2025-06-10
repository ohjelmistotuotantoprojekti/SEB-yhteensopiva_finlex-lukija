//const { spawn } = require('child_process');
import { spawn } from 'child_process';

spawn('npx', ['tsx', 'src', '/', 'dbSetup.js'], { stdio: 'inherit' });
spawn('npx', ['tsx', 'src', '/', 'index.js'], { stdio: 'inherit' });


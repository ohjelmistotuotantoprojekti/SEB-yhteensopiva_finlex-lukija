//const { spawn } = require('child_process');
import { spawn } from 'child_process';

//spawn('npx', ['node', 'dbSetup.js'], { stdio: 'inherit' });
//spawn('npx', ['node', 'index.js'], { stdio: 'inherit' });

spawn('node', ['dist/dbSetup.js'], { stdio: 'inherit' });
spawn('node', ['dist/index.js'], { stdio: 'inherit' });

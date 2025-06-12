import { spawn } from 'child_process';

spawn('npx', ['tsx', 'src/dbSetup.ts'], { stdio: 'inherit' });
spawn('npx', ['tsx', 'src/index.ts'], { stdio: 'inherit' });


import { spawn } from 'child_process';
import dotenv from "dotenv";
dotenv.config();

const REQUIRED_ENV_VARS = ['PG_URI', 'DATABASE_PASSWORD', 'NODE_ENV'];

function checkEnvVars(vars: string[]) {
  for (const v of vars) {
    if (!process.env[v]) {
      console.error(`${v} environment variable is not set. Exiting.`);
      process.exit(1);
    }
  }
}

checkEnvVars(REQUIRED_ENV_VARS);
if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  spawn('npx', ['tsx', 'src/dbSetup.ts'], { stdio: 'inherit' });
  spawn('npx', ['tsx', 'src/index.ts'], { stdio: 'inherit' });
} else if (process.env.NODE_ENV === 'production') {
  spawn('node', ['dbSetup.js'], { stdio: 'inherit' });
  spawn('node', ['index.js'], { stdio: 'inherit' });
} else {
  console.error(`Unsupported NODE_ENV: ${process.env.NODE_ENV}. Exiting.`);
  process.exit(1);
}

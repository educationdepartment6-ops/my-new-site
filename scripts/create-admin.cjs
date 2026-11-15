const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const envPath = path.join(__dirname, '..', '.env');
const adminEmail = 'mog.wrldd@gmail.com';

function promptPassword(promptText) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    process.stdout.write(promptText);
    const stdin = process.stdin;
    const oldRaw = stdin.isRaw;
    if (stdin.isTTY) {
      stdin.setRawMode(true);
    }
    stdin.resume();

    let password = '';
    const onData = (char) => {
      char = char.toString('utf8');
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          if (stdin.isTTY) stdin.setRawMode(oldRaw);
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          rl.close();
          resolve(password);
          break;
        case '\u0003':
          // Ctrl+C
          process.stdout.write('\n');
          process.exit(1);
          break;
        case '\u007f':
        case '\b':
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    };

    stdin.on('data', onData);
  });
}

async function main() {
  console.log('==================================================');
  console.log('  MOG WRLD Admin Account Setup');
  console.log('==================================================');
  console.log('Admin Email: ' + adminEmail);
  console.log('');

  let password = process.argv[2];
  if (!password) {
    password = await promptPassword('Enter Admin Password: ');
    const confirm = await promptPassword('Confirm Admin Password: ');
    if (password !== confirm) {
      console.error('\n[ERROR] Passwords do not match. Aborting.');
      process.exit(1);
    }
  }

  if (password.length < 8) {
    console.error('\n[ERROR] Password must be at least 8 characters long.');
    process.exit(1);
  }

  console.log('\nHashing password with bcrypt (12 rounds of salt)...');
  const salt = bcrypt.genSaltSync(12);
  const hash = bcrypt.hashSync(password, salt);

  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  let sessionSecret = '';
  const matchSecret = envContent.match(/^SESSION_SECRET=(.*)$/m);
  if (matchSecret && matchSecret[1].trim()) {
    sessionSecret = matchSecret[1].trim();
  } else {
    sessionSecret = crypto.randomBytes(32).toString('hex');
  }

  const envVars = {
    ADMIN_EMAIL: adminEmail,
    ADMIN_PASSWORD_HASH: hash,
    SESSION_SECRET: sessionSecret,
    NODE_ENV: 'production',
    PORT: '4173'
  };

  let newEnv = envContent;
  for (const [key, val] of Object.entries(envVars)) {
    const regex = new RegExp('^' + key + '=.*$', 'm');
    if (regex.test(newEnv)) {
      newEnv = newEnv.replace(regex, key + '=' + val);
    } else {
      newEnv += (newEnv.endsWith('\n') || !newEnv ? '' : '\n') + key + '=' + val + '\n';
    }
  }

  fs.writeFileSync(envPath, newEnv.trim() + '\n');
  console.log('[SUCCESS] Admin credentials successfully saved to .env!');
  console.log(' - Admin Email: ' + adminEmail);
  console.log(' - Password Hash: ' + hash.slice(0, 10) + '... (never logged or exposed)');
  console.log(' - Session Secret: [Configured]');
  console.log('==================================================\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

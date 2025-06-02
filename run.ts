import { join } from 'path';

// Main function to run both servers
async function runServers() {
  try {
    console.log('🚀 Starting servers...\n');

    // Start backend server
    console.log('📡 Starting backend server...');
    const backend = Bun.spawn(['python', 'run.py'], {
      cwd: './backend',
      stdio: ['inherit', 'inherit', 'inherit']
    });

    // Start frontend server
    console.log('🎨 Starting frontend server...');
    const frontend = Bun.spawn(['bun', 'run', 'dev'], {
      stdio: ['inherit', 'inherit', 'inherit']
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping servers...');
      backend.kill();
      frontend.kill();
      process.exit();
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the servers
runServers(); 
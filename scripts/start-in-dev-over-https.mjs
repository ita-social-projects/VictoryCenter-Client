import { promises as fs } from 'fs';
import path from 'path';
import spawn from 'cross-spawn';
import { certificateFor } from 'devcert';

(async () => {
    try {
        const certDir = path.resolve(process.cwd(), 'certs');
        const keyPath = path.join(certDir, 'localhost-key.pem');
        const certPath = path.join(certDir, 'localhost-cert.pem');

        // Ensure the certs directory exists and is clean
        await fs.rm(certDir, { recursive: true, force: true });
        await fs.mkdir(certDir, { recursive: true });

        // Trusting CAs on Linux OS often requires distro-specific manual commands.
        const installCert = process.platform !== 'linux';
        const { key, cert } = await certificateFor('localhost', { installCert });

        await fs.writeFile(keyPath, key, { mode: 0o600 });
        await fs.writeFile(certPath, cert, { mode: 0o600 });

        process.env.HTTPS = 'true';
        process.env.SSL_KEY_FILE = keyPath;
        process.env.SSL_CRT_FILE = certPath;

        // Forwarding arguments to react-scripts start
        const args = ['start', ...process.argv.slice(2)];
        const child = spawn('react-scripts', args, {
            stdio: 'inherit',
            shell: process.platform === 'win32',
        });

        // Forwarding signals to the child process
        const SIGNALS_TO_FORWARD = [
            'SIGINT', // Ctrl+C
            'SIGTERM', // kill or docker stop
            'SIGQUIT', // Ctrl+\
            'SIGHUP', // hangup
            'SIGBREAK', // Ctrl+Break
        ];
        SIGNALS_TO_FORWARD.forEach((sig) => process.on(sig, () => child.kill(sig)));

        // Exit the parent process with the same exit code as the child
        child.on('exit', (code) => process.exit(code));
    } catch (err) {
        process.stderr.write('HTTPS setup failed:\n' + (err.stack || err.message) + '\n');
        process.exit(1);
    }
})();

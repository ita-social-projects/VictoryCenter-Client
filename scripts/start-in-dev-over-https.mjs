import { promises as fs } from 'fs';
import path from 'path';
import spawn from 'cross-spawn';
import { getCerts } from 'https-localhost/certs.js';

(async () => {
    try {
        // Ensure the certs directory exists and is clean
        const certDir = path.resolve(process.cwd(), 'certs');
        // Safety check to ensure we're in the project directory
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        await fs.access(packageJsonPath).catch(() => {
            throw new Error(
                'package.json not found. Please run this script from the project root.'
            );
        });
        await fs.rm(certDir, { recursive: true, force: true });
        await fs.mkdir(certDir, { recursive: true });

        // Generate or retrieve the SSL certificates
        const { key, cert } = await getCerts();

        // Write the key and cert files to the certs directory
        const keyPath = path.join(certDir, 'localhost-key.pem');
        const certPath = path.join(certDir, 'localhost-cert.pem');
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
        ];
        // Add Windows-specific signals conditionally
        if (process.platform === 'win32') {
            SIGNALS_TO_FORWARD.push('SIGBREAK'); // Ctrl+Break
        }

        SIGNALS_TO_FORWARD.forEach((sig) => process.on(sig, () => child.kill(sig)));

        // Exit the parent process with the same exit code as the child
        child.on('exit', (code) => process.exit(code));
    } catch (err) {
        process.stderr.write('HTTPS setup failed:\n' + (err.stack || err.message) + '\n');
        process.exit(1);
    }
})();

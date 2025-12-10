const { exec } = require('child_process');

function pingHost(ip) {
    return new Promise((resolve) => {
        exec(`ping -c 1 -W 1 ${ip}`, (error, stdout, stderr) => {
            if (error) {
                resolve(false);
            } else {
                resolve(stdout.includes('1 received'));
            }
        });
    });
}

module.exports = { pingHost };

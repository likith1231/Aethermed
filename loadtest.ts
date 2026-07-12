import http from 'k6/http';
import { check, sleep } from 'k6';
import { Options } from 'k6/options';

// This configuration simulates a traffic spike
export const options: Options = {
    stages: [
        { duration: '30s', target: 50 }, // Ramp up to 50 virtual users over 30 seconds
        { duration: '1m', target: 50 },  // Hold at 50 virtual users for 1 minute
        { duration: '30s', target: 0 },  // Ramp down to 0 users
    ],
};

export default function () {
    // Replace this with the actual local URL of your Next.js application
    const res = http.get('http://localhost:3000/');

    // Verify the server is actually responding and not crashing
    check(res, {
        'status was 200': (r) => r.status === 200
    });

    // Wait 1 second between requests so we don't accidentally DDoS your own laptop
    sleep(1);
}
const fs = require('fs');
let data = fs.readFileSync('logs.md', 'utf8');

// Fix the mangled "notify_send_email"
data = data.replace('Added a\notify_send_email`', 'Added a `notify_send_email`');

// Fix the mangled "notifications" list
data = data.replace('and\notifications` list', 'and `notifications` list');

fs.writeFileSync('logs.md', data);

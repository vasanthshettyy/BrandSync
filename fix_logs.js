const fs = require('fs');
let data = fs.readFileSync('logs.md', 'utf8');
data = data.replace(/`n/g, '\n');
fs.writeFileSync('logs.md', data);

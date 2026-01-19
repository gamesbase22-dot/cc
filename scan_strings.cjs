const fs = require('fs');
const content = fs.readFileSync('src/App.jsx', 'utf8');

let stringChar = null;
let startPos = -1;
let line = 1;
// Simple parser that tracks string state
// naive about comments and regex literals, but good enough for finding massive runaway strings

for (let i = 0; i < content.length; i++) {
    const char = content[i];

    if (stringChar) {
        if (char === stringChar && content[i - 1] !== '\\') {
            stringChar = null; // Closed
            // Check if it was a template literal valid close
        }
    } else {
        if (char === '"' || char === '\'' || char === '`') {
            stringChar = char;
            startPos = i;
        }
    }
    if (char === '\n') line++;
}

if (stringChar) {
    const startLine = content.substring(0, startPos).split('\n').length;
    console.log(`UNTERMINATED STRING detected!`);
    console.log(`Starts at line: ${startLine}`);
    console.log(`Quote type: ${stringChar}`);
    console.log(`Content start: ${content.substring(startPos, startPos + 200)}...`);
} else {
    console.log('No simple unterminated strings found.');
}

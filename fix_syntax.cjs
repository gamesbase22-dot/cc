const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix JSX tags and attributes spacing errors
// Fix closing tags like </ div > -> </div>
content = content.replace(/<\/\s+([a-zA-Z0-9]+)\s+>/g, '</$1>');
content = content.replace(/<\/\s+([a-zA-Z0-9]+)>/g, '</$1>');
content = content.replace(/<([a-zA-Z0-9]+)\s+>/g, '<$1>'); // Fix <div > -> <div>

// Fix attribute assignments like className = "..." -> className="..."
content = content.replace(/\s+=\s+"/g, '="');
content = content.replace(/\s+=\s+{/g, '={');

// 2. Fix Tailwind class names corrupted with spaces (e.g., "p - 4", "bg - slate - 800")
// We look for patterns like "word - word" inside className strings
// Approach: Find all className="..." blocks and clean them specifically
content = content.replace(/className="([^"]*)"/g, (match, classStr) => {
    // Remove spaces around hyphens in class names
    // Caution: prevent replacing spaces that separate classes
    // Typical tailwind classes: "p-4 bg-red-500 w-[50%]"
    // Corrupted: "p - 4 bg - red - 500 w - [50 %]"

    // Strategy: Remove space before and after hyphen
    let clean = classStr.replace(/\s+-\s+/g, '-');
    clean = clean.replace(/\s+-\s*/g, '-');
    clean = clean.replace(/\s*-\s+/g, '-');

    // Fix specific bracket issues like "[ 50 % ]" -> "[50%]"
    clean = clean.replace(/\[\s+/g, '[');
    clean = clean.replace(/\s+\]/g, ']');
    clean = clean.replace(/\s+%/g, '%');

    return `className="${clean}"`;
});

// 3. Fix Tailwind class names inside template literals className={`...`}
content = content.replace(/className={`([^`]*)`}/g, (match, classStr) => {
    // Similar cleaning for template literals
    let clean = classStr.replace(/\s+-\s+/g, '-');
    clean = clean.replace(/\s+-\s*/g, '-');
    clean = clean.replace(/\s*-\s+/g, '-');

    clean = clean.replace(/\[\s+/g, '[');
    clean = clean.replace(/\s+\]/g, ']');
    clean = clean.replace(/\s+%/g, '%');

    return `className={\`${clean}\`}`;
});

// 4. Manual fixes for specific known broken lines if regex missed them
// Fix the toggle switch specifically
content = content.replace(/absolute top - 1 bottom - 1/g, 'absolute top-1 bottom-1');

fs.writeFileSync(filePath, content, 'utf8');
console.log('App.jsx syntax fixed successfully.');

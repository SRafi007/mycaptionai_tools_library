import fs from 'fs';
import path from 'path';

const filePath = path.resolve('app/globals.css');
const content = fs.readFileSync(filePath, 'utf-8');

let openBraces = 0;
let closeBraces = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Strip comments
  const cleanLine = line.replace(/\/\*[\s\S]*?\*\//g, '');
  
  for (let char of cleanLine) {
    if (char === '{') openBraces++;
    if (char === '}') closeBraces++;
  }
}

console.log(`Open braces: ${openBraces}`);
console.log(`Close braces: ${closeBraces}`);
if (openBraces !== closeBraces) {
  console.error("Mismatch! The braces are not balanced!");
} else {
  console.log("Braces are balanced successfully.");
}

const fs = require('fs');

const inputPath = process.argv[2];
const input = fs.readFileSync(inputPath, 'utf8');

const outputPath = process.argv[3];

const preludeEndIdx = input.indexOf('(function (require)');

if (preludeEndIdx === -1) {
  throw new Error('Prelude not found!');
}

let output = input.slice(preludeEndIdx);
output = output.slice(0, output.length - 1); // remove semicolon
output += '();' // exec

fs.writeFileSync(outputPath, output, 'utf-8');

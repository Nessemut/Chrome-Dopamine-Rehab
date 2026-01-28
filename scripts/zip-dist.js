const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const outputFileName = `${packageJson.name}-${packageJson.version}.zip`;
const outputPath = path.join(__dirname, '..', outputFileName);
const sourceDir = path.join(__dirname, '..', 'dist');

if (fs.existsSync(outputPath)) {
    console.log(`Deleting existing ${outputFileName}...`);
    fs.unlinkSync(outputPath);
}

const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
    zlib: { level: 9 }
});

output.on('close', function() {
    console.log(`${archive.pointer()} total bytes`);
    console.log('Archiver has been finalized and the output file descriptor has closed.');
    console.log(`Successfully created ${outputFileName}`);
});

output.on('end', function() {
    console.log('Data has been drained');
});

archive.on('error', function(err) {
    throw err;
});

archive.pipe(output);
archive.directory(sourceDir, false);
archive.finalize();

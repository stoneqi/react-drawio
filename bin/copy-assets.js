#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The assets are located in ../dist/drawio relative to this script
const sourceDir = path.resolve(__dirname, '../dist/drawio');
const destDir = path.resolve(process.cwd(), 'public/drawio');

console.log(`Installing Draw.io assets...`);
console.log(`Source: ${sourceDir}`);
console.log(`Destination: ${destDir}`);

if (!fs.existsSync(sourceDir)) {
    console.error(`\nError: Source directory not found at ${sourceDir}`);
    console.error('Make sure "react-drawio" is installed correctly.');
    process.exit(1);
}

// Check if 'public' folder exists in the project root
const publicDir = path.resolve(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
    console.warn(`\nWarning: "public" directory not found at ${publicDir}.`);
    console.warn('Attempting to create "public/drawio" anyway...');
}

try {
    // Use recursive copy
    fs.mkdirSync(destDir, { recursive: true });
    fs.cpSync(sourceDir, destDir, { recursive: true });
    console.log(`\n✅ Successfully copied draw.io assets to public/drawio`);
    console.log(`\nYou can now use the component with:`);
    console.log(`<DrawIoEmbed baseUrl="/drawio/index.html" />`);
} catch (err) {
    console.error(`\n❌ Failed to copy assets:`, err);
    process.exit(1);
}

/**
 * Data Migration Script
 * 
 * This script helps you migrate from the large single words.ts file 
 * to the new modular structure.
 * 
 * Instructions:
 * 1. Copy your existing words data into separate files by difficulty level
 * 2. Use this as a template for each difficulty file
 * 3. Replace the import path in your main components
 */

// Example of how to extract A1 words from your current file:
/*
From your current words.ts file, copy all words between:
- a1: [ ... ] (lines 7-908)

Then format them like this:
*/

import { Word } from './types';

export const a1Words: Word[] = [
    // Paste your A1 words here from the original file
    // Example format (you have much more):
    { word: "about", type: "prep., adv.", meaning: "เกี่ยวกับ, ประมาณ" },
    { word: "above", type: "prep., adv.", meaning: "เหนือ, ข้างบน" },
    { word: "across", type: "prep., adv.", meaning: "ข้าม, ตรงข้าม" },
    // ... Continue with all your A1 words
    { word: "yourself", type: "pron.", meaning: "ตัวคุณเอง" },
];

/**
 * testQueries.js
 *
 * For each case in bench.json:
 *  - Sends a GET /query with the filters
 *  - Compares returned IDs to expected[]
 *  - Prints accuracy = (intersectionSize / expectedSize) * 100
 */

import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:5000';
const QUERY_PATH = '/api/food-donations'; 

// Load the benchmark cases
const benchPath = path.join(__dirname, 'bench.json');
if (!fs.existsSync(benchPath)) {
  console.error('bench.json not found in project root');
  process.exit(1);
}

const bench = JSON.parse(fs.readFileSync(benchPath, 'utf-8'));

async function run() {
  let totalAcc = 0;
  let count = 0;

  for (const testCase of bench) {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Throttle requests to avoid overwhelming the server
    const { name, filters, expected } = testCase;

    try {
      // Send the request
      const resp = await axios.get(`${BASE_URL}${QUERY_PATH}`, {
        params: {...filters},
        headers: { 'Content-Type': 'application/json' }
      });
      // Extract the returned IDs (adjust if your field is different)
      const results = resp.data.donations.map(donation => donation._id);

      // Compute intersection size
      const expSet = new Set(expected);
      const resSet = new Set(results);
      const intersectionSize = [...resSet].filter(id => expSet.has(id)).length;

      // Compute accuracy
      const expectedSize = expected.length;
      const accuracy = expectedSize
        ? (intersectionSize / expectedSize) * 100
        : 100;

      totalAcc += accuracy;
      count++;

      console.log(`\n[Test: ${name}]`);
      console.log(`  Expected count: ${expectedSize}`);
      console.log(`  Returned count: ${results.length}`);
      console.log(`  Matching items: ${intersectionSize}`);
      console.log(`  Accuracy: ${accuracy.toFixed(1)}%`);
    } catch (err) {
      console.error(`\nError in test "${name}":`, err.message);
    }
  }

  const avgAcc = count ? (totalAcc / count) : 0;
  console.log(`\n=== Average Accuracy Across ${count} Tests: ${avgAcc.toFixed(1)}% ===`);
}

// Run the tests
run();

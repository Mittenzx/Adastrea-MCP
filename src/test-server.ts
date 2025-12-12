#!/usr/bin/env node

/**
 * Simple test script to verify the MCP server functionality
 * This simulates MCP client requests to test the server
 */

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.join(__dirname, '..', 'build', 'index.js');

// Types for MCP request parameters
type McpRequestParams =
  | { protocolVersion: string; capabilities: { roots: { listChanged: boolean } }; clientInfo: { name: string; version: string } } // initialize
  | Record<string, never> // tools/list, resources/list (empty object)
  | { name: 'update_game_info'; arguments: { name: string; genre: string; engine: string; platform: string[]; repository_url: string; status: string } } // tools/call (update_game_info)
  | { name: 'get_game_info'; arguments: Record<string, never> } // tools/call (get_game_info)
  | { uri: string }; // resources/read

console.log('Starting MCP server test...\n');

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let responseBuffer = '';

server.stdout.on('data', (data: Buffer) => {
  responseBuffer += data.toString();
  // Try to parse complete JSON-RPC messages
  const lines = responseBuffer.split('\n');
  responseBuffer = lines.pop() || ''; // Keep incomplete line
  
  lines.forEach(line => {
    if (line.trim()) {
      try {
        const response = JSON.parse(line);
        console.log('Response:', JSON.stringify(response, null, 2));
      } catch (e) {
        // Not JSON, might be a log message
      }
    }
  });
});

server.stderr.on('data', (data: Buffer) => {
  console.log('Server log:', data.toString().trim());
});

// Helper to send JSON-RPC request
function sendRequest(method: string, params: McpRequestParams, id = 1): void {
  const request = {
    jsonrpc: '2.0',
    method,
    params,
    id
  };
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Helper to create a delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run tests sequentially using async/await
async function runTests(): Promise<void> {
  try {
    // Wait for server to start
    await delay(1000);
    
    console.log('\n=== Test 1: Initialize ===');
    sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        roots: { listChanged: true }
      },
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    }, 1);
    await delay(1000);

    console.log('\n=== Test 2: List Tools ===');
    sendRequest('tools/list', {}, 2);
    await delay(1000);

    console.log('\n=== Test 3: List Resources ===');
    sendRequest('resources/list', {}, 3);
    await delay(1000);

    console.log('\n=== Test 4: Update Game Info ===');
    sendRequest('tools/call', {
      name: 'update_game_info',
      arguments: {
        name: 'Adastrea',
        genre: 'Action RPG',
        engine: 'Unreal Engine 5',
        platform: ['PC', 'Console'],
        repository_url: 'https://github.com/Mittenzx/Adastrea',
        status: 'In Development'
      }
    }, 4);
    await delay(1000);

    console.log('\n=== Test 5: Get Game Info ===');
    sendRequest('tools/call', {
      name: 'get_game_info',
      arguments: {}
    }, 5);
    await delay(1000);

    console.log('\n=== Test 6: Read Resource ===');
    sendRequest('resources/read', {
      uri: 'game://project/summary'
    }, 6);
    await delay(1000);

    console.log('\n=== All tests completed ===');
    server.kill();
    process.exit(0);
  } catch (error) {
    console.error('Test error:', error);
    server.kill();
    process.exit(1);
  }
}

// Timeout handler
setTimeout(() => {
  console.log('\nTest timeout - stopping server');
  server.kill();
  process.exit(1);
}, 15000);

// Start tests
runTests();

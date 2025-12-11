#!/usr/bin/env node

/**
 * Simple test script to verify the MCP server functionality
 * This simulates MCP client requests to test the server
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const serverPath = path.join(__dirname, '..', 'build', 'index.js');

console.log('Starting MCP server test...\n');

const server = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe']
});

let responseBuffer = '';

server.stdout.on('data', (data) => {
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

server.stderr.on('data', (data) => {
  console.log('Server log:', data.toString().trim());
});

// Helper to send JSON-RPC request
function sendRequest(method: string, params: any, id = 1) {
  const request = {
    jsonrpc: '2.0',
    method,
    params,
    id
  };
  server.stdin.write(JSON.stringify(request) + '\n');
}

// Wait for server to start
setTimeout(() => {
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

  setTimeout(() => {
    console.log('\n=== Test 2: List Tools ===');
    sendRequest('tools/list', {}, 2);

    setTimeout(() => {
      console.log('\n=== Test 3: List Resources ===');
      sendRequest('resources/list', {}, 3);

      setTimeout(() => {
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

        setTimeout(() => {
          console.log('\n=== Test 5: Get Game Info ===');
          sendRequest('tools/call', {
            name: 'get_game_info',
            arguments: {}
          }, 5);

          setTimeout(() => {
            console.log('\n=== Test 6: Read Resource ===');
            sendRequest('resources/read', {
              uri: 'game://project/summary'
            }, 6);

            setTimeout(() => {
              console.log('\n=== All tests completed ===');
              server.kill();
              process.exit(0);
            }, 1000);
          }, 1000);
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);
}, 1000);

setTimeout(() => {
  console.log('\nTest timeout - stopping server');
  server.kill();
  process.exit(1);
}, 15000);

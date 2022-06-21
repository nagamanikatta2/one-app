/*
 * Copyright 2019 American Express Travel Related Services Company, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

import fs from 'fs';
import listen from '../../src/server/listen';
import { addServer } from '../../src/server/shutdown';

jest.mock('fs');
jest.mock('../../src/server/shutdown', () => ({
  addServer: jest.fn(),
}));

jest.spyOn(console, 'log').mockImplementation(() => { });
jest.spyOn(console, 'error').mockImplementation(() => { });

const origEnvVarVals = {};
[
  'HTTP_PORT',
  'HTTPS_PORT',
  'IP_ADDRESS',
  'HTTPS_PRIVATE_KEY_PATH',
  'HTTPS_PUBLIC_CERT_CHAIN_PATH',
  'HTTPS_TRUSTED_CA_PATH',
  'HTTPS_PRIVATE_KEY_PASS_FILE_PATH',
]
  .forEach((name) => { origEnvVarVals[name] = process.env[name]; });

function resetEnvVar(name, val) {
  if (val === undefined) {
    delete process.env[name];
  } else {
    process.env[name] = val;
  }
}

function clearAllEnvVars() {
  Object
    .keys(origEnvVarVals)
    .forEach((name) => delete process.env[name]);
  process.env.HTTP_PORT = 3000;
}

describe('server listen', () => {
  beforeEach(() => {
    clearAllEnvVars();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    Object
      .keys(origEnvVarVals)
      .forEach((name) => resetEnvVar(name, origEnvVarVals[name]));
  });

  it('creates an http server and stores the server\'s reference', async () => {
    expect.assertions(3);

    const fastifyInstance = {
      listen: jest.fn(),
    };

    await listen({
      context: 'unit testing',
      fastifyInstance,
      port: 8888,
    });

    expect(fastifyInstance.listen).toHaveBeenCalledWith({
      host: '0.0.0.0',
      port: 8888,
      https: null,
    });
    expect(addServer).toHaveBeenCalledWith(fastifyInstance);
    expect(console.log).toHaveBeenCalledWith('unit testing listening on port 8888');
  });

  it('creates an http server with custom host and stores the server\'s reference', async () => {
    expect.assertions(3);

    process.env.IP_ADDRESS = '127.0.0.1';

    const fastifyInstance = {
      listen: jest.fn(),
    };

    await listen({
      context: 'unit testing',
      fastifyInstance,
      port: 8888,
    });

    expect(fastifyInstance.listen).toHaveBeenCalledWith({
      host: '127.0.0.1',
      port: 8888,
      https: null,
    });
    expect(addServer).toHaveBeenCalledWith(fastifyInstance);
    expect(console.log).toHaveBeenCalledWith('unit testing listening on port 8888');
  });

  describe('HTTPS', () => {
    it('requires HTTPS_PRIVATE_KEY_PATH and HTTPS_PUBLIC_CERT_CHAIN_PATH env vars', async () => {
      expect.assertions(1);

      const fastifyInstance = {
        listen: jest.fn(),
      };

      let errorMsg;
      try {
        await listen({
          context: 'unit testing',
          fastifyInstance,
          port: 8888,
          https: true,
        });
      } catch (error) {
        errorMsg = error.message;
      }

      expect(errorMsg).toBe('HTTPS_PORT requires HTTPS_PRIVATE_KEY_PATH and HTTPS_PUBLIC_CERT_CHAIN_PATH to be set');
    });

    it('creates an https server with key and certificate and stores the server\'s reference', async () => {
      expect.assertions(3);

      process.env.HTTPS_PRIVATE_KEY_PATH = 'key';
      process.env.HTTPS_PUBLIC_CERT_CHAIN_PATH = 'cert';

      fs.readFileSync.mockImplementationOnce(() => 'key');
      fs.readFileSync.mockImplementationOnce(() => 'cert');

      const fastifyInstance = {
        listen: jest.fn(),
      };

      await listen({
        context: 'unit testing',
        fastifyInstance,
        port: 8888,
        https: true,
      });

      expect(fastifyInstance.listen).toHaveBeenCalledWith({
        host: '0.0.0.0',
        port: 8888,
        https: {
          cert: 'cert',
          key: 'key',
          minVersion: 'TLSv1.2',
        },
      });
      expect(addServer).toHaveBeenCalledWith(fastifyInstance);
      expect(console.log).toHaveBeenCalledWith('unit testing listening on port 8888');
    });

    it('creates an https server with key, certificate, and trusted ca, and stores the server\'s reference', async () => {
      expect.assertions(3);

      process.env.HTTPS_PRIVATE_KEY_PATH = 'key';
      process.env.HTTPS_PUBLIC_CERT_CHAIN_PATH = 'cert';
      process.env.HTTPS_TRUSTED_CA_PATH = 'trusted-ca';

      fs.readFileSync.mockImplementationOnce(() => 'key');
      fs.readFileSync.mockImplementationOnce(() => 'cert');
      fs.readFileSync.mockImplementationOnce(() => 'trusted-ca');

      const fastifyInstance = {
        listen: jest.fn(),
      };

      await listen({
        context: 'unit testing',
        fastifyInstance,
        port: 8888,
        https: true,
      });

      expect(fastifyInstance.listen).toHaveBeenCalledWith({
        host: '0.0.0.0',
        port: 8888,
        https: {
          cert: 'cert',
          key: 'key',
          minVersion: 'TLSv1.2',
          ca: ['trusted-ca'],
        },
      });
      expect(addServer).toHaveBeenCalledWith(fastifyInstance);
      expect(console.log).toHaveBeenCalledWith('unit testing listening on port 8888');
    });

    it('creates an https server with key, certificate, and passphrase, and stores the server\'s reference', async () => {
      expect.assertions(3);

      process.env.HTTPS_PRIVATE_KEY_PATH = 'key';
      process.env.HTTPS_PUBLIC_CERT_CHAIN_PATH = 'cert';
      process.env.HTTPS_PRIVATE_KEY_PASS_FILE_PATH = 'passphrase';

      fs.readFileSync.mockImplementationOnce(() => 'key');
      fs.readFileSync.mockImplementationOnce(() => 'cert');
      fs.readFileSync.mockImplementationOnce(() => 'secret!');

      const fastifyInstance = {
        listen: jest.fn(),
      };

      await listen({
        context: 'unit testing',
        fastifyInstance,
        port: 8888,
        https: true,
      });

      expect(fastifyInstance.listen).toHaveBeenCalledWith({
        host: '0.0.0.0',
        port: 8888,
        https: {
          cert: 'cert',
          key: 'key',
          minVersion: 'TLSv1.2',
          passphrase: 'secret!',
        },
      });
      expect(addServer).toHaveBeenCalledWith(fastifyInstance);
      expect(console.log).toHaveBeenCalledWith('unit testing listening on port 8888');
    });
  });

  it('app fails at start', async () => {
    expect.assertions(2);

    const fastifyInstance = {
      listen: jest.fn(() => {
        throw new Error('Testing Failure');
      }),
    };

    let error;
    try {
      await listen({
        context: 'unit testing',
        fastifyInstance,
        port: 8888,
      });
    } catch (err) {
      error = err;
    }

    expect(error.message).toBe('Testing Failure');
    expect(console.error).toHaveBeenCalledWith('Error encountered starting unit testing server', error);
  });
});

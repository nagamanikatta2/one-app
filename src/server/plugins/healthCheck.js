/*
 * Copyright 2022 American Express Travel Related Services Company, Inc.
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

/*
NOTE:
Most of this code is a clone from src/server/middleware/healthCheck.js
This is because the middleware is still used in the ssrServer.js file
via ExpressJS, which will be removed soon once the ssrServer.js is
migrated to Fastify
*/

import fp from 'fastify-plugin';
import pidusage from 'pidusage';
import { promisify } from 'util';
import { getModule } from 'holocron';
import { getClientStateConfig } from '../utils/stateConfig';
import { getModuleMapHealth } from '../utils/pollModuleMap';

const getProcessStats = (pid) => promisify((cb) => pidusage(pid, cb))();

export const getTickDelay = () => new Promise((resolve) => {
  const time = process.hrtime();
  setImmediate(() => { resolve(process.hrtime(time)); });
});

export const checkForRootModule = () => !!getModule(getClientStateConfig().rootModuleName);

export const verifyThresholds = ({
  process: { cpu, memory, tickDelay },
  holocron: { rootModuleExists },
}) => cpu <= 80
  && memory <= 1.4e9
  && tickDelay[0] < 1
  && rootModuleExists;

const healthCheck = (fastify, _opts, done) => {
  fastify.decorateReply('healthReport', async function () {
    const reply = this;

    try {
      const [processStats, tickDelay] = await Promise.all([
        getProcessStats(process.pid),
        getTickDelay(),
      ]);
      const holocron = {
        rootModuleExists: checkForRootModule(),
        moduleMapHealthy: getModuleMapHealth(),
      };
      const stats = {
        process: {
          ...processStats,
          tickDelay,
        },
        holocron,
      };
      const withinThresholds = verifyThresholds(stats);

      if (!holocron.moduleMapHealthy) {
        stats.process.status = 200;
        stats.holocron.status = 500;
        reply.code(207);
      } else if (withinThresholds) {
        reply.code(200);
      } else {
        reply.code(503);
      }

      reply.send(stats);
    } catch (err) {
      reply.code(500).send('');
    }
  });

  done();
};

export default fp(healthCheck);

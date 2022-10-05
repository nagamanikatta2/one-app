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

/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true }] */

import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from '@fastify/cors';
import fp from 'fastify-plugin';
import { argv } from 'yargs';
import Fastify from 'fastify';
import fastifyExpress from '@fastify/express';
import oneAppDevCdn from '@americanexpress/one-app-dev-cdn';

const hasLocalModuleMap = () => fs.existsSync(path.join(process.cwd(), 'static', 'module-map.json'));

const makeExpressRouter = () => {
  //const router = Fastify();

  //router.register(cors());
  // fastify.route({
  //   method: 'GET',
  //   url: '/static',
  //   handler:  () =>{return oneAppDevCdn({
  //     localDevPublicPath: path.join(__dirname, '../../static'),
  //     remoteModuleMapUrl: argv.moduleMapUrl,
  //     useLocalModules: hasLocalModuleMap(),
  //     appPort: process.env.HTTP_PORT,
  //     useHost: argv.useHost,
  //   })
  // }});
  // const opts = {
  //   schema: {
  //     response: {
  //       200: {
  //         type: 'object',
  //         properties: {
  //           hello: { type: 'string' }
  //         }
  //       }
  //     }
  //   }
  // }
  // router.get('/static', opts,
  //   oneAppDevCdn({
  //     localDevPublicPath: path.join(__dirname, '../../static'),
  //     remoteModuleMapUrl: argv.moduleMapUrl,
  //     useLocalModules: hasLocalModuleMap(),
  //     appPort: process.env.HTTP_PORT,
  //     useHost: argv.useHost,
  //   })
  // );


  // router.register(oneAppDevCdn({
  //   localDevPublicPath: path.join(__dirname, '../../static'),
  //   remoteModuleMapUrl: argv.moduleMapUrl,
  //   useLocalModules: hasLocalModuleMap(),
  //   appPort: process.env.HTTP_PORT,
  //   useHost: argv.useHost,
  // }));

  //return router;
};

const devHolocronCDN = async () => {
  const fastify = Fastify();


  await fastify.register(fastifyExpress);
console.log(path.join(__dirname, '../../static'),)
  fastify.register(fp (function(instance, options, next) {
    instance.decorate('devCdn',oneAppDevCdn())
    //console.log(instance.devCdn())
    // console.log(instance.devCdn({
    //   localDevPublicPath: path.join(__dirname, '../../static'),
    //   remoteModuleMapUrl: argv.moduleMapUrl,
    //   useLocalModules: hasLocalModuleMap(),
    //   appPort: process.env.HTTP_PORT,
    //   useHost: argv.useHost,
    // }))
    fastify.route({
      method:'GET',
      url:'/static',
      handler: instance.devCdn({
          localDevPublicPath: path.join(__dirname, '../../static'),
          remoteModuleMapUrl: argv.moduleMapUrl,
          useLocalModules: hasLocalModuleMap(),
          appPort: process.env.HTTP_PORT,
          useHost: argv.useHost,
        })
    });
    next()
  }));

  // registering as such way does make it run without parameters. 
  // fastify.register(require('@americanexpress/one-app-dev-cdn'))
  return fastify;
};

export default devHolocronCDN;

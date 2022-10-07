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
import { argv } from 'yargs';
import Fastify, { fastify } from 'fastify';
import fastifyExpress from '@fastify/express';
import fp from 'fastify-plugin';
import oneAppDevCdn from '@americanexpress/one-app-dev-cdn';

const hasLocalModuleMap = () => fs.existsSync(path.join(process.cwd(), 'static', 'module-map.json'));

const makeExpressRouter = async () => {
  const router= Fastify();
  await router.register(fastifyExpress)
  router.register(cors)
  
    router.get('/static',((request,reply,done)=>{
    reply.code(200).send(
    oneAppDevCdn({
      localDevPublicPath: path.join(__dirname, '../../static'),
      remoteModuleMapUrl: argv.moduleMapUrl,
      useLocalModules: hasLocalModuleMap(),
      appPort: process.env.HTTP_PORT,
      useHost: argv.useHost,
      routePrefix: '/static'
    }))
    done()
  }));
    
    

 
  
  
  return router;
};

const devHolocronCDN = async () => {
  var fastify = oneAppDevCdn({
    localDevPublicPath: path.join(__dirname, '../../static'),
    remoteModuleMapUrl: argv.moduleMapUrl,
    useLocalModules: hasLocalModuleMap(),
    appPort: process.env.HTTP_PORT,
    useHost: argv.useHost,
    routePrefix: '/static'
  });
  
  //await fastify.register(fastifyExpress);
  //fastify.use((()=>makeExpressRouter()));
  // const opts = {
  //   handler: function (request, reply) {
  //     //reply.code(200);
  //     return (()=>oneAppDevCdn({
  //       localDevPublicPath: path.join(__dirname, '../../static'),
  //       remoteModuleMapUrl: argv.moduleMapUrl,
  //       useLocalModules: hasLocalModuleMap(),
  //       appPort: process.env.HTTP_PORT,
  //       useHost: argv.useHost,
  //     }))
  //   }
  // }
  // fastify.register(fp (function(fastify, options, done) {
    //   fastify.decorate('devCdn',oneAppDevCdn({
      //     localDevPublicPath: path.join(__dirname, '../../static'),
      //     remoteModuleMapUrl: argv.moduleMapUrl,
      //     useLocalModules: hasLocalModuleMap(),
      //     appPort: process.env.HTTP_PORT,
      //     useHost: argv.useHost,
  //   }));
  //   console.log(fastify.devCdn({
  //     localDevPublicPath: path.join(__dirname, '../../static'),
  //     remoteModuleMapUrl: argv.moduleMapUrl,
  //     useLocalModules: hasLocalModuleMap(),
  //     appPort: process.env.HTTP_PORT,
  //     useHost: argv.useHost,
  //   }))
  //   done()
  // }));


  // fastify.route({
  //   method:'GET',
  //   url:'/static',
  //   handler: () => {oneAppDevCdn({
  //       localDevPublicPath: path.join(__dirname, '../../static'),
  //       remoteModuleMapUrl: argv.moduleMapUrl,
  //       useLocalModules: hasLocalModuleMap(),
  //       appPort: process.env.HTTP_PORT,
  //       useHost: argv.useHost,
  //     })}
  // });


  //  fastify = oneAppDevCdn({
  //   localDevPublicPath: path.join(__dirname, '../../static'),
  //   remoteModuleMapUrl: argv.moduleMapUrl,
  //   useLocalModules: hasLocalModuleMap(),
  //   appPort: process.env.HTTP_PORT,
  //   useHost: argv.useHost,
  // });


  //console.log(fastify)
  // fastify.get('/static', (request,reply)=>{
  //   return oneAppDevCdn({
  //       localDevPublicPath: path.join(__dirname, '../../static'),
  //       remoteModuleMapUrl: argv.moduleMapUrl,
  //       useLocalModules: hasLocalModuleMap(),
  //       appPort: process.env.HTTP_PORT,
  //       useHost: argv.useHost,
  //     })
  // });
  // registering as such way does make it run without parameters. 
  // fastify.register(require('@americanexpress/one-app-dev-cdn'))
  //console.log(fastify)
  
  return fastify;
};

export default devHolocronCDN;

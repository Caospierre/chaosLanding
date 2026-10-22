import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/game.js';
const tick=(g,n,k={})=>{for(let i=0;i<n;i++)g.step(1/60,k);};
test('player lands on cards and can jump from them',()=>{const g=new Game(1000,650,[{id:'platform',x:100,y:400,w:250,h:70}]);g.enemies=[];g.player.x=160;g.player.y=300;tick(g,60);assert.equal(g.player.y,360);assert.ok(g.player.ground);g.step(1/60,{jump:true});assert.ok(g.player.vy<0);});
test('ladder lets the player climb to upper platforms',()=>{const g=new Game(1000,650);g.enemies=[];g.player.x=170-g.player.w/2;const y=g.player.y;tick(g,60,{up:true});assert.ok(g.player.y<y-130);assert.ok(g.player.climb);});
test('hammer destroys reachable blocks and preserves distant blocks',()=>{const g=new Game(1000,650,[{id:'near',x:120,y:510,w:60,h:70},{id:'far',x:800,y:100,w:100,h:80}]);g.enemies=[];g.player.x=90;g.player.y=540;g.attack();assert.ok(g.blocks[0].dead);assert.ok(!g.blocks[1].dead);assert.equal(g.score,100);});
test('destroying the photo ends the game and reset reconstructs it',()=>{const g=new Game(1000,650,[{id:'portrait',critical:true,x:120,y:510,w:60,h:70}]);g.enemies=[];g.player.x=90;g.player.y=540;g.attack();assert.equal(g.state,'over');assert.ok(g.events.some(e=>e.type==='over'&&e.reason==='photo'));g.reset();assert.equal(g.state,'playing');assert.ok(!g.blocks[0].dead);assert.equal(g.hp,3);});
test('hammer stuns enemy and contact has a damage cooldown',()=>{const g=new Game(1000,650);g.player.x=100;g.enemies=[{x:132,y:542,w:22,h:38,stun:0,dir:-1}];g.attack();assert.ok(g.enemies[0].stun>0);assert.equal(g.score,50);g.enemies[0].stun=0;g.enemies[0].x=105;g.step(1/60,{});assert.equal(g.hp,2);g.enemies[0].x=g.player.x;g.step(1/60,{});assert.equal(g.hp,2);});

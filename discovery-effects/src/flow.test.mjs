import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {albums} from './catalog.mjs';
const source=readFileSync(new URL('./main.jsx',import.meta.url),'utf8');
test('one challenge album is distinguished from the historical collection',()=>{assert.equal(albums.filter(a=>a.challenge).length,1);assert.equal(albums.find(a=>a.challenge).title,'African Rhythms')});
test('listening is not faked and form does not claim backend registration',()=>{assert.match(source,/Audio preview not connected/);assert.match(source,/No registration has been sent or saved/);assert.match(source,/Choose this track/);assert.doesNotMatch(source,/fetch\(|localStorage|MediaRecorder/)});
test('track selection persists in URL and fields use native validation',()=>{assert.match(source,/searchParams.set\('grooveTrack'/);assert.match(source,/type="email" required/);assert.match(source,/reportValidity\(\)/);assert.match(source,/popstate/)});

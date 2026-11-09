import {readFileSync,writeFileSync,readdirSync,statSync} from 'node:fs';
import {resolve,relative} from 'node:path';
const root=process.cwd(),client=resolve(root,'dist/client');
const version=readFileSync(resolve(root,'lib/build-version.ts'),'utf8').match(/APP_BUILD_VERSION='([^']+)'/)[1];
function files(dir){return readdirSync(dir).flatMap(name=>{const p=resolve(dir,name);return statSync(p).isDirectory()?files(p):[p]});}
const assets=files(resolve(client,'_next/static')).filter(p=>/\.(js|css)$/.test(p)).map(p=>'/'+relative(client,p));
assets.push('/icons/tokyo-coral-suitcase-v20261007-180.png');
const script=readFileSync(resolve(root,'service-worker/shell-worker.js'),'utf8').replace('__BUILD_VERSION__',version).replace('__SHELL_ASSETS__',JSON.stringify(assets));
writeFileSync(resolve(client,'tokyo-shell-worker.js'),script);
console.log(JSON.stringify({startupCache:version,assets:assets.length,bytes:assets.reduce((n,p)=>n+statSync(resolve(client,'.'+p)).size,0)}));

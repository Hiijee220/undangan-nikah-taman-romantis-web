import {build} from 'vite';
import ts from 'typescript';
import {readFile,writeFile,access} from 'node:fs/promises';
try{await access('public/data.json')}catch{
 const code=ts.transpileModule(await readFile('src/config.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 const {defaults}=await import('data:text/javascript;base64,'+Buffer.from(code).toString('base64'));
 await writeFile('public/data.json',JSON.stringify(defaults,null,2)+'\n');
}
await writeFile('public/.nojekyll','');
await build({base:'./',build:{rollupOptions:{input:{invitation:'index.html',admin:'admin.html'}}},esbuild:{jsx:'automatic'},server:{host:'127.0.0.1'}});

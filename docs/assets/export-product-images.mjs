// Usage: node docs/assets/export-product-images.mjs /absolute/path/to/node_modules/sharp/dist/index.mjs
// Keep authoring tools outside the application dependency tree.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
if (!process.argv[2]) throw new Error('Pass the absolute path to the Sharp module.');
const sharp=(await import(pathToFileURL(path.resolve(process.argv[2])).href)).default;
const root=fileURLToPath(new URL('../images/',import.meta.url));
for(const key of ['workspace','explore','threads','data','reports']){
 const name='product-'+key, input=path.join(root,name+'.svg');
 await Promise.all([
  sharp(input).jpeg({quality:94,chromaSubsampling:'4:4:4'}).toFile(path.join(root,name+'.jpg')),
  sharp(input).webp({quality:91,effort:6}).toFile(path.join(root,name+'.webp')),
  sharp(input,{density:144}).png().toFile(path.join(root,name+'.png'))
 ]);
}
const original=await fs.readFile(path.join(root,'product-workspace.svg'),'utf8');
const social=original.replace('height="1100" viewBox="0 0 1600 1100"','height="900" viewBox="0 0 1600 900"').replace('One workspace. The whole question.','Good questions. Clearer answers.');
await fs.writeFile(path.join(root,'social-card.svg'),social);
await sharp(Buffer.from(social)).jpeg({quality:94,chromaSubsampling:'4:4:4'}).toFile(path.join(root,'social-card.jpg'));
console.log('Exported JPG, WebP, 2x PNG, and social card assets.');

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const template=fs.readFileSync(path.join(root,'assets/home.template'),'utf8');
const base='https://arpanjot-coding.github.io/Datly/';
const specs=[['en','en','English'],['ru','ru','Русский'],['zh','zh-Hans','简体中文'],['ja','ja','日本語'],['vi','vi','Tiếng Việt'],['th','th','ไทย'],['hi','hi','हिन्दी'],['ar','ar','العربية'],['fr','fr','Français'],['de','de','Deutsch'],['es','es','Español'],['it','it','Italiano']];
const english=JSON.parse(fs.readFileSync(path.join(root,'locales/en.json'),'utf8'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const urlFor=key=>base+(key==='en'?'':key+'/');
let built=0;
for(const [key,lang,native]of specs){
 const file=path.join(root,'locales',key+'.json');if(!fs.existsSync(file)){console.log('Waiting for '+key);continue;}
 const copy=JSON.parse(fs.readFileSync(file,'utf8'));
 const missing=Object.keys(english.translations).filter(k=>typeof copy.translations[k]!=='string'||!copy.translations[k].trim());
 if(missing.length)throw new Error(key+' missing '+missing.join('; '));
 const t=s=>copy.translations[s]??s;
 const prefix=key==='en'?'':'../',canonical=urlFor(key);
 let skip=0;
 let html=template.match(/<[^>]+>|[^<]+/g).map(token=>{
  if(/^<(script|pre)\b/.test(token)){skip++;return token;}
  if(/^<\/(script|pre)>/.test(token)){skip--;return token;}
  if(skip)return token;
  if(token.startsWith('<'))return token.replace(/(aria-label|alt|content)="([^"]+)"/g,(m,attr,text)=>attr+'="'+esc(t(text))+'"');
  const clean=token.trim();return clean&&copy.translations[clean]?token.replace(clean,esc(t(clean))):token;
 }).join('');
 html=html.replace('<html lang="en">','<html lang="'+lang+'" dir="'+copy.direction+'">');
 html=html.replace(/(src|href)="(images\/|favicon\.svg|styles\.css|site\.js|site\.webmanifest)/g,(_,attr,asset)=>attr+'="'+prefix+asset);
 html=html.replace('<link rel="canonical" href="'+base+'">','<link rel="canonical" href="'+canonical+'">\n'+specs.map(([route,code])=>'<link rel="alternate" hreflang="'+code+'" href="'+urlFor(route)+'">').join('\n')+'\n<link rel="alternate" hreflang="x-default" href="'+base+'">');
 html=html.replace('<meta property="og:url" content="'+base+'">','<meta property="og:url" content="'+canonical+'">');
 html=html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,()=>{
  const data={'@context':'https://schema.org','@type':'SoftwareSourceCode',name:'Datly',description:t('An open-source analytics workspace. Explore tables with AI, refine charts, inspect underlying rows, and turn your findings into reports.'),codeRepository:'https://github.com/arpanjot-coding/Datly',license:'https://github.com/arpanjot-coding/Datly/blob/main/LICENSE',programmingLanguage:['TypeScript','Python'],runtimePlatform:'Python 3.11 or later',inLanguage:lang,url:canonical};
  return '<script type="application/ld+json">'+JSON.stringify(data).replaceAll('<','\\u003c')+'</script>';
 });
 const menu='<details id="languages" class="language-menu"><summary aria-label="'+esc(t('Choose a language'))+'"><span aria-hidden="true">◎</span> '+key.toUpperCase()+' <span aria-hidden="true">⌄</span></summary><div class="language-options"><p>'+esc(t('Language'))+'</p>'+specs.map(([route,code,label])=>'<a href="'+prefix+(route==='en'?'./':route+'/')+'" lang="'+code+'" hreflang="'+code+'"'+(route===key?' aria-current="page"':'')+'>'+label+(route===key?' <span aria-hidden="true">✓</span>':'')+'</a>').join('')+'</div></details>';
 html=html.replace('<!-- LANGUAGE_MENU -->',menu);
 const runtime={language:lang,translations:key==='en'?{}:copy.translations};
 html=html.replace('<!-- LOCALE_COPY -->','<script id="locale-copy" type="application/json">'+JSON.stringify(runtime).replaceAll('<','\\u003c')+'</script>');
 const dir=key==='en'?root:path.join(root,key);fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),html.trimEnd()+'\n');
 built++;
}
const sitemap='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+specs.map(([key])=>'  <url><loc>'+urlFor(key)+'</loc><lastmod>2026-11-02</lastmod></url>').join('\n')+'\n</urlset>\n';
fs.writeFileSync(path.join(root,'sitemap.xml'),sitemap);
console.log('Built '+built+' static language pages; '+specs.length+' language URLs in sitemap.');

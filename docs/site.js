const localeCopy=JSON.parse(document.querySelector('#locale-copy')?.textContent||'{}');
const t=text=>localeCopy.translations?.[text]??text;
const siteRoot=new URL('.',document.querySelector('script[src$="site.js"]').src);
const numberFormat=new Intl.NumberFormat(localeCopy.language||'en');
const features = {
workspace:{title:'The Datly workspace',image:'product-workspace',alt:'Actual Datly workspace showing data threads, a stock-price chart, and computed rows.',caption:'Actual application capture, reframed for presentation. Example stock data; results require review.'},
explore:{title:'The rows behind the line.',description:'A chart is a starting point. Open the underlying table to inspect the values, check a transformation, and decide what the result actually means.',points:['Chart and computed table together','Inspect and export the derived rows','Review results before you share'],image:'product-explore',alt:'Detail views of the real Datly Explore canvas, showing a chart and computed data rows.',caption:'Actual application capture, reframed for clarity. Example data is illustrative; AI-generated analysis requires review.'},
threads:{title:'Keep the path to your answer.',description:'A follow-up question should build on what you have learned. Data threads keep the prompts, derived tables, and chart results in a visible analytical path.',points:['Follow prompts and derived tables','Explore a separate line of inquiry','Keep previous steps in context'],image:'product-threads',alt:'Actual Datly data threads showing separate stock-price questions and derived tables.',caption:'Actual application capture, cropped to focus on data threads. Example stock analysis.'},
data:{title:'Get to know your data.',description:'Look beyond the picture. Browse table rows, review data-quality signals, and export the derived data for a closer look in your own tools.',points:['Review table rows and columns','Inspect data-quality signals','Download the computed table as CSV'],image:'product-data',alt:'Actual Datly data inspection view with quality signals, table rows, and CSV export.',caption:'Actual application capture, cropped to focus on data inspection. Quality signals are diagnostics, not a certification of correctness.'},
reports:{title:'Give the finding some context.',description:'Turn an exploration into something another person can follow. Write and edit a report with chart images, then export an image or print to PDF.',points:['Rich-text editing with chart images','Add the reasoning around the result','Save an image or print to PDF'],image:'product-reports',alt:'An archived Data Formulator report example showing written findings and a chart.',caption:'Archived report example from the repository; it shows the earlier Data Formulator interface. Current report editing uses TipTap. Chart embeds are images.'}
};
for(const feature of Object.values(features)){for(const key of ['title','description','alt','caption'])if(feature[key])feature[key]=t(feature[key]);if(feature.points)feature.points=feature.points.map(t);}
const featureTabs = [...document.querySelectorAll('[data-feature]')];
function selectFeature(key) {
 const feature=features[key]; if(!feature||key==='workspace')return;
 featureTabs.forEach(tab=>{const selected=tab.dataset.feature===key;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
 document.querySelector('#feature-panel').setAttribute('aria-labelledby','tab-'+key);
 document.querySelector('#feature-title').textContent=feature.title;
 document.querySelector('#feature-description').textContent=feature.description;
 document.querySelector('#feature-points').replaceChildren(...feature.points.map(point=>{const li=document.createElement('li');li.textContent=point;return li;}));
 const image=document.querySelector('#feature-image');image.src=new URL('images/'+feature.image+'.webp',siteRoot).href;image.alt=feature.alt;
 document.querySelectorAll('#feature-panel .image-trigger').forEach(button=>{button.dataset.image=key;});
 document.querySelector('#feature-note').textContent=feature.caption;
}
featureTabs.forEach(tab=>tab.addEventListener('click',()=>selectFeature(tab.dataset.feature)));
function tabKeyboard(tabs,handler){tabs.forEach((tab,index)=>tab.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;handler(tabs[next]);tabs[next].focus();}));}
tabKeyboard(featureTabs,tab=>selectFeature(tab.dataset.feature));
document.querySelectorAll('[data-select-feature]').forEach(link=>link.addEventListener('click',()=>selectFeature(link.dataset.selectFeature)));
const menu=document.querySelector('.menu-toggle'),navigation=document.querySelector('#navigation');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label',t('Open navigation'));navigation.classList.remove('is-open');}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',t(open?'Close navigation':'Open navigation'));navigation.classList.toggle('is-open',open);});
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
const sources=[...document.querySelectorAll('.source-list li')];
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(filter=>filter.setAttribute('aria-pressed',String(filter===button)));
 let count=0;sources.forEach(source=>{const visible=button.dataset.filter==='all'||source.dataset.category===button.dataset.filter;source.hidden=!visible;if(visible)count++;});
 document.querySelector('.source-status').textContent=t('Showing {count} source options. Names describe implementations, not certified integrations.').replace('{count}',numberFormat.format(count));
}));
const commands={
source:'# Get the project\ngit clone https://github.com/arpanjot-coding/Datly.git\ncd Datly\n\n# Build the interface\nyarn\nyarn build\n\n# Install Python dependencies and launch\nuv sync\nuv run data_formulator',
docker:'# Requires Docker with Docker Compose\ngit clone https://github.com/arpanjot-coding/Datly.git\ncd Datly\n\n# Copy .env.template to .env before launch\n# macOS / Linux:\ncp .env.template .env\n# PowerShell: Copy-Item .env.template .env\n\n# Build and start\ndocker compose up --build'
};
let activeSetup='source';const setupTabs=[...document.querySelectorAll('[data-setup]')];
function selectSetup(key){activeSetup=key;setupTabs.forEach(tab=>{const selected=tab.dataset.setup===key;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});document.querySelector('#setup-code code').textContent=commands[key];document.querySelector('#setup-code').setAttribute('aria-labelledby','setup-tab-'+key);}
setupTabs.forEach(tab=>tab.addEventListener('click',()=>selectSetup(tab.dataset.setup)));
tabKeyboard(setupTabs,tab=>selectSetup(tab.dataset.setup));
document.querySelector('#copy-code').addEventListener('click',async()=>{
 const button=document.querySelector('#copy-code');
 try{await navigator.clipboard.writeText(commands[activeSetup]);button.textContent=t("Copied ✓");document.querySelector('#copy-status').textContent=t("Installation commands copied.");setTimeout(()=>{button.textContent=t("Copy ⧉");},2500);}
 catch{document.querySelector('#setup-code').focus();const selection=window.getSelection(),range=document.createRange();range.selectNodeContents(document.querySelector('#setup-code code'));selection.removeAllRanges();selection.addRange(range);button.textContent=t("Select & copy");document.querySelector('#copy-status').textContent=t("Automatic copy is unavailable. The commands are selected; use your browser’s copy shortcut.");}
});
const dialog=document.querySelector('.image-dialog');
document.querySelectorAll('.image-trigger').forEach(button=>button.addEventListener('click',()=>{
 const feature=features[button.dataset.image];if(!feature)return;
 document.querySelector('#dialog-title').textContent=feature.title;
 const image=document.querySelector('#dialog-image');image.src=new URL('images/'+feature.image+'.webp',siteRoot).href;image.alt=feature.alt;
 document.querySelector('#dialog-caption').textContent=feature.caption;dialog.showModal();
}));
document.querySelector('#close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();}});



const languageMenu=document.querySelector('.language-menu');
document.addEventListener('click',event=>{if(languageMenu&&!languageMenu.contains(event.target))languageMenu.open=false;});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&languageMenu?.open){languageMenu.open=false;languageMenu.querySelector('summary').focus();}});
document.querySelectorAll('[data-github-stars]').forEach(node=>{node.title=t('GitHub stars; verified 2 November 2026');});
async function refreshGitHubStars(){
 try{
  const response=await fetch('https://api.github.com/repos/arpanjot-coding/Datly',{headers:{Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(6000)});
  if(!response.ok)return;
  const data=await response.json();if(!Number.isSafeInteger(data.stargazers_count)||data.stargazers_count<0)return;
  document.querySelectorAll('[data-github-stars]').forEach(node=>{node.textContent=numberFormat.format(data.stargazers_count);node.title=t('Stars on GitHub');});
 }catch{/* Keep the dated, verified count when GitHub is unavailable or rate-limited. */}
}
refreshGitHubStars();

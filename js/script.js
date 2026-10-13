const $=id=>document.getElementById(id),reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const S=new Date(CONFIG.start+"T00:00:00");
const ord=n=>{const s=["th","st","nd","rd"],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0])};
const fmt=d=>d.toLocaleDateString('en',{month:'long',day:'numeric',year:'numeric'});
window.ph=()=>{const d=document.createElement('div');d.className='ph';d.innerHTML='<span>📷</span>Add your photo';return d};

$('gHi').textContent="Hi, "+CONFIG.her;

function polaroid(src,label){
  const media=/\.(mp4|webm|mov)$/i.test(src)
    ? `<video src="${src}" muted loop playsinline preload="metadata" controls></video>`
    : `<img src="${src}" alt="${label}" onerror="this.replaceWith(ph())">`;
  return `<figure class="pol">${media}<figcaption>${label}</figcaption></figure>`;
}
const yesParas=CONFIG.yes.text.split(/\n\s*\n/).map(t=>`<p>${t.trim()}</p>`).join('');
$('yesSec').innerHTML=`<div>${polaroid(CONFIG.yes.photo,"She said yes")}<time>${fmt(S)}</time><div class="story">${yesParas}</div></div>`;

const tl=$('tl');
for(let i=1;i<=24;i++){
  const ann=i===12||i===24;
  const label=i===12?"1st Anniversary":i===24?"2nd Anniversary":ord(i)+" Month";
  const d=new Date(S.getFullYear(),S.getMonth()+i,S.getDate());
  const note=CONFIG.notes[i]||"Write a short memory for this month here.";
  tl.insertAdjacentHTML('beforeend',`<article class="it${ann?' ann':''}"><i class="dot"></i><div class="card">${polaroid((CONFIG.videos&&CONFIG.videos[i])||`images/${i}.${CONFIG.ext}`,label)}<time>${fmt(d)}</time><p>${note}</p></div></article>`);
}

/* reveal: photos "develop" when they enter the view */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.3});
document.querySelectorAll('.it,.yes').forEach(el=>io.observe(el));

/* live counter */
function tick(){
  const s=Math.max(0,Math.floor((Date.now()-S)/1000));
  $('cd').textContent=Math.floor(s/86400).toLocaleString();
  $('ch').textContent=Math.floor(s%86400/3600);
  $('cm').textContent=Math.floor(s%3600/60);
  $('cs').textContent=s%60;
}
tick();setInterval(tick,1000);

/* scroll progress + timeline fill */
function onScroll(){
  const h=document.documentElement,max=h.scrollHeight-innerHeight;
  $('bar').style.width=(max>0?scrollY/max*100:0)+'%';
  const r=tl.getBoundingClientRect(),p=Math.min(1,Math.max(0,(innerHeight*.6-r.top)/r.height));
  tl.style.setProperty('--p',(p*100)+'%');
}
addEventListener('scroll',onScroll,{passive:true});onScroll();

/* floating hearts */
if(!reduce)for(let i=0;i<16;i++){
  const h=document.createElement('span');h.className='fh';h.textContent='♥';
  h.style.cssText=`left:${Math.random()*100}%;font-size:${10+Math.random()*18}px;animation-duration:${14+Math.random()*16}s;animation-delay:${Math.random()*-20}s`;
  document.body.appendChild(h);
}

/* gate + music */
const audio=new Audio(CONFIG.song);audio.loop=true;audio.volume=.6;
const mBtn=$('music');let playing=false;
audio.addEventListener('error',()=>mBtn.classList.remove('on'));
function setPlay(on){playing=on;mBtn.classList.toggle('pause',!on);on?audio.play().catch(()=>{}):audio.pause()}
/* date gate: she must enter the day she said yes */
const ans=CONFIG.start.split('-').map(Number); // [year, month, day]
const gi=['gm','gd','gy'].map($);
gi.forEach((el,k)=>{
  el.addEventListener('input',()=>{
    el.value=el.value.replace(/\D/g,'');
    if(el.value.length===el.maxLength&&gi[k+1])gi[k+1].focus();
  });
  el.addEventListener('keydown',e=>{
    if(e.key==='Enter')unlock();
    if(e.key==='Backspace'&&!el.value&&gi[k-1])gi[k-1].focus();
  });
});
let tries=0;
function unlock(){
  const [m,d,y]=gi.map(el=>+el.value);
  if(m===ans[1]&&d===ans[2]&&y===ans[0]){
    $('gate').classList.add('off');document.body.classList.remove('lock');
    scrollTo(0,0);mBtn.classList.add('on');setPlay(true);
  }else{
    tries++;const f=$('gform');
    f.classList.remove('shake');void f.offsetWidth;f.classList.add('shake');
    $('gmsg').textContent=tries>=3?CONFIG.hint:"That's not the day. Try again.";
  }
}
$('open').onclick=unlock;
mBtn.onclick=()=>setPlay(!playing);

/* typed love letter: starts when she scrolls to it */
const letterEl=$('letter'),letterTxt=CONFIG.letter,letterChars=Array.from(letterTxt);
(document.fonts?document.fonts.ready:Promise.resolve()).then(()=>{
  letterEl.textContent=letterTxt;
  letterEl.style.minHeight=letterEl.offsetHeight+'px';
  letterEl.textContent=reduce?letterTxt:'';
});
let typed=false;
new IntersectionObserver((es,o)=>{
  if(!es[0].isIntersecting||typed)return;
  typed=true;o.disconnect();
  if(reduce){letterEl.textContent=letterTxt;return}
  letterEl.classList.add('typing');let i=0;
  (function t(){
    letterEl.textContent=letterChars.slice(0,++i).join('');
    if(i<letterChars.length)setTimeout(t,12);else letterEl.classList.remove('typing');
  })();
},{rootMargin:'0px 0px -30% 0px'}).observe(letterEl);

/* the question */
const no=$('no'),yes=$('yes');let dodge=0;
function run(e){
  e.preventDefault();dodge++;
  const b=$('btns').getBoundingClientRect();
  no.style.transform=`translate(${(Math.random()-.5)*Math.min(b.width,300)}px,${(Math.random()-.5)*160}px)`;
  yes.style.transform=`scale(${Math.min(1+dodge*.12,1.7)})`;
  if(dodge>=6)no.textContent="Okay, it's a yes";
}
no.addEventListener('pointerenter',e=>{if(dodge<6)run(e)});
no.addEventListener('click',e=>{dodge<6?run(e):yes.click()});
yes.onclick=()=>{
  $('btns').style.display='none';
  const d=$('done');d.style.display='block';
  d.innerHTML=`I knew it. Happy 2nd anniversary, ${CONFIG.her}.<small>With love, ${CONFIG.me}</small>`;
  if(!reduce)confetti();
};

function confetti(){
  const c=$('fx'),x=c.getContext('2d');c.width=innerWidth;c.height=innerHeight;
  const cols=['#e5718c','#d9a86c','#f7d9d0','#ff8fa8'];
  const ps=Array.from({length:110},()=>({x:innerWidth/2,y:innerHeight*.7,vx:(Math.random()-.5)*14,vy:-Math.random()*16-4,s:12+Math.random()*16,c:cols[Math.random()*4|0],r:Math.random()*6}));
  let f=0;
  (function a(){
    x.clearRect(0,0,c.width,c.height);
    ps.forEach(p=>{p.vy+=.28;p.x+=p.vx;p.y+=p.vy;p.r+=.05;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.font=p.s+'px serif';x.fillText('♥',0,0);x.restore()});
    if(++f<240)requestAnimationFrame(a);else x.clearRect(0,0,c.width,c.height);
  })();
}

/* videos play when scrolled into view, pause when out of view */
const vio=new IntersectionObserver(es=>es.forEach(e=>{
  const v=e.target;
  if(e.isIntersecting){v.muted=true;v.play().catch(()=>{})}
  else v.pause();
}),{threshold:.6});
document.querySelectorAll('.pol video').forEach(v=>vio.observe(v));
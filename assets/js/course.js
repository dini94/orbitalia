(() => {
  const $ = id => document.getElementById(id);
  const scfCanvas = $('scfChart');
  function drawSCF(values) {
    if (!scfCanvas) return;
    const ctx = scfCanvas.getContext('2d'), w = scfCanvas.width, h = scfCanvas.height;
    ctx.clearRect(0,0,w,h); ctx.fillStyle='#f9faf7'; ctx.fillRect(0,0,w,h);
    const pad={l:58,r:20,t:20,b:42}, pw=w-pad.l-pad.r, ph=h-pad.t-pad.b;
    ctx.strokeStyle='#dce4da'; ctx.lineWidth=1;
    for(let i=0;i<=4;i++){let y=pad.t+ph*i/4;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();}
    ctx.fillStyle='#65736c';ctx.font='12px sans-serif';ctx.fillText('Relative energy error (illustrative)',pad.l,13);
    ctx.fillText('SCF iteration',w/2-30,h-9);
    ctx.strokeStyle='#5b914b';ctx.lineWidth=3;ctx.beginPath();
    values.forEach((v,i)=>{const x=pad.l+pw*i/Math.max(1,values.length-1);const y=pad.t+ph*(1-v);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();
    values.forEach((v,i)=>{const x=pad.l+pw*i/Math.max(1,values.length-1),y=pad.t+ph*(1-v);ctx.fillStyle='#5b914b';ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill()});
    ctx.fillStyle='#65736c';ctx.fillText('0',pad.l-18,pad.t+ph+4);ctx.fillText(String(values.length-1),w-pad.r-8,pad.t+ph+22);
  }
  function run() {
    const mix=Number($('mixing').value), thr=Number($('threshold').value);
    $('mixOut').textContent=mix.toFixed(2);
    let vals=[],v=1;
    for(let i=0;i<30;i++){vals.push(v);v*=Math.max(.06,1-mix*1.7);if(i>5&&v<thr*.1){vals.push(v);break}}
    drawSCF(vals);
    const iterations=vals.length-1;
    $('scfSummary').textContent=`Teaching model converged after ${iterations} iterations (illustrative). Lower mixing may stabilize some systems but can slow convergence; real SCF behavior is system-dependent.`;
  }
  if($('mixing')) $('mixing').addEventListener('input',run);
  if($('threshold')) $('threshold').addEventListener('change',run);
  if($('runScf')) $('runScf').addEventListener('click',run);
  run();
  const h=$('homoRange'), l=$('lumoRange');
  function updateGap(){
    const hv=Number(h.value),lv=Number(l.value);
    $('homoRangeOut').textContent=`${hv.toFixed(1)} eV`; $('lumoRangeOut').textContent=`${lv.toFixed(1)} eV`;
    $('homoValue').textContent=`${hv.toFixed(2)} eV`; $('lumoValue').textContent=`${lv.toFixed(2)} eV`;
    $('gapValue').textContent=`${(lv-hv).toFixed(2)} eV gap`;
  }
  if(h&&l){h.addEventListener('input',updateGap);l.addEventListener('input',updateGap);updateGap();}
  const c=$('spectrumChart');
  if(c){
    const ctx=c.getContext('2d'),w=c.width,hh=c.height,pad={l:50,r:20,t:25,b:40},pw=w-pad.l-pad.r,ph=hh-pad.t-pad.b;
    ctx.fillStyle='#fbfcf8';ctx.fillRect(0,0,w,hh);ctx.strokeStyle='#dce4da';
    for(let i=0;i<=4;i++){let y=pad.t+ph*i/4;ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(w-pad.r,y);ctx.stroke();}
    const peaks=[{x:340,a:.28,s:15},{x:400,a:.55,s:18},{x:528,a:1,s:27},{x:610,a:.18,s:25}];
    const intensity=x=>peaks.reduce((sum,p)=>sum+p.a*Math.exp(-.5*Math.pow((x-p.x)/p.s,2)),0);
    ctx.strokeStyle='#55864c';ctx.lineWidth=3;ctx.beginPath();
    for(let x=280;x<=700;x+=2){let px=pad.l+(x-280)/420*pw,py=pad.t+ph*(1-intensity(x));x===280?ctx.moveTo(px,py):ctx.lineTo(px,py)}ctx.stroke();
    ctx.fillStyle='#65736c';ctx.font='12px sans-serif';ctx.fillText('Relative absorbance (illustrative)',pad.l,14);ctx.fillText('Wavelength (nm)',w/2-45,hh-9);
    [300,400,500,600,700].forEach(x=>ctx.fillText(x,pad.l+(x-280)/420*pw-10,hh-pad.b+18));
  }
})();
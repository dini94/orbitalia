(() => {
  const $=id=>document.getElementById(id);
  let parsedGeometry=[];
  const ehToEv=27.211386245988;
  function setText(id,v){$(id).textContent=v}
  function renderRows(id,rows,cols,empty){$(id).innerHTML=rows.length?rows.map(r=>`<tr>${r.map(x=>`<td>${escapeHtml(String(x))}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${cols}">${empty}</td></tr>`}
  function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function parse(text){
    const out={program:/O\s+R\s+C\s+A/i.test(text)?'ORCA':/Gaussian, Inc/i.test(text)?'Gaussian':'Unknown',energy:null,scf:'Not recognized',opt:'—',freq:[],geometry:[],homo:null,lumo:null,excited:[]};
    let m;
    const energyPatterns=[/FINAL SINGLE POINT ENERGY\s+(-?\d+\.\d+)/g,/SCF Done:\s+E\([^)]*\)\s*=\s*(-?\d+\.\d+)/g];
    for(const re of energyPatterns){let matches=[...text.matchAll(re)];if(matches.length)out.energy=Number(matches[matches.length-1][1])}
    out.scf=/SCF CONVERGED AFTER/i.test(text)||/SCF Done:/i.test(text)?'Converged (text match)':/SCF NOT CONVERGED|SCF failed/i.test(text)?'Failure phrase found':'Not recognized';
    const optMatches=[...text.matchAll(/GEOMETRY OPTIMIZATION CYCLE\s+(\d+)/gi)];out.opt=optMatches.length?optMatches[optMatches.length-1][1]:'Not recognized';
    const freqRegex=/Frequencies --\s+(-?\d+(?:\.\d+)?)(?:\s+(-?\d+(?:\.\d+)?))?(?:\s+(-?\d+(?:\.\d+)?))?/g;
    for(const f of text.matchAll(freqRegex)){for(let i=1;i<=3;i++)if(f[i]!==undefined)out.freq.push(Number(f[i]))}
    const orcaFreq=/^\s*(\d+):\s+(-?\d+(?:\.\d+)?)\s+cm\*\*-1/gm;
    for(const f of text.matchAll(orcaFreq))out.freq.push(Number(f[2]));
    const homoMatches=[...text.matchAll(/HOMO(?:-LUMO)?\s*(?:energy)?\s*[:=]?\s*(-?\d+(?:\.\d+)?)\s*(?:eV)?/gi)];
    if(homoMatches.length)out.homo=Number(homoMatches[homoMatches.length-1][1]);
    const orb=/HOMO\s*[:=]\s*(-?\d+(?:\.\d+)?).*?LUMO\s*[:=]\s*(-?\d+(?:\.\d+)?)/is.exec(text);
    if(orb){out.homo=Number(orb[1]);out.lumo=Number(orb[2])}
    const ex1=/Excited State\s+(\d+):.*?(\d+\.\d+)\s+eV\s+([\d.]+)\s+nm\s+f=([\d.]+)/g;
    for(const e of text.matchAll(ex1))out.excited.push({state:Number(e[1]),energy:Number(e[2]),wavelength:Number(e[3]),osc:Number(e[4]),assignment:e[0].split(':').slice(1).join(':').trim()});
    const ex2=/STATE\s+(\d+):\s+E=\s*(-?\d+(?:\.\d+)?)\s+au\s+([-\d.]+)\s+eV\s+([-\d.]+)\s+nm\s+fosc=\s*([\d.]+)/gi;
    for(const e of text.matchAll(ex2))out.excited.push({state:Number(e[1]),energy:Number(e[4]),wavelength:Number(e[5]),osc:Number(e[6]),assignment:e[0]});
    const lines=text.split(/\r?\n/);
    for(let i=0;i<lines.length;i++){
      if(/Standard orientation:|Input orientation:/.test(lines[i])){
        let j=i+1;while(j<lines.length&&!/^-{5,}/.test(lines[j].trim()))j++;j++;
        while(j<lines.length&&!/^-{5,}/.test(lines[j].trim())){
          const p=lines[j].trim().split(/\s+/);
          if(p.length>=6&&/^\d+$/.test(p[0])&&/^\d+$/.test(p[1])){const z=Number(p[1]),el=({1:'H',2:'He',3:'Li',4:'Be',5:'B',6:'C',7:'N',8:'O',9:'F',10:'Ne',11:'Na',12:'Mg',13:'Al',14:'Si',15:'P',16:'S',17:'Cl',18:'Ar',35:'Br',53:'I'})[z]||`Z${z}`;out.geometry.push({el,x:Number(p[3]),y:Number(p[4]),z:Number(p[5])})}j++
        }
      }
      if(/CARTESIAN COORDINATES \(ANGSTROEM\)/i.test(lines[i])){
        let j=i+1;while(j<lines.length&&!lines[j].trim())j++;
        const temp=[];for(;j<lines.length;j++){let p=lines[j].trim().split(/\s+/);if(p.length<4||!/^[-+]?\d/.test(p[1])){if(temp.length)break;continue}temp.push({el:p[0],x:Number(p[1]),y:Number(p[2]),z:Number(p[3])})}if(temp.length)out.geometry=temp;
      }
    }
    if(out.geometry.length)out.geometry=out.geometry.slice(-Math.max(1,out.geometry.length));
    return out;
  }
  function showSpectrum(ex){
    if(!window.Plotly){$('spectrumPlot').textContent='Plot library unavailable. Parsed transition table remains available.';return}
    if(!ex.length){Plotly.purge('spectrumPlot');$('spectrumPlot').textContent='No recognized excited states.';return}
    const xs=[];for(let x=250;x<=900;x+=2)xs.push(x);
    const ys=xs.map(x=>ex.reduce((s,e)=>s+(e.osc||0)*Math.exp(-.5*Math.pow((x-e.wavelength)/14,2)),0));
    Plotly.newPlot('spectrumPlot',[{x:xs,y:ys,type:'scatter',mode:'lines',line:{color:'#4f8747',width:3},name:'Broadened spectrum'},{x:ex.map(e=>e.wavelength),y:ex.map(e=>e.osc||0),type:'bar',opacity:.35,name:'Oscillator strengths'}],{margin:{l:45,r:15,t:15,b:45},paper_bgcolor:'#fff',plot_bgcolor:'#f8faf6',xaxis:{title:'Wavelength (nm)'},yaxis:{title:'Relative intensity'},showlegend:true},{responsive:true,displayModeBar:false});
  }
  $('outputFile').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;
    $('parseStatus').textContent=`Reading ${file.name} (${Math.round(file.size/1024)} kB) locally…`;
    try{
      const text=await file.text(),d=parse(text);
      setText('programValue',d.program);setText('energyValue',d.energy===null?'Not found':`${d.energy.toFixed(7)} Eh`);setText('scfValue',d.scf);setText('optValue',d.opt);
      $('frequencySummary').textContent=d.freq.length?`${d.freq.length} frequency value(s) recognized.`:'No supported frequency pattern recognized.';
      renderRows('frequencyRows',d.freq.map((v,i)=>[i+1,v.toFixed(2),v< -10?'Significant imaginary candidate':v<0?'Small negative; inspect mode':'Real/positive']),3,'No frequencies recognized');
      setText('anHomo',d.homo===null?'—':`${d.homo.toFixed(3)} eV`);setText('anLumo',d.lumo===null?'—':`${d.lumo.toFixed(3)} eV`);setText('anGap',d.homo!==null&&d.lumo!==null?`${(d.lumo-d.homo).toFixed(3)} eV gap`:'Gap unavailable');
      parsedGeometry=d.geometry||[];
      renderRows('geometryRows',parsedGeometry.map(a=>[a.el,a.x.toFixed(6),a.y.toFixed(6),a.z.toFixed(6)]),4,'No coordinates recognized');
      if(parsedGeometry.length){$('geometryBox').innerHTML=`<div class="empty-state">Parsed ${parsedGeometry.length} atom(s).<br><small>Coordinate table available below; interactive 3D geometry rendering is not enabled in this parser build.</small></div>`;$('downloadXYZ').disabled=false}else{$('geometryBox').innerHTML='<div class="empty-state">No geometry parsed yet.</div>';$('downloadXYZ').disabled=true}
      renderRows('excitedRows',d.excited.map(e=>[e.state,e.energy.toFixed(4),e.wavelength.toFixed(2),e.osc.toFixed(4),e.assignment]),5,'No transitions recognized');
      $('spectrumSummary').textContent=d.excited.length?`${d.excited.length} transition(s) parsed; curve is a Gaussian broadening for visual inspection.`:'No TD-DFT transitions recognized.';
      showSpectrum(d.excited);
      $('parseStatus').textContent=`Loaded ${file.name}. Best-effort parsing completed; compare each extracted value against the original output.`;
    }catch(err){$('parseStatus').textContent=`Could not read file: ${err.message}`;$('parseStatus').classList.add('warning')}
  });
  $('downloadXYZ').addEventListener('click',()=>{if(!parsedGeometry.length)return;const txt=`${parsedGeometry.length}\nParsed by CCLab; verify before reuse\n`+parsedGeometry.map(a=>`${a.el} ${a.x} ${a.y} ${a.z}`).join('\n')+'\n';const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'}));a.download='parsed_geometry.xyz';a.click();URL.revokeObjectURL(a.href)});
  $('calcElectro').addEventListener('click',()=>{
    const n=Number($('enNeutral').value),c=Number($('enCation').value),a=Number($('enAnion').value);
    if(![$('enNeutral').value,$('enCation').value,$('enAnion').value].every(v=>v.trim()!==''&&Number.isFinite(Number(v)))){$('electroResults').innerHTML='<div>Enter all three total energies.</div>';return}
    const ip=(c-n)*ehToEv,ea=(n-a)*ehToEv,eta=(ip-ea)/2,mu=-(ip+ea)/2,omega=eta>0?mu*mu/(2*eta):NaN,soft=eta!==0?1/(2*eta):NaN;
    const vals=[['IP',ip,'eV'],['EA',ea,'eV'],['Hardness η',eta,'eV'],['Softness S',soft,'eV⁻¹'],['Chemical potential μ',mu,'eV'],['Electrophilicity ω',omega,'eV']];
    $('electroResults').innerHTML=vals.map(v=>`<div><b>${v[0]}</b><span>${Number.isFinite(v[1])?v[1].toFixed(4):'undefined'} ${v[2]}</span></div>`).join('');
  });
})();
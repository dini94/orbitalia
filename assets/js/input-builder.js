(() => {
  const $=id=>document.getElementById(id);
  const getProgram=()=>document.querySelector('input[name="program"]:checked').value;
  function solventOrca(v){return ({water:'Water',dmf:'DMF',acetonitrile:'Acetonitrile',ethanol:'Ethanol'})[v]||''}
  function solventGaussian(v){return ({water:'Water',dmf:'DMF',acetonitrile:'Acetonitrile',ethanol:'Ethanol'})[v]||''}
  function generate(){
    const prog=getProgram(),method=$('method').value,basis=$('basis').value,job=$('job').value,charge=Number($('charge').value),mult=Math.max(1,Number($('multiplicity').value)||1),solv=$('solvent').value,disp=$('dispersion').value,scf=$('scf').value,coords=$('coordinates').value.trim();
    if(!coords){$('inputMessage').textContent='Coordinates are required.';return}
    const lines=coords.split(/\r?\n/).filter(x=>x.trim()&&!x.trim().startsWith('#'));
    if(lines.some(x=>!/^([A-Z][a-z]?)\s+[-+]?\d/.test(x.trim()))){$('inputMessage').textContent='Some coordinate lines do not look like element x y z. Check the Cartesian coordinate block.';$('inputMessage').classList.add('warning');return}
    let text='',filename='';
    if(prog==='orca'){
      const jobFlag=({sp:'',opt:'Opt',freq:'Freq',optfreq:'Opt Freq',tddft:'Opt'}[job]);
      let methodLine=[method,disp==='none'?'':disp==='D3BJ'?'D3BJ':'D4',basis,scf==='normal'?'':scf==='tight'?'TightSCF':'VeryTightSCF',jobFlag].filter(Boolean).join(' ');
      text=`! ${methodLine}\n`;
      if(solv!=='none') text+=`! CPCM(${solventOrca(solv)})\n`;
      if(job==='tddft') text+=`\n%tddft\n  nroots ${Math.max(1,Math.min(200,Number($('nstates').value)||20))}\nend\n`;
      text+=`\n%pal\n  nprocs 8\nend\n\n* xyz ${charge} ${mult}\n${lines.join('\n')}\n*\n`;
      filename='molecule.inp';
    }else{
      const routeJob=({sp:'',opt:'Opt',freq:'Freq',optfreq:'Opt Freq',tddft:`TD(NStates=${Math.max(1,Math.min(200,Number($('nstates').value)||20))})`}[job]);
      let route=`#P ${method}/${basis.replace('def2-','def2')}${routeJob?' '+routeJob:''}`;
      if(scf!=='normal')route+=` SCF=${scf==='tight'?'Tight':'VeryTight'}`;
      if(disp!=='none')route+=` EmpiricalDispersion=${disp==='D3BJ'?'GD3BJ':'GD4'}`;
      if(solv!=='none')route+=` SCRF=(SMD,Solvent=${solventGaussian(solv)})`;
      text=`%nprocshared=8\n%mem=8GB\n${route}\n\nMolecule calculation\n\n${charge} ${mult}\n${lines.join('\n')}\n\n`;
      filename='molecule.gjf';
    }
    $('inputOutput').textContent=text;$('fileTitle').textContent=filename;$('inputMessage').textContent=`Generated ${filename}. Validate method/basis availability and keywords in your installed program version.`;$('inputMessage').classList.remove('warning');
  }
  $('generateInput').addEventListener('click',generate);
  document.querySelectorAll('input[name="program"]').forEach(e=>e.addEventListener('change',generate));
  ['method','basis','job','charge','multiplicity','solvent','dispersion','scf','nstates','coordinates'].forEach(id=>$(id).addEventListener('change',()=>{}));
  $('downloadInput').addEventListener('click',()=>{generate();const txt=$('inputOutput').textContent;const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'text/plain'}));a.download=$('fileTitle').textContent;a.click();URL.revokeObjectURL(a.href)});
  $('copyInput').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('inputOutput').textContent);$('inputMessage').textContent='Input copied.'}catch(e){$('inputMessage').textContent='Clipboard permission unavailable; select and copy the text manually.'}});
  const fromBuilder=sessionStorage.getItem('ccLabSmiles');if(fromBuilder){$('inputMessage').textContent='Returned from Molecular Builder. Paste verified 3D coordinates below before running a calculation.';sessionStorage.removeItem('ccLabSmiles')}
  generate();
})();
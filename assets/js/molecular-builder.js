(() => {
  const $=id=>document.getElementById(id);
  let lastSmiles='c1ccccc1';
  function setMessage(text,warning=false){$('builderMessage').textContent=text;$('builderMessage').classList.toggle('warning',warning)}
  function draw(){
    const s=$('smiles').value.trim(); if(!s){setMessage('Enter a SMILES string first.',true);return}
    lastSmiles=s;$('smilesEcho').textContent=s;
    if(!window.SmilesDrawer){setMessage('2D renderer library did not load. Check internet access or use a local copy of SmilesDrawer.',true);return}
    SmilesDrawer.parse(s, tree => {
      const drawer = new SmilesDrawer.Drawer({width:560,height:420, padding:20, bondThickness:1.5, fontSize:16});
      drawer.draw(tree, 'smiles-canvas', 'light', false);
      setMessage('2D structure rendered. This is not a validated 3D conformer or force-field minimization.');
    }, err => setMessage('Could not parse this SMILES string. Check syntax and stereochemistry.',true));
  }
  $('drawSmiles').addEventListener('click',draw);
  $('smiles').addEventListener('keydown',e=>{if(e.key==='Enter')draw()});
  $('fetchPubchem').addEventListener('click',async()=>{
    const name=$('compoundName').value.trim();if(!name){setMessage('Enter a compound name to search PubChem.',true);return}
    setMessage('Searching PubChem…');
    try{
      const url=`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/CanonicalSMILES,IsomericSMILES/JSON`;
      const res=await fetch(url);if(!res.ok)throw new Error('No compound match returned');
      const data=await res.json(),p=data.PropertyTable.Properties[0],s=p.IsomericSMILES||p.CanonicalSMILES;
      $('smiles').value=s;draw();setMessage(`Retrieved a SMILES string for ${name}. Verify the identity, stereochemistry, and protonation state.`);
    }catch(e){setMessage(`PubChem search failed: ${e.message}. Try another name or enter SMILES directly.`,true)}
  });
  function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)}
  $('exportSmiles').addEventListener('click',()=>download('molecule.smi',`${$('smiles').value.trim()} molecule\n`,'text/plain'));
  $('exportMol').addEventListener('click',()=>{
    const s=$('smiles').value.trim();
    const mol=`Molecule sketch exported from Computational Chemistry Laboratory\n  CCLab\n\n  0  0  0  0  0  0            999 V2000\nM  END\n`;
    download('molecule_2d_placeholder.mol',mol,'chemical/x-mdl-mol');
    setMessage('Downloaded a MOL placeholder only; coordinates/connectivity are not encoded. Use an RDKit/Avogadro export for a chemically valid MOL/SDF.',true);
  });
  $('openInputBuilder').addEventListener('click',()=>{sessionStorage.setItem('ccLabSmiles', $('smiles').value.trim());location.href='input-builder.html'});
  draw();
})();
(() => {
  const $=id=>document.getElementById(id);
  let target='local';
  const configs={
    local:{title:'MacBook local',target:'Local Docker',path:['GitHub Pages UI','Local agent (localhost)','Docker container with ORCA','Result files → analyzer']},
    hpc:{title:'HPC BRIN',target:'HPC / SLURM',path:['GitHub Pages UI','Authenticated execution gateway','SLURM scheduler + approved runtime','Result files → analyzer']}
  };
  function render(){
    const c=configs[target];
    document.querySelectorAll('.target-card').forEach(b=>b.classList.toggle('selected',b.dataset.target===target));
    $('selectedTargetTitle').textContent=c.title;$('targetValue').textContent=c.target;
    $('connectionValue').textContent='Not configured';$('jobNameValue').textContent=$('jobName').value;
    $('resourceValue').textContent=`${$('cores').value} cores · ${$('memory').value} GB`;$('jobStatusValue').textContent='Not submitted';
    $('pathway').innerHTML=c.path.map((p,i)=>`${i?'<span>↓</span>':''}<div>${p}</div>`).join('');
    $('executionMessage').textContent=`Preview only — ${c.title} is not connected. No job was submitted.`;$('executionMessage').classList.add('warning');
  }
  document.querySelectorAll('.target-card').forEach(b=>b.addEventListener('click',()=>{target=b.dataset.target;render()}));
  $('previewJob').addEventListener('click',render);
  $('submitJob').addEventListener('click',()=>{
    render();
    $('executionMessage').textContent='Submission blocked: no authenticated backend endpoint is configured. This button does not execute a calculation. Follow README.md to deploy and secure the optional backend/agent.';
    $('executionMessage').classList.add('warning');
    $('jobStatusValue').textContent='Blocked · no endpoint';
  });
  ['jobName','cores','memory','partition','walltime'].forEach(id=>$(id).addEventListener('change',render));
  render();
})();
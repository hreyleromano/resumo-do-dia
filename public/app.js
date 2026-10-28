import {filterDay,basicSummary} from './core.js';
const $=id=>document.getElementById(id);
const status=s=>{$('status').textContent=s;};
let checkedText='', provenance='', report='';
const localDay=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
$('day').value=localDay;
function invalidate(){checkedText='';provenance='';$('manual').checked=false;$('resultCard').hidden=true;report='';}
function sourceChanged(){$('size').textContent=`${$('source').value.length.toLocaleString('pt-BR')} caracteres`; $('excerpt').value='';invalidate();$('filterInfo').textContent='Filtre novamente após alterar a conversa.';}
$('source').addEventListener('input',sourceChanged);
$('day').addEventListener('change',()=>{invalidate();$('filterInfo').textContent='Data alterada. Filtre novamente ou confirme a seleção manual.';});
$('excerpt').addEventListener('input',invalidate);
$('mode').addEventListener('change',()=>{$('aiOptions').hidden=$('mode').value!=='ai';});
$('filter').onclick=()=>{
  invalidate();
  try{
    const f=filterDay($('source').value,$('day').value);
    $('excerpt').value=f.text;checkedText=f.text;provenance='delimitado por datas ou marcadores do texto';
    const msg=!f.found?'Nenhuma data reconhecida. Cole apenas o trecho desejado abaixo e confirme a seleção manual.':!f.text?'Não encontramos conteúdo para essa data. Confira os marcadores ou selecione manualmente.':`Trecho filtrado. Confira se os marcadores representam os dias reais.${f.unknown?' Há texto antes do primeiro marcador; ele ficou de fora.':''}`;
    $('filterInfo').textContent=msg; status(msg);
  }catch(e){status(e.message);}
};
async function api(route,body){
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),45000);
 try{const res=await fetch(`/.netlify/functions/${route}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});let data;try{data=await res.json();}catch{throw new Error('O servidor não respondeu corretamente. Verifique a publicação no Netlify.');}if(!res.ok)throw new Error(data.error||'Não foi possível completar a operação.');return data;}catch(e){if(e.name==='AbortError')throw new Error('O tempo de espera terminou. Tente novamente ou use o modo básico.');throw e;}finally{clearTimeout(timer);}
}
$('import').onclick=async()=>{
 $('import').disabled=true;status('Tentando ler o link compartilhado…');
 try{const d=await api('import',{url:$('url').value});$('source').value=d.text;sourceChanged();status('Conteúdo importado. Confira a conversa e filtre a data; se não houver datas, selecione o trecho manualmente.');}
 catch(e){status(`${e.message} Você pode colar o texto da conversa.`);}finally{$('import').disabled=false;}
};
$('summarize').onclick=async()=>{
 const text=$('excerpt').value.trim(),day=$('day').value;
 if(!text){status('Filtre a conversa ou cole o trecho do dia antes de resumir.');return;}
 if(!day){status('Escolha a data do relatório.');return;}
 const manual=$('manual').checked;
 if(!manual && (!checkedText || checkedText!==$('excerpt').value)){status('Confirme a seleção manual ou use “Filtrar dia”.');return;}
 $('summarize').disabled=true;$('resultCard').hidden=true;report='';status('Preparando o resumo…');
 try{
  let title,content;
  if($('mode').value==='ai'){
   const d=await api('summarize',{text,day,password:$('password').value});content=d.summary;title='Resumo por IA';$('result').textContent=content;
  }else{
   const sentences=basicSummary(text);if(!sentences.length)throw new Error('O trecho não contém texto suficiente para resumir.');title='Resumo básico · trechos selecionados';content=sentences.map(s=>'• '+s).join('\n\n');const list=document.createElement('ul');for(const s of sentences){const li=document.createElement('li');li.textContent=s;list.append(li);}$('result').replaceChildren(list);
  }
  const date=day.split('-').reverse().join('/');const basis=manual?'trecho selecionado manualmente; data informada por você':provenance;
  $('resultMeta').textContent=`${date} · ${title} · ${basis}.`;
  report=`${date} — ${title}\n${basis}\n\n${content}`;$('resultCard').hidden=false;status('Resumo pronto. Confira o resultado com o trecho original.');$('resultCard').scrollIntoView({behavior:'smooth',block:'start'});
 }catch(e){status(e.message);}finally{$('summarize').disabled=false;}
};
$('copy').onclick=async()=>{try{await navigator.clipboard.writeText(report);status('Resumo copiado.');}catch{status('Não foi possível copiar automaticamente. Selecione e copie o resumo na tela.');}};
$('clear').onclick=()=>{for(const id of ['source','excerpt','url','password'])$(id).value='';sourceChanged();$('result').replaceChildren();$('resultMeta').textContent='';status('Conteúdo e resumo removidos desta página.');};
$('example').onclick=()=>{$('source').value='INÍCIO DO DIA 27/10/2026\nVocê disse: Quero organizar minha semana de estudos.\nChatGPT disse: Separe períodos para revisão e exercícios.\n\nINÍCIO DO DIA 28/10/2026\nVocê disse: Hoje estudei equações do segundo grau e tive dúvidas na fórmula de Bhaskara.\nChatGPT disse: Primeiro calcule o discriminante: delta é b ao quadrado menos 4ac.\nVocê disse: Resolvi três exercícios e vou revisar os erros amanhã.\nChatGPT disse: Anote em qual etapa de cada exercício ocorreu o erro.\n\nINÍCIO DO DIA 29/10/2026\nVocê disse: Hoje quero estudar geometria.';$('day').value='2026-10-28';sourceChanged();$('filter').click();status('Exemplo fictício carregado. Só o conteúdo de 28/10/2026 foi selecionado.');};

import {input,json,fail,reject} from './common.mjs';
export function sharedUrl(value){
 let u;try{u=new URL(value);}catch{reject('Informe um link compartilhado válido.');}
 if(u.protocol!=='https:'||u.hostname!=='chatgpt.com'||u.port||u.username||u.password||!/^\/share\/[a-f0-9-]{20,80}\/?$/i.test(u.pathname))reject('Use somente um link https://chatgpt.com/share/…');
 return `https://chatgpt.com${u.pathname}`;
}
export function extract(html){
 // Only server-rendered message elements are supported; scripts are never run.
 const source=html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi,'');
 const start=/<([a-z][a-z0-9]*)\b[^>]*\bdata-message-author-role\s*=\s*["'](user|assistant)["'][^>]*>/gi;
 const texts=[];let match;
 const decode=s=>s.replace(/&#(x[0-9a-f]+|\d+);/gi,(_,v)=>{const n=v[0].toLowerCase()==='x'?parseInt(v.slice(1),16):Number(v);return n>0&&n<=0x10ffff?String.fromCodePoint(n):'�';}).replace(/&(amp|lt|gt|quot|apos|nbsp);/g,(_,k)=>({amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '})[k]);
 while((match=start.exec(source))){
  const tag=match[1],end=new RegExp('<(/?)'+tag+'\\b[^>]*>','gi');end.lastIndex=start.lastIndex;
  let depth=1,t,finish=-1;
  while((t=end.exec(source))){depth+=t[1]?-1:1;if(!depth){finish=t.index;start.lastIndex=end.lastIndex;break;}}
  if(finish<0)continue;
  const text=decode(source.slice(match.index+match[0].length,finish).replace(/<(?:br\b[^>]*|\/(?:p|li|pre|div))>/gi,'\n').replace(/<[^>]*>/g,'')).trim();
  if(text)texts.push((match[2]==='user'?'Você disse':'ChatGPT disse')+':\n'+text);
 }
 const text=texts.join('\n\n');
 if(!text)reject('A página não disponibilizou mensagens em formato legível. Cole o texto manualmente.',422);
 if(text.length>200000)reject('Conversa muito longa. Cole apenas o trecho necessário.',413);
 return text;
}
export const handler=async event=>{try{
 const data=input(event),url=sharedUrl(data.url);
 const response=await fetch(url,{redirect:'manual',signal:AbortSignal.timeout(12000),headers:{Accept:'text/html'}});
 if(!response.ok)reject('O ChatGPT bloqueou a leitura ou o link não está disponível. Abra-o no navegador e copie o texto.',422);
 if(!response.headers.get('content-type')?.includes('text/html'))reject('O link não retornou uma página de conversa.',422);
 const reader=response.body.getReader(),chunks=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4000000){await reader.cancel();reject('A página é muito grande. Cole o texto manualmente.',413);}chunks.push(Buffer.from(value));}
 return json(200,{text:extract(Buffer.concat(chunks).toString('utf8'))});
 }catch(e){return fail(e);}};

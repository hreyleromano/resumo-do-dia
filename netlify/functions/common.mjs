export function json(statusCode,data){return {statusCode,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},body:JSON.stringify(data)};}
export function input(event){
 if(event.httpMethod!=='POST')throw Object.assign(new Error('Use uma requisição POST.'),{status:405});
 if(!event.body || event.body.length>1200000)throw Object.assign(new Error('Conteúdo vazio ou muito grande.'),{status:413});
 try{const d=JSON.parse(event.body);if(!d||typeof d!=='object'||Array.isArray(d))throw new Error();return d;}catch{throw Object.assign(new Error('Dados inválidos.'),{status:400});}
}
export function fail(e){return json(e.status||502,{error:e.status?e.message:'Não foi possível acessar o serviço externo. Tente novamente mais tarde.'});}
export function reject(message,status=400){throw Object.assign(new Error(message),{status});}

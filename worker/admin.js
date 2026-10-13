// Página /admin: perguntas salvas, aviso de teste e estúdio de voz dos episódios.
// Atenção: não usar crase nem cifrão-chave dentro do HTML (está num template literal).
export const ADMIN_PAGE = String.raw`<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin do viaje-ceara</title>
<style>
body{font:16px system-ui,sans-serif;max-width:820px;margin:0 auto;padding:16px;color:#1E2350;background:#F4ECDD}
h1{font-size:22px}h2{font-size:18px;margin-top:28px;border-top:2px solid #1E2350;padding-top:14px}
input,button,select{font:inherit;padding:8px 12px;border-radius:8px;border:1.5px solid #1E2350;background:#fff;color:#1E2350}
button{background:#F4B33D;font-weight:700;cursor:pointer}button:disabled{opacity:.5}
textarea{width:100%;box-sizing:border-box;font:13px ui-monospace,monospace;border-radius:8px;border:1.5px solid #1E2350;padding:8px}
.row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0}
.muted{color:#555;font-size:14px}audio{width:100%;margin-top:8px}
</style></head>
<body><h1>Admin do Rumo ao Ceará</h1>
<form id="f" class="row"><input id="k" type="password" placeholder="ADMIN_KEY" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"> <button>Entrar</button></form>
<p id="s" class="muted"></p>

<h2>Perguntas salvas</h2>
<div class="row"><button id="ver" type="button">Ver perguntas</button></div>
<textarea id="o" readonly rows="8"></textarea>

<h2>Avisos no celular</h2>
<div class="row"><button id="pt" type="button">Enviar aviso de teste agora</button> <span id="ps" class="muted"></span></div>

<h2>Estúdio de voz (episódios)</h2>
<p class="muted">1) Carregue as vozes. 2) Escolha uma voz para cada robô e teste. 3) Gere o episódio e baixe o .wav. Depois mande o arquivo no chat do Claude.</p>
<div class="row">
 <select id="ep"><option value="ep01">ep01 · Por que Fortaleza</option></select>
 <button id="lv" type="button">Carregar vozes</button>
 <label class="muted"><input type="checkbox" id="allang"> incluir vozes em espanhol</label>
</div>
<div class="row">Caju (ela): <select id="vc"></select> <button type="button" class="try" data-who="Caju">Ouvir</button></div>
<div class="row">Baião (ele): <select id="vb"></select> <button type="button" class="try" data-who="Baião">Ouvir</button></div>
<div class="row"><button id="gen" type="button">Gerar episódio</button> <span id="gs" class="muted"></span></div>
<audio id="au" controls hidden></audio>
<div class="row"><a id="dl" hidden>Baixar .wav</a></div>
<details><summary class="muted">Roteiro (JSON)</summary><textarea id="sc" rows="14"></textarea></details>

<script>
var KEY="";
function post(path,data){data.key=KEY;return fetch(path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error((j.error||"erro")+(j.status?" "+j.status:"")+(j.detail?" · "+j.detail:""));return j})})}
f.onsubmit=function(e){e.preventDefault();KEY=k.value;s.textContent="Conferindo…";post("/export",{}).then(function(d){s.textContent="Ok. "+d.items.length+" perguntas salvas.";o.value=JSON.stringify(d.items,null,2)}).catch(function(){s.textContent="Chave errada."})};
ver.onclick=function(){post("/export",{}).then(function(d){o.value=JSON.stringify(d.items,null,2)}).catch(function(e){o.value=e.message})};
pt.onclick=function(){ps.textContent="Enviando…";post("/push-now",{}).then(function(d){ps.textContent=d.subscribers+" celulares, "+d.sent+" enviados, "+d.removed+" removidos, "+d.failed+" com erro."}).catch(function(e){ps.textContent=e.message})};

var SITE="https://pdroarraes-creator.github.io/viaje-ceara/videos/";
function loadScript(){fetch(SITE+ep.value+".json?t="+Date.now()).then(function(r){return r.text()}).then(function(t){sc.value=t}).catch(function(){sc.value=""})}
ep.onchange=loadScript;loadScript();
function fill(sel,list,pref){sel.innerHTML="";list.forEach(function(v){var o=document.createElement("option");o.value=v.id||v.name;o.textContent=(v.name||v.id)+" · "+(v.lang||"")+(v.accent?" · "+v.accent:"")+(v.pitch?" · "+v.pitch:"")+(v.desc?" · "+v.desc.slice(0,60):"");sel.appendChild(o)})}
lv.onclick=function(){gs.textContent="Carregando vozes…";var langs=["pt-BR"];if(allang.checked)langs=langs.concat(["es-AR","es-419","es-US","es-ES"]);
 Promise.all([post("/voices",{lang:langs,gender:"female"}),post("/voices",{lang:langs,gender:"male"})]).then(function(r){fill(vc,r[0].voices);fill(vb,r[1].voices);gs.textContent=r[0].voices.length+" vozes femininas, "+r[1].voices.length+" masculinas."}).catch(function(e){gs.textContent=e.message})};

function b64ToBytes(b){var s=atob(b),u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u}
function pcmOf(bytes){ // devolve {pcm, rate} de um WAV (ou PCM cru 24k)
 var dv=new DataView(bytes.buffer);if(bytes.length>12&&String.fromCharCode(bytes[0],bytes[1],bytes[2],bytes[3])==="RIFF"){var p=12,rate=24000;while(p+8<=bytes.length){var id=String.fromCharCode(bytes[p],bytes[p+1],bytes[p+2],bytes[p+3]),sz=dv.getUint32(p+4,true);if(id==="fmt ")rate=dv.getUint32(p+12,true);if(id==="data")return{pcm:bytes.slice(p+8,p+8+sz),rate:rate};p+=8+sz+(sz%2)}}
 return{pcm:bytes,rate:24000}}
function wav(chunks,rate){var n=0;chunks.forEach(function(c){n+=c.length});var b=new Uint8Array(44+n),dv=new DataView(b.buffer);function w(o,str){for(var i=0;i<4;i++)b[o+i]=str.charCodeAt(i)}
 w(0,"RIFF");dv.setUint32(4,36+n,true);w(8,"WAVE");w(12,"fmt ");dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,rate,true);dv.setUint32(28,rate*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);w(36,"data");dv.setUint32(40,n,true);var p=44;chunks.forEach(function(c){b.set(c,p);p+=c.length});return new Blob([b],{type:"audio/wav"})}
function voiceFor(who){return who==="Caju"?vc.value:vb.value}
function show(blob,name){au.src=URL.createObjectURL(blob);au.hidden=false;au.play();dl.href=au.src;dl.download=name;dl.hidden=false;dl.textContent="Baixar "+name}
document.querySelectorAll(".try").forEach(function(btn){btn.onclick=function(){var who=btn.dataset.who;gs.textContent="Gerando amostra…";
 post("/tts",{voice:voiceFor(who),text:"¡Hola! Soy "+who+", un robot de Fortaleza. Cada sábado les cuento un poco de la ciudad.",style:"alegre"}).then(function(d){var x=pcmOf(b64ToBytes(d.audio));show(wav([x.pcm],x.rate),"amostra-"+who+".wav");gs.textContent=""}).catch(function(e){gs.textContent=e.message})}});
gen.onclick=function(){var S;try{S=JSON.parse(sc.value)}catch(e){gs.textContent="Roteiro com erro de JSON.";return}
 gen.disabled=true;var out=[],rate=24000,i=0;var meta={id:S.id,voices:{Caju:vc.value,"Baião":vb.value},gap:0.45,turns:[]};
 function next(){if(i>=S.turns.length){var gap=new Uint8Array(Math.round(rate*meta.gap)*2);var parts=[];out.forEach(function(c,j){if(j)parts.push(gap);parts.push(c)});
   show(wav(parts,rate),S.id+".wav");gs.textContent="Pronto. Baixe o .wav e mande no chat.";gen.disabled=false;return}
  var t=S.turns[i];gs.textContent="Gerando fala "+(i+1)+" de "+S.turns.length+"…";
  post("/tts",{voice:voiceFor(t.speaker),text:t.text,style:t.style}).then(function(d){var x=pcmOf(b64ToBytes(d.audio));rate=x.rate;out.push(x.pcm);i++;next()}).catch(function(e){gs.textContent="Erro na fala "+(i+1)+": "+e.message;gen.disabled=false})}
 next()};
</script></body></html>`;

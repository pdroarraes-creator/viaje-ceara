// Página /admin (app instalável): WhatsApp, acessos, perguntas, avisos e estúdio de voz.
// Atenção: não usar crase nem cifrão-chave dentro do HTML (está num template literal).
export const ADMIN_PAGE = String.raw`<!doctype html><html lang="pt"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Admin Rumo ao Ceará</title>
<meta name="theme-color" content="#1E2350"><meta name="robots" content="noindex,nofollow">
<link rel="manifest" href="/admin.webmanifest"><link rel="icon" href="/admin-icon-192.png"><link rel="apple-touch-icon" href="/admin-icon-192.png">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="Admin Ceará">
<style>
:root{--ink:#1E2350;--cream:#F4ECDD;--gold:#F4B33D;--card:#fff;--line:#d9cfba;--mut:#5b5f7a;--ok:#2e7d4f;--bad:#b3261e}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;font:14px/1.4 system-ui,sans-serif;color:var(--ink);background:var(--cream);padding-bottom:calc(60px + env(safe-area-inset-bottom))}
.top{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:10px;padding:calc(8px + env(safe-area-inset-top)) 12px 8px;background:var(--ink);color:#fff}
.top b{font-size:15px;flex:1}.top small{opacity:.7}
.top button{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.4);padding:4px 10px;min-height:30px;font-size:13px;font-weight:500}
main,#login{max-width:680px;margin:0 auto;padding:12px}
h2{font-size:17px;margin:2px 0 4px}h3{font-size:14px;margin:14px 0 4px}
.card{background:var(--card);border:1.5px solid var(--line);border-radius:12px;padding:10px 12px;margin:8px 0}
input,button,select{font:inherit;font-size:14px;padding:6px 10px;border-radius:9px;border:1.5px solid var(--ink);background:#fff;color:var(--ink);min-height:36px}
button{background:var(--gold);font-weight:700;cursor:pointer}button:disabled{opacity:.5}
button.ghost{background:#fff}button.danger{background:#fff;color:var(--bad);border-color:var(--bad)}
textarea{width:100%;font:13px ui-monospace,monospace;border-radius:10px;border:1.5px solid var(--ink);padding:10px}
.row{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:6px 0}
.row input{flex:1;min-width:120px}
table{border-collapse:collapse;width:100%;font-size:13px}td,th{border-bottom:1px solid var(--line);padding:7px 6px;text-align:left;vertical-align:middle}
.muted{color:var(--mut);font-size:12.5px;margin:2px 0 6px}audio{width:100%;margin-top:8px}
.tabs{position:fixed;left:0;right:0;bottom:0;z-index:6;display:flex;background:#fff;border-top:1.5px solid var(--ink);padding-bottom:env(safe-area-inset-bottom)}
.tabs button{flex:1;border:0;border-radius:0;background:#fff;min-height:48px;font-size:11px;font-weight:600;color:var(--mut);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.tabs button span{font-size:17px;line-height:1}.tabs button.on{color:var(--ink);background:var(--gold)}
section[data-tab]{display:none}section[data-tab].on{display:block}
#bt .person{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:12px 14px}
#bt .person div{min-width:0}#bt .person small{display:block;color:var(--mut)}
.pill{display:inline-block;padding:2px 10px;border-radius:99px;background:var(--cream);border:1px solid var(--line);font-size:13px}
.warn{background:#fff6dd;border-color:var(--gold)}
</style></head>
<body>
<div class="top"><b>Rumo ao Ceará <small>admin</small></b><button id="lo" type="button" hidden>Sair</button></div>

<div id="login"><div class="card"><h2>Entrar</h2><p class="muted">Digite a ADMIN_KEY uma vez. Este aparelho vai lembrar.</p>
<form id="f" class="row"><input id="k" type="password" placeholder="ADMIN_KEY" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false"> <button>Entrar</button></form>
<p id="s" class="muted"></p></div></div>

<main id="app" hidden>
<section data-tab="wa">
<h2>WhatsApp</h2>
<p class="muted">A Castanha só responde a quem está na lista.</p>
<div class="card"><h3 style="margin-top:0">Adicionar um telefone</h3>
<p class="muted">Com código do país e DDD, só números. Ex.: 5491128706685 (Argentina) ou 5581999999999 (Brasil).</p>
<div class="row"><input id="mp" type="tel" inputmode="numeric" placeholder="Telefone" autocomplete="off"><input id="mn" placeholder="Nome"></div>
<div class="row"><select id="mr"><option value="viajante">Viajante (família vizinha)</option><option value="pedro">Pedro</option><option value="raquel">Raquel</option><option value="hijo">Filho</option></select><button id="madd" type="button">Autorizar</button></div></div>
<div class="row"><button id="bl" type="button" class="ghost">Atualizar lista</button> <span id="bs" class="muted"></span></div>
<div id="bt"></div>
<div class="card"><h3 style="margin-top:0">Informação extra para a Castanha</h3>
<p class="muted">Tudo que escrever aqui ela passa a saber, além do roteiro do site. Ex.: reservas, telefones, combinados.</p>
<textarea id="bx" rows="8" placeholder="Ex.: Hotel em Fortaleza: ... Check-in 14h."></textarea>
<div class="row"><button id="bxs" type="button">Salvar</button></div></div>
</section>

<section data-tab="ac">
<h2>Acessos ao site</h2><p class="muted">Anônimo, últimos 60 dias.</p>
<div class="row"><button id="vv" type="button">Ver acessos</button> <span id="vs" class="muted"></span></div>
<div id="vt"></div>
</section>

<section data-tab="pg">
<h2>Perguntas salvas</h2>
<div class="row"><button id="ver" type="button">Ver perguntas</button></div>
<textarea id="o" readonly rows="14"></textarea>
</section>

<section data-tab="av">
<h2>Avisos no celular</h2>
<p class="muted">Manda uma notificação de teste para quem ativou os avisos do site.</p>
<div class="row"><button id="pt" type="button">Enviar aviso de teste agora</button> <span id="ps" class="muted"></span></div>
</section>

<section data-tab="vz">
<h2>Estúdio de voz</h2>
<p class="muted">1) Carregue as vozes. 2) Escolha uma voz para cada robô e teste. 3) Gere o episódio e baixe o .wav. Depois mande o arquivo no chat do Claude.</p>
<div class="row">
 <select id="ep"><option value="ep01">ep01 · Por que Fortaleza</option></select>
 <button id="lv" type="button">Carregar vozes</button>
 <label class="muted"><input type="checkbox" id="allang"> incluir vozes em espanhol</label>
</div>
<div class="row">Castanha (ela): <select id="vc"></select> <button type="button" class="try" data-who="Castanha">Ouvir (espanhol)</button> <button type="button" class="try" data-who="Castanha" data-lang="pt">Ouvir (português)</button></div>
<div class="row">Caju (ele): <select id="vb"></select> <button type="button" class="try" data-who="Caju">Ouvir (espanhol)</button> <button type="button" class="try" data-who="Caju" data-lang="pt">Ouvir (português)</button></div>
<div class="card"><b>Voz no WhatsApp</b><p class="muted">Quando alguém manda áudio, a Castanha (ou o Caju) responde falando. Em português com sotaque cearense, em espanhol com sotaque brasileiro. Escolha a voz acima, ouça, e salve.</p>
<div class="row"><button id="svc" type="button">Usar a voz da Castanha no WhatsApp</button><button id="svb" type="button" class="ghost">Usar a do Caju</button></div><p id="svs" class="muted"></p></div>
<div class="row"><button id="gen" type="button">Gerar episódio</button> <span id="gs" class="muted"></span></div>
<audio id="au" controls hidden></audio>
<div class="row"><a id="dl" hidden>Baixar .wav</a></div>
<details><summary class="muted">Roteiro (JSON)</summary><textarea id="sc" rows="14"></textarea></details>
</section>
</main>

<nav class="tabs" id="tabs" hidden>
<button data-go="wa" class="on"><span>💬</span>WhatsApp</button>
<button data-go="ac"><span>👀</span>Acessos</button>
<button data-go="pg"><span>❓</span>Perguntas</button>
<button data-go="av"><span>🔔</span>Avisos</button>
<button data-go="vz"><span>🎙️</span>Vozes</button>
</nav>

<script>
var KEY="";
function post(path,data){data.key=KEY;return fetch(path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)}).then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error((j.error||"erro")+(j.status?" "+j.status:"")+(j.detail?" · "+j.detail:""));return j})})}
var STORE="adm-key";
function enter(key,remember){KEY=key;s.textContent="Conferindo…";return post("/export",{}).then(function(d){if(remember){try{localStorage.setItem(STORE,key)}catch(e){}}login.hidden=true;app.hidden=false;tabs.hidden=false;lo.hidden=false;o.value=JSON.stringify(d.items,null,2);botCall({action:"list"});return true}).catch(function(){KEY="";s.textContent="Chave errada.";return false})}
f.onsubmit=function(e){e.preventDefault();enter(k.value,true)};
lo.onclick=function(){try{localStorage.removeItem(STORE)}catch(e){}location.reload()};
tabs.onclick=function(e){var b=e.target.closest("button");if(!b||!b.dataset.go)return;document.querySelectorAll("#tabs button").forEach(function(x){x.classList.toggle("on",x===b)});document.querySelectorAll("section[data-tab]").forEach(function(x){x.classList.toggle("on",x.dataset.tab===b.dataset.go)});window.scrollTo(0,0)};
document.querySelector("section[data-tab=wa]").classList.add("on");
try{var saved=localStorage.getItem(STORE);if(saved){s.textContent="Entrando…";enter(saved,false)}}catch(e){}
if("serviceWorker" in navigator)navigator.serviceWorker.register("/admin-sw.js").catch(function(){});
ver.onclick=function(){post("/export",{}).then(function(d){o.value=JSON.stringify(d.items,null,2)}).catch(function(e){o.value=e.message})};
vv.onclick=function(){vs.textContent="Carregando…";post("/visits",{}).then(function(d){var it=d.items,day={},tz="America/Argentina/Buenos_Aires",fm=new Intl.DateTimeFormat("pt-BR",{timeZone:tz,day:"2-digit",month:"2-digit"}),hm=new Intl.DateTimeFormat("pt-BR",{timeZone:tz,hour:"2-digit",minute:"2-digit"});
 var devs={};it.forEach(function(v){var k=fm.format(v.t);(day[k]=day[k]||{n:0,s:{}}).n++;day[k].s[v.vid||"?"]=1;devs[v.vid||"?"]=1});
 var nb=it.filter(function(v){return v.bot}).length;vs.textContent=it.length+" acessos ("+nb+" prováveis robôs), "+Object.keys(devs).length+" aparelhos diferentes.";
 var h="<table><tr><th>Dia</th><th>Acessos</th><th>Aparelhos</th></tr>";Object.keys(day).forEach(function(k){h+="<tr><td>"+k+"</td><td>"+day[k].n+"</td><td>"+Object.keys(day[k].s).length+"</td></tr>"});h+="</table><p class=muted>Últimos 40:</p><table><tr><th>Quando</th><th>Aparelho</th><th>Lugar</th><th>Idioma</th><th>Tipo</th></tr>";
 var tp={open_ok:"entrou",open_nopw:"abriu, sem senha",wrong_pw:"senha errada"};
 it.slice(0,40).forEach(function(v){h+="<tr><td>"+fm.format(v.t)+" "+hm.format(v.t)+"</td><td>"+v.dev+" · "+v.br+(v.app?" (app)":"")+" · "+(v.vid||"").slice(0,4)+"</td><td>"+(v.place||"?")+"</td><td>"+v.lang+"</td><td>"+(v.bot?"provável robô":(tp[v.kind]||v.kind))+(v.org?"<br><small class=muted>"+v.org+"</small>":"")+"</td></tr>"});vt.innerHTML=h+"</table>"}).catch(function(e){vs.textContent=e.message})};
pt.onclick=function(){ps.textContent="Enviando…";post("/push-now",{}).then(function(d){ps.textContent=d.subscribers+" celulares, "+d.sent+" enviados, "+d.removed+" removidos, "+d.failed+" com erro."}).catch(function(e){ps.textContent=e.message})};

function esc2(x){return String(x==null?"":x).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
var ROLE={viajante:"viajante",pedro:"Pedro",raquel:"Raquel",hijo:"filho"};
function drawBot(d){var h="",ids=Object.keys(d.allow);
 h+="<h3>Autorizados ("+ids.length+")</h3>";
 if(!ids.length)h+="<p class='muted'>Ninguém ainda. Adicione um telefone acima.</p>";
 ids.forEach(function(id){var p=d.allow[id];h+="<div class='person card'><div><b>"+esc2(p.name||"(sem nome)")+"</b> <span class='pill'>"+esc2(ROLE[p.role]||p.role)+"</span><small>"+esc2(id)+"</small></div><button class='danger' data-a='remove' data-id='"+esc2(id)+"'>Remover</button></div>"});
 if(d.unknown.length){h+="<h3>Tentaram falar e estão bloqueados ("+d.unknown.length+")</h3>";
  d.unknown.forEach(function(u){h+="<div class='card warn'><b>"+esc2(u.name||"(sem nome)")+"</b> <small class='muted'>"+esc2(u.id)+"</small><div class='muted'>Disse: "+esc2(u.text||"(áudio ou mídia)")+"</div><div class='row'><input class='nm' placeholder='nome' value='"+esc2(u.name)+"'><select class='rl'><option value='viajante'>viajante</option><option value='pedro'>Pedro</option><option value='raquel'>Raquel</option><option value='hijo'>filho</option></select></div><div class='row'><button data-a='allow' data-id='"+esc2(u.id)+"'>Autorizar</button><button class='ghost' data-a='ignore' data-id='"+esc2(u.id)+"'>Ignorar</button></div></div>"})}
 bt.innerHTML=h;bx.value=d.extra;bs.textContent=ids.length+" autorizados, "+d.unknown.length+" aguardando"}
var ACC_ES="Hablá en español con acento brasileño bien marcado, simpático y alegre.",ACC_PT="Fale em português com sotaque nordestino cearense bem marcado, simpático, animado e bem-humorado.";
function saveVoice(who,sel){if(!sel.value){svs.textContent="Carregue as vozes primeiro.";return}svs.textContent="Salvando…";post("/bot-admin",{action:"setvoice",bot:who,voice:sel.value}).then(function(d){svs.textContent="Voz do WhatsApp: Castanha = "+(d.voice.castanha||"nenhuma")+" · Caju = "+(d.voice.caju||"nenhuma")}).catch(function(e){svs.textContent="Erro: "+e.message})}
svc.onclick=function(){saveVoice("castanha",vc)};svb.onclick=function(){saveVoice("caju",vb)};
function botCall(data){bs.textContent="Carregando…";return post("/bot-admin",data).then(drawBot).catch(function(e){bs.textContent="Erro: "+e.message})}
bl.onclick=function(){botCall({action:"list"})};
bxs.onclick=function(){botCall({action:"setextra",text:bx.value})};
madd.onclick=function(){var n=mp.value.replace(/\D/g,"");if(n.length<8){bs.textContent="Telefone curto demais. Use código do país + DDD + número.";return}botCall({action:"allow",id:n,name:mn.value,role:mr.value}).then(function(){mp.value="";mn.value=""})};
bt.onclick=function(e){var b=e.target.closest("button");if(!b||!b.dataset||!b.dataset.a)return;var row=b.closest(".card"),nm=row.querySelector(".nm"),rl=row.querySelector(".rl");botCall({action:b.dataset.a,id:b.dataset.id,name:nm?nm.value:"",role:rl?rl.value:""})};

var SITE="https://pdroarraes-creator.github.io/viaje-ceara/videos/";
function loadScript(){fetch(SITE+ep.value+".json?t="+Date.now()).then(function(r){return r.text()}).then(function(t){sc.value=t}).catch(function(){sc.value=""})}
ep.onchange=loadScript;loadScript();
function fill(sel,list,pref){sel.innerHTML="";list.forEach(function(v){var o=document.createElement("option");o.value=v.id||v.name;o.textContent=(v.name||v.id)+" · "+(v.lang||"")+(v.accent?" · "+v.accent:"")+(v.pitch?" · "+v.pitch:"")+(v.desc?" · "+v.desc.slice(0,60):"");sel.appendChild(o)})}
var DEF_F=["Kore","Leda","Aoede","Zephyr","Callirrhoe","Autonoe","Despina","Erinome","Laomedeia","Achernar","Gacrux","Pulcherrima","Vindemiatrix","Sulafat"],DEF_M=["Puck","Charon","Fenrir","Orus","Enceladus","Iapetus","Umbriel","Algieba","Algenib","Rasalgethi","Alnilam","Schedar","Achird","Zubenelgenubi","Sadachbia","Sadaltager"];
function defs(a){return a.map(function(n){return{id:n,name:n,desc:"voz padrão do Gemini"}})}
fill(vc,defs(DEF_F));fill(vb,defs(DEF_M));
lv.onclick=function(){gs.textContent="Carregando vozes…";var langs=["pt-BR"];if(allang.checked)langs=langs.concat(["es-AR","es-419","es-US","es-ES"]);
 Promise.all([post("/voices",{lang:langs,gender:"female"}),post("/voices",{lang:langs,gender:"male"})]).then(function(r){if(!r[0].voices.length||!r[1].voices.length){gs.textContent="O Google não listou vozes. Mantive as vozes padrão do Gemini.";return}fill(vc,r[0].voices);fill(vb,r[1].voices);gs.textContent=r[0].voices.length+" vozes femininas, "+r[1].voices.length+" masculinas."}).catch(function(e){gs.textContent="Não consegui listar ("+e.message+"). Mantive as vozes padrão do Gemini."})};

function b64ToBytes(b){var s=atob(b),u=new Uint8Array(s.length);for(var i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u}
function pcmOf(bytes){ // devolve {pcm, rate} de um WAV (ou PCM cru 24k)
 var dv=new DataView(bytes.buffer);if(bytes.length>12&&String.fromCharCode(bytes[0],bytes[1],bytes[2],bytes[3])==="RIFF"){var p=12,rate=24000;while(p+8<=bytes.length){var id=String.fromCharCode(bytes[p],bytes[p+1],bytes[p+2],bytes[p+3]),sz=dv.getUint32(p+4,true);if(id==="fmt ")rate=dv.getUint32(p+12,true);if(id==="data")return{pcm:bytes.slice(p+8,p+8+sz),rate:rate};p+=8+sz+(sz%2)}}
 return{pcm:bytes,rate:24000}}
function wav(chunks,rate){var n=0;chunks.forEach(function(c){n+=c.length});var b=new Uint8Array(44+n),dv=new DataView(b.buffer);function w(o,str){for(var i=0;i<4;i++)b[o+i]=str.charCodeAt(i)}
 w(0,"RIFF");dv.setUint32(4,36+n,true);w(8,"WAVE");w(12,"fmt ");dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);dv.setUint32(24,rate,true);dv.setUint32(28,rate*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);w(36,"data");dv.setUint32(40,n,true);var p=44;chunks.forEach(function(c){b.set(c,p);p+=c.length});return new Blob([b],{type:"audio/wav"})}
function voiceFor(who){return who==="Castanha"?vc.value:vb.value}
function show(blob,name){au.src=URL.createObjectURL(blob);au.hidden=false;au.play();dl.href=au.src;dl.download=name;dl.hidden=false;dl.textContent="Baixar "+name}
document.querySelectorAll(".try").forEach(function(btn){btn.onclick=function(){var who=btn.dataset.who;gs.textContent="Gerando amostra…";
 var pt=btn.dataset.lang==="pt";post("/tts",{voice:voiceFor(who),text:pt?"Oxe, oi! Eu sou "+(who==="Castanha"?"a":"o")+" "+who+", de Fortaleza. Todo sábado eu conto um pouquinho da cidade pra vocês, visse?":"¡Hola! Soy "+who+", de Fortaleza. Cada sábado les cuento un poco de la ciudad.",style:pt?ACC_PT:ACC_ES+" alegre."}).then(function(d){var x=pcmOf(b64ToBytes(d.audio));show(wav([x.pcm],x.rate),"amostra-"+who+".wav");gs.textContent=""}).catch(function(e){gs.textContent=e.message})}});
gen.onclick=function(){var S;try{S=JSON.parse(sc.value)}catch(e){gs.textContent="Roteiro com erro de JSON.";return}
 gen.disabled=true;var out=[],rate=24000,i=0;var meta={id:S.id,voices:{Castanha:vc.value,Caju:vb.value},gap:0.45,turns:[]};
 function next(){if(i>=S.turns.length){var gap=new Uint8Array(Math.round(rate*meta.gap)*2);var parts=[];out.forEach(function(c,j){if(j)parts.push(gap);parts.push(c)});
   show(wav(parts,rate),S.id+".wav");gs.textContent="Pronto. Baixe o .wav e mande no chat.";gen.disabled=false;return}
  var t=S.turns[i];gs.textContent="Gerando fala "+(i+1)+" de "+S.turns.length+"…";
  post("/tts",{voice:voiceFor(t.speaker),text:t.text,style:ACC_ES+" "+(t.style||"")}).then(function(d){var x=pcmOf(b64ToBytes(d.audio));rate=x.rate;out.push(x.pcm);i++;next()}).catch(function(e){gs.textContent="Erro na fala "+(i+1)+": "+e.message;gen.disabled=false})}
 next()};
</script></body></html>`;

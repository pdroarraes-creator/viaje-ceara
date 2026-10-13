const {chromium}=require('playwright');const fs=require('fs');const {spawn}=require('child_process');
(async()=>{const tl=JSON.parse(fs.readFileSync('ep2/timeline.json'));const mode=process.argv[2];const out=process.argv[3]||'ep2/ep01-animatic.mp4';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:720,height:1280}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://localhost:8766/anim3.html');console.log(await p.evaluate(tl=>window.setup(tl),tl));
if(mode==='samples'){const T=(process.argv[4]||'').split(',').map(Number);
 for(const t of T){const f=Math.round(t*tl.fps);const d=await p.evaluate(f=>window.frame(f),f);fs.writeFileSync(`ep2/s_${t}.jpg`,Buffer.from(d.split(',')[1],'base64'))}console.log('errs',errs);}
else{const ff=spawn('ffmpeg',['-loglevel','error','-y','-f','image2pipe','-framerate',String(tl.fps),'-c:v','mjpeg','-i','-','-i','ep2/mix.wav','-c:v','libx264','-pix_fmt','yuv420p','-preset','medium','-crf','21','-c:a','aac','-b:a','160k','-shortest','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
 for(let f=0;f<tl.frames;f++){const d=await p.evaluate(f=>window.frame(f),f);if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r))}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));console.log('done',errs);}
await b.close()})();

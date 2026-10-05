
const chat=document.querySelector("#chat"),form=document.querySelector("#form"),input=document.querySelector("#input");
let userId="";
try{userId=localStorage.getItem("neyqora_user_id")||"";}catch{}
if(!userId){
  try{userId=crypto.randomUUID();}catch{userId="user-"+Date.now()+"-"+Math.random().toString(36).slice(2);}
  try{localStorage.setItem("neyqora_user_id",userId);}catch{}
}
let conversation=[];
function add(text,cls){const el=document.createElement("div");el.className="msg "+cls;el.textContent=text;chat.appendChild(el);el.scrollIntoView({behavior:"smooth",block:"end"});return el;}
function rememberTurn(role,content){conversation.push({role,content:String(content||"")});if(conversation.length>10)conversation=conversation.slice(-10);}
document.querySelector("#send-project").addEventListener("click",()=>{const title=document.querySelector("#project-title").textContent;const body="NEYQORA tarafından oluşturulan proje görevi.\n\n"+document.querySelector("#project-files").textContent;const url="https://github.com/perdeson359-design/neyqora/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)+"&labels="+encodeURIComponent("neyqora-project");window.open(url,"_blank");});
document.querySelector("#copy-project").addEventListener("click",async()=>{const text=document.querySelector("#project-files").textContent;if(!text)return;try{await navigator.clipboard.writeText(text);document.querySelector("#copy-project").textContent="Kopyalandı ✓";setTimeout(()=>document.querySelector("#copy-project").textContent="Kodu Kopyala",1500);}catch{document.querySelector("#copy-project").textContent="Kopyalanamadı";}});
const sendButton=document.querySelector("#send");
let sending=false;
async function sendMessage(){
  if(sending)return;
  const message=input.value.trim();
  if(!message)return;
  sending=true;
  sendButton.disabled=true;
  sendButton.textContent="Gönderiliyor...";
  add(message,"user");
  rememberTurn("user",message);
  input.value="";
  const pending=add("NEYQORA düşünüyor...","ai");
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),45000);
  try{
    const r=await fetch("/api/chat",{
      method:"POST",
      headers:{"content-type":"application/json","accept":"application/json"},
      body:JSON.stringify({message,userId,history:conversation.slice(-10)}),
      signal:controller.signal
    });
    const raw=await r.text();
    let data={};
    try{data=raw?JSON.parse(raw):{};}catch{data={error:raw||"Geçersiz sunucu yanıtı."};}
    if(!r.ok){pending.textContent=data.error||("Sunucu hatası: "+r.status);return;}
    pending.textContent=data.reply||data.error||"Yanıt alınamadı.";
    if(data.reply)rememberTurn("assistant",data.reply);
    if(data.intent==="project"&&data.files){
      const panel=document.querySelector("#project-panel");
      const title=document.querySelector("#project-title");
      const files=document.querySelector("#project-files");
      title.textContent="Proje: "+(data.project||"NEYQORA projesi")+" · "+data.files.length+" dosya";
      files.textContent=data.files.map(f=>"--- "+f.path+" ---\n"+f.content).join("\n\n");
      panel.hidden=false;
      panel.scrollIntoView({behavior:"smooth",block:"end"});
    }
  }catch(err){
    pending.textContent=err?.name==="AbortError"?"NEYQORA yanıtı zaman aşımına uğradı.":"Bağlantı hatası: "+(err?.message||"Tekrar dene.");
  }finally{
    clearTimeout(timer);
    sending=false;
    sendButton.disabled=false;
    sendButton.textContent="Gönder";
  }
}
window.neyqoraSend=function(){
  sendMessage();
  return false;
};
input.addEventListener("keydown",function(e){
  if(e.key==="Enter"){
    e.preventDefault();
    e.stopPropagation();
    sendMessage();
  }
});

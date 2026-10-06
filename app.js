const KEY="bitacora_guardia_v1";
const AREA_KEY="bitacora_area_v1";
let records=JSON.parse(localStorage.getItem(KEY)||"[]");
let currentArea=localStorage.getItem(AREA_KEY)||"Urgencias";
let deferredInstall=null;

const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const nowISO=()=>new Date().toISOString();
const fmt=d=>new Intl.DateTimeFormat("es-MX",{dateStyle:"short",timeStyle:"short"}).format(new Date(d));
const val=k=>$(k)?.value?.trim()||"";

function save(){localStorage.setItem(KEY,JSON.stringify(records));render()}
function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),2200)}
function updateClock(){ $("#clock").textContent=fmt(new Date()) }
setInterval(updateClock,1000);updateClock();

function setArea(){currentArea=localStorage.getItem(AREA_KEY)||"Urgencias";$("#currentArea").textContent=currentArea}
setArea();

const forms={
paciente:{
 title:"Ingreso / registro de paciente", fields:[
 ["nombre","Nombre del paciente","text",true],["sexo","Sexo","select",true,["Femenino","Masculino","Otro / no especificado"]],
 ["edad","Edad","number",true],["procedencia","Procedencia","text",false],["acompanante","Acompañante","text",false],
 ["acompananteSexo","Sexo del acompañante","select",false,["Femenino","Masculino","Otro / no especificado"]],
 ["acompananteEdad","Edad del acompañante","number",false],["idPaciente","Identificación del paciente","text",false],
 ["observaciones","Observaciones / incidencia","textarea",false]
]},
internamiento:{
 title:"Internamiento", fields:[
 ["nombre","Nombre del paciente","text",true],["sexo","Sexo","select",true,["Femenino","Masculino","Otro / no especificado"]],
 ["edad","Edad","number",true],["procedencia","Procedencia","text",false],["responsable","Familiar / responsable a cargo","text",true],
 ["responsableSexo","Sexo del responsable","select",false,["Femenino","Masculino","Otro / no especificado"]],
 ["responsableEdad","Edad del responsable","number",false],["idPaciente","Identificación del paciente","text",false],
 ["idResponsable","Identificación del responsable","text",true],["observaciones","Observaciones","textarea",false]
]},
vehiculo:{
 title:"Registro de vehículo", fields:[
 ["tipoVehiculo","Tipo de vehículo","select",true,["Automóvil","Camioneta","Motocicleta","Ambulancia","Taxi","Camión","Otro"]],
 ["placa","Placa","text",true],["color","Color","text",false],["marcaModelo","Marca / modelo","text",false],
 ["chofer","Nombre del chófer","text",false],["origen","Procedencia / de dónde viene","text",false],
 ["motivo","Motivo de ingreso","text",false],["observaciones","Observaciones","textarea",false]
]},
ambulancia:{
 title:"Traslado en ambulancia", fields:[
 ["destino","Destino del traslado","text",true],["ambulancia","Datos / número de ambulancia","text",false],
 ["placaAmb","Placa de la ambulancia","text",false],["choferAmb","Nombre del conductor","text",true],
 ["kmSalida","Kilometraje de salida","number",false],["combustible","Nivel de combustible","select",false,["Vacío","1/4","1/2","3/4","Lleno","No registrado"]],
 ["fotoVehiculo","Foto de kilometraje / combustible","photo",false],
 ["nombre","Nombre del paciente","text",true],["sexo","Sexo","select",true,["Femenino","Masculino","Otro / no especificado"]],
 ["edad","Edad","number",true],["procedencia","Procedencia","text",false],["idPaciente","Identificación del paciente","text",false],
 ["acompanante1","Familiar acompañante 1","text",false],["acompanante1Sexo","Sexo acompañante 1","select",false,["Femenino","Masculino","Otro / no especificado"]],
 ["acompanante1Edad","Edad acompañante 1","number",false],["acompanante1Id","Identificación acompañante 1","text",false],
 ["acompanante2","Familiar acompañante 2","text",false],["acompanante2Sexo","Sexo acompañante 2","select",false,["Femenino","Masculino","Otro / no especificado"]],
 ["acompanante2Edad","Edad acompañante 2","number",false],["acompanante2Id","Identificación acompañante 2","text",false],
 ["personal1","Personal de salud 1","text",true],["personal1Cargo","Cargo","select",false,["Enfermero/a","Médico/a","Paramédico/a","Otro"]],
 ["personal2","Personal de salud 2","text",false],["personal2Cargo","Cargo","select",false,["Enfermero/a","Médico/a","Paramédico/a","Otro"]],
 ["observaciones","Observaciones del traslado","textarea",false],
 ["fotoAdicional","Foto adicional","photo",false]
]},
incidencia:{
 title:"Incidencia / control de acceso", fields:[
 ["persona","Nombre de la persona","text",true],["tipoMovimiento","Movimiento","select",true,["Entrada","Salida","Regreso","Otro"]],
 ["acompanado","¿A quién visita / acompaña?","text",false],["horaRelacionada","Hora de salida / regreso relacionada","time",false],
 ["pertenencias","Qué llevaba / objetos relevantes","textarea",false],["procedencia","Procedencia","text",false],
 ["observaciones","Descripción de la incidencia","textarea",true]
]},
nota:{
 title:"Nota libre", fields:[
 ["titulo","Título / asunto","text",true],["nota","Nota","textarea",true]
]}
};

function fieldHTML(f){
 const [id,label,type,required,opts]=f;
 if(type==="textarea") return `<label class="full-col">${label}${required?" *":""}<textarea id="f_${id}" ${required?"required":""} placeholder="Escribe aquí…"></textarea></label>`;
 if(type==="photo") return `<label class="full-col">${label}<input id="f_${id}" type="file" accept="image/*" capture="environment"></label>`;
 if(type==="select") return `<label>${label}${required?" *":""}<select id="f_${id}" ${required?"required":""}><option value="">Seleccionar…</option>${opts.map(o=>`<option>${esc(o)}</option>`).join("")}</select></label>`;
 return `<label>${label}${required?" *":""}<input id="f_${id}" type="${type}" ${required?"required":""} ${type==="number"?"min=0 max=130":""} placeholder="${label}"></label>`;
}

function openForm(type){
 const cfg=forms[type]; $("#modalTitle").textContent=cfg.title;
 $("#modalEyebrow").textContent=`NUEVO REGISTRO · ${currentArea.toUpperCase()}`;
 $("#recordForm").innerHTML=`<div class="form-grid">${cfg.fields.map(fieldHTML).join("")}</div>
 <div class="form-actions"><button type="button" class="secondary" id="cancelForm">Cancelar</button><button class="primary" type="submit">💾 Guardar registro</button></div>`;
 $("#modal").classList.remove("hidden");$("#modal").setAttribute("aria-hidden","false");
 $("#recordForm").dataset.type=type;$("#f_nombre")?.focus();$("#cancelForm").onclick=closeModal;
}

function closeModal(){$("#modal").classList.add("hidden");$("#modal").setAttribute("aria-hidden","true")}
document.querySelectorAll(".quick-card").forEach(b=>b.onclick=()=>openForm(b.dataset.type));
$("#closeModal").onclick=closeModal;
$("#recordForm").onsubmit=async e=>{
 e.preventDefault();const type=e.currentTarget.dataset.type,cfg=forms[type];
 const data={};
 for(const [id, , fieldType] of cfg.fields){
   const el=document.querySelector("#f_"+id);
   if(fieldType==="photo"){
     if(el?.files?.[0]) data[id]=await compressImage(el.files[0]);
   } else data[id]=el?.value?.trim()||"";
 }
 records.unshift({id:crypto.randomUUID(),type,createdAt:nowISO(),area:currentArea,data});
 save();closeModal();toast("Registro guardado correctamente");
};

function summary(r){
 const d=r.data;
 if(r.type==="paciente") return `${d.nombre||"Paciente"} · ${d.sexo||""} · ${d.edad||"?"} años${d.procedencia?" · "+d.procedencia:""}`;
 if(r.type==="internamiento") return `${d.nombre||"Paciente"} · Responsable: ${d.responsable||"—"}`;
 if(r.type==="vehiculo") return `${d.tipoVehiculo||"Vehículo"} · ${d.placa||"Sin placa"}${d.chofer?" · "+d.chofer:""}`;
 if(r.type==="ambulancia") return `Traslado a ${d.destino||"destino no indicado"} · ${d.nombre||"Paciente"}${d.choferAmb?" · Conductor: "+d.choferAmb:""}`;
 if(r.type==="incidencia") return `${d.tipoMovimiento||"Movimiento"} · ${d.persona||"Persona"}${d.acompanado?" · "+d.acompanado:""}`;
 return `${d.titulo||"Nota"} · ${d.nota||""}`;
}
function typeName(t){return {paciente:"Paciente",internamiento:"Internamiento",vehiculo:"Vehículo",ambulancia:"Traslado en ambulancia",incidencia:"Incidencia",nota:"Nota"}[t]}

function compressImage(file){
 return new Promise((resolve,reject)=>{
   const reader=new FileReader();
   reader.onload=()=>{
     const img=new Image();
     img.onload=()=>{
       const max=1280, scale=Math.min(1,max/Math.max(img.width,img.height));
       const c=document.createElement("canvas");c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);
       c.getContext("2d").drawImage(img,0,0,c.width,c.height);
       resolve(c.toDataURL("image/jpeg",.72));
     }; img.onerror=reject; img.src=reader.result;
   };reader.onerror=reject;reader.readAsDataURL(file);
 });
}
function photoData(r){
 return Object.entries(r.data).filter(([k,v])=>k.toLowerCase().includes("foto")&&v&&String(v).startsWith("data:image/")).map(([k,v])=>({key:k,data:v}));
}
function shareText(r){
 const d=r.data, lines=[
 `🏥 BITÁCORA DE GUARDIA`,
 `━━━━━━━━━━━━━━━━━━`,
 `📌 ${typeName(r.type)}`,
 `📍 Área: ${r.area}`,
 `📅 Fecha y hora: ${fmt(r.createdAt)}`
 ];
 const labels={destino:"Destino del traslado",ambulancia:"Ambulancia",placaAmb:"Placa de ambulancia",choferAmb:"Conductor",
kmSalida:"Kilometraje de salida",combustible:"Nivel de combustible",nombre:"Paciente",sexo:"Sexo",edad:"Edad",procedencia:"Procedencia",acompanante:"Acompañante",
 acompananteSexo:"Sexo del acompañante",acompananteEdad:"Edad del acompañante",idPaciente:"Identificación del paciente",
 responsable:"Familiar / responsable",responsableSexo:"Sexo del responsable",
acompanante1:"Familiar acompañante 1",acompanante1Sexo:"Sexo acompañante 1",acompanante1Edad:"Edad acompañante 1",acompanante1Id:"Identificación acompañante 1",
acompanante2:"Familiar acompañante 2",acompanante2Sexo:"Sexo acompañante 2",acompanante2Edad:"Edad acompañante 2",acompanante2Id:"Identificación acompañante 2",
personal1:"Personal de salud 1",personal1Cargo:"Cargo personal 1",personal2:"Personal de salud 2",personal2Cargo:"Cargo personal 2",responsableEdad:"Edad del responsable",
 idResponsable:"Identificación del responsable",tipoVehiculo:"Tipo de vehículo",placa:"Placa",color:"Color",
 marcaModelo:"Marca / modelo",chofer:"Chófer",origen:"Procedencia",motivo:"Motivo de ingreso",persona:"Persona",
 tipoMovimiento:"Movimiento",acompanado:"A quién visita / acompaña",horaRelacionada:"Hora relacionada",
 pertenencias:"Objetos / pertenencias",titulo:"Asunto",nota:"Nota",observaciones:"Observaciones"};
 Object.entries(d).forEach(([k,v])=>{if(v)lines.push(`• ${labels[k]||k}: ${v}`)});
 lines.push(`━━━━━━━━━━━━━━━━━━`);
 return lines.join("\n");
}
async function share(r){
 const text=shareText(r), photos=photoData(r);
 if(navigator.share){
   try{
     if(photos.length && navigator.canShare){
       const files=[];
       for(let i=0;i<photos.length;i++){
         const blob=await (await fetch(photos[i].data)).blob();
         files.push(new File([blob],`bitacora_${r.id}_${i+1}.jpg`,{type:"image/jpeg"}));
       }
       if(navigator.canShare({files})) { await navigator.share({title:"Bitácora de guardia",text,files}); return; }
     }
     await navigator.share({title:"Bitácora de guardia",text});return;
   }catch(e){}
 }
 await navigator.clipboard?.writeText(text);
 toast(photos.length?"Texto copiado. El navegador no permite adjuntar la foto automáticamente.":"Texto copiado. Puedes pegarlo en WhatsApp.");
}
function deleteRecord(id){if(confirm("¿Eliminar este registro? Esta acción no se puede deshacer.")){records=records.filter(r=>r.id!==id);save();toast("Registro eliminado")}}
function render(){
 const q=($("#searchInput")?.value||"").toLowerCase();
 const arr=records.filter(r=>JSON.stringify(r).toLowerCase().includes(q));
 $("#countBadge").textContent=records.length;
 $("#emptyState").style.display=arr.length?"none":"block";
 $("#records").innerHTML=arr.map(r=>`<article class="record">
 <div class="record-top"><div><div class="record-title">${esc(typeName(r.type))}</div><div class="record-meta">📍 ${esc(r.area)} · ${esc(fmt(r.createdAt))}</div></div></div>
 <div class="record-summary">${esc(summary(r))}</div>
 ${photoData(r).length?`<div class="record-photo">📷 ${photoData(r).length} foto${photoData(r).length>1?"s":""} adjunta${photoData(r).length>1?"s":""}</div>`:""}
 <div class="record-actions"><button onclick="shareById('${r.id}')">📤 Compartir</button><button onclick="editById('${r.id}')">✏️ Ver / editar</button><button class="danger" onclick="deleteRecord('${r.id}')">🗑️</button></div>
 </article>`).join("");
}
window.shareById=id=>{const r=records.find(x=>x.id===id);if(r)share(r)}
window.deleteRecord=deleteRecord;
window.editById=id=>{
 const r=records.find(x=>x.id===id);if(!r)return;
 openForm(r.type);
 forms[r.type].fields.forEach(([k, , ft])=>{const el=$("#f_"+k);if(el && ft!=="photo")el.value=r.data[k]||""});
 $("#recordForm").onsubmit=async e=>{e.preventDefault();const cfg=forms[r.type];const data={};
 for(const [k, , ft] of cfg.fields){const el=$("#f_"+k); if(ft==="photo"){if(el?.files?.[0])data[k]=await compressImage(el.files[0]);else if(r.data[k])data[k]=r.data[k];}else data[k]=el?.value?.trim()||"";}
 r.data=data;save();closeModal();toast("Registro actualizado");};
}
$("#searchInput").oninput=render;
$("#shareAllBtn").onclick=async()=>{
 if(!records.length)return toast("No hay registros para compartir");
 const text=["🏥 BITÁCORA DE GUARDIA",`📅 Generada: ${fmt(new Date())}`,`📍 Registros: ${records.length}`,"━━━━━━━━━━━━━━━━━━",...records.slice().reverse().map(shareText)].join("\n\n");
 if(navigator.share){try{await navigator.share({title:"Bitácora de guardia",text});return}catch(e){}}
 await navigator.clipboard?.writeText(text);toast("Bitácora copiada. Puedes pegarla en WhatsApp.");
};
$("#changeAreaBtn").onclick=()=>{$("#areaInput").value=currentArea;$("#areaModal").classList.remove("hidden")};
$("#closeAreaModal").onclick=()=>$("#areaModal").classList.add("hidden");
$("#saveAreaBtn").onclick=()=>{const a=$("#areaInput").value.trim();if(!a)return;currentArea=a;localStorage.setItem(AREA_KEY,a);setArea();$("#areaModal").classList.add("hidden");toast("Área actualizada")};

window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("#installBtn").classList.remove("hidden")});
$("#installBtn").onclick=async()=>{if(!deferredInstall)return;deferredInstall.prompt();deferredInstall=null};

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
render();

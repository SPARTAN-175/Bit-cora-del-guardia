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
$("#recordForm").onsubmit=e=>{
 e.preventDefault();const type=e.currentTarget.dataset.type,cfg=forms[type];
 const data={};cfg.fields.forEach(([id])=>data[id]=document.querySelector("#f_"+id)?.value?.trim()||"");
 records.unshift({id:crypto.randomUUID(),type,createdAt:nowISO(),area:currentArea,data});
 save();closeModal();toast("Registro guardado correctamente");
};

function summary(r){
 const d=r.data;
 if(r.type==="paciente") return `${d.nombre||"Paciente"} · ${d.sexo||""} · ${d.edad||"?"} años${d.procedencia?" · "+d.procedencia:""}`;
 if(r.type==="internamiento") return `${d.nombre||"Paciente"} · Responsable: ${d.responsable||"—"}`;
 if(r.type==="vehiculo") return `${d.tipoVehiculo||"Vehículo"} · ${d.placa||"Sin placa"}${d.chofer?" · "+d.chofer:""}`;
 if(r.type==="incidencia") return `${d.tipoMovimiento||"Movimiento"} · ${d.persona||"Persona"}${d.acompanado?" · "+d.acompanado:""}`;
 return `${d.titulo||"Nota"} · ${d.nota||""}`;
}
function typeName(t){return {paciente:"Paciente",internamiento:"Internamiento",vehiculo:"Vehículo",incidencia:"Incidencia",nota:"Nota"}[t]}

function shareText(r){
 const d=r.data, lines=[
 `🏥 BITÁCORA DE GUARDIA`,
 `━━━━━━━━━━━━━━━━━━`,
 `📌 ${typeName(r.type)}`,
 `📍 Área: ${r.area}`,
 `📅 Fecha y hora: ${fmt(r.createdAt)}`
 ];
 const labels={nombre:"Paciente",sexo:"Sexo",edad:"Edad",procedencia:"Procedencia",acompanante:"Acompañante",
 acompananteSexo:"Sexo del acompañante",acompananteEdad:"Edad del acompañante",idPaciente:"Identificación del paciente",
 responsable:"Familiar / responsable",responsableSexo:"Sexo del responsable",responsableEdad:"Edad del responsable",
 idResponsable:"Identificación del responsable",tipoVehiculo:"Tipo de vehículo",placa:"Placa",color:"Color",
 marcaModelo:"Marca / modelo",chofer:"Chófer",origen:"Procedencia",motivo:"Motivo de ingreso",persona:"Persona",
 tipoMovimiento:"Movimiento",acompanado:"A quién visita / acompaña",horaRelacionada:"Hora relacionada",
 pertenencias:"Objetos / pertenencias",titulo:"Asunto",nota:"Nota",observaciones:"Observaciones"};
 Object.entries(d).forEach(([k,v])=>{if(v)lines.push(`• ${labels[k]||k}: ${v}`)});
 lines.push(`━━━━━━━━━━━━━━━━━━`);
 return lines.join("\n");
}
async function share(r){
 const text=shareText(r);
 if(navigator.share){try{await navigator.share({title:"Bitácora de guardia",text});return}catch(e){}}
 await navigator.clipboard?.writeText(text);toast("Texto copiado. Puedes pegarlo en WhatsApp.");
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
 <div class="record-actions"><button onclick="shareById('${r.id}')">📤 Compartir</button><button onclick="editById('${r.id}')">✏️ Ver / editar</button><button class="danger" onclick="deleteRecord('${r.id}')">🗑️</button></div>
 </article>`).join("");
}
window.shareById=id=>{const r=records.find(x=>x.id===id);if(r)share(r)}
window.deleteRecord=deleteRecord;
window.editById=id=>{
 const r=records.find(x=>x.id===id);if(!r)return;
 openForm(r.type);
 forms[r.type].fields.forEach(([k])=>{const el=$("#f_"+k);if(el)el.value=r.data[k]||""});
 $("#recordForm").onsubmit=e=>{e.preventDefault();const cfg=forms[r.type];const data={};cfg.fields.forEach(([k])=>data[k]=$("#f_"+k)?.value?.trim()||"");r.data=data;save();closeModal();toast("Registro actualizado");};
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

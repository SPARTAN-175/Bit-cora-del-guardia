const KEY="bitacora_guardia_v1";
const AREA_KEY="bitacora_area_v1";
const GUARD_KEY="bitacora_guard_name_v1";
let records=JSON.parse(localStorage.getItem(KEY)||"[]");
let currentArea=localStorage.getItem(AREA_KEY)||"Urgencias";
let guardName=localStorage.getItem(GUARD_KEY)||"";
let selectedDate=new Date().toLocaleDateString("en-CA");
let deferredInstall=null;
let pendingQuickType=null;
let photoFiles={};
let photoCleared={};
let editingRecordId=null;
if(!history.state?.bitacora)history.replaceState({bitacora:true,view:"base"},"",location.href);
function pushView(view){history.pushState({bitacora:true,view},"",location.href)}
function replaceView(view){history.replaceState({bitacora:true,view},"",location.href)}
function hideAllOverlays(){["#modal","#areaModal","#guardModal"].forEach(s=>$(s)?.classList.add("hidden"));$("#drawer")?.classList.remove("open");$("#drawerBackdrop")?.classList.add("hidden");}

const $=s=>document.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const nowISO=()=>new Date().toISOString();
const fmt=d=>new Intl.DateTimeFormat("es-MX",{dateStyle:"short",timeStyle:"short"}).format(new Date(d));
const fmtTime=d=>new Intl.DateTimeFormat("es-MX",{hour:"2-digit",minute:"2-digit"}).format(new Date(d));
const val=k=>$(k)?.value?.trim()||"";

function save(){
 try{localStorage.setItem(KEY,JSON.stringify(records));render();return true}
 catch(e){console.error(e);toast("No se pudo guardar: el almacenamiento está lleno. La foto es demasiado grande.","error");return false}
}
let toastTimer=null;
function toast(message,type="success"){
 const x=$("#toast");
 if(!x)return;
 const icons={success:"✓",error:"✕",warning:"⚠",info:"ℹ"};
 x.className=`toast toast-${type}`;
 x.innerHTML=`<span class="toast-icon">${icons[type]||icons.info}</span><span class="toast-text">${esc(message)}</span>`;
 void x.offsetWidth;
 x.classList.add("show");
 clearTimeout(toastTimer);
 toastTimer=setTimeout(()=>x.classList.remove("show"),2600);
}
function updateClock(){ $("#clock").textContent=fmt(new Date()) }
setInterval(updateClock,1000);updateClock();

function setArea(){
 currentArea=localStorage.getItem(AREA_KEY)||"Urgencias";
 $("#currentArea").textContent=currentArea; $("#drawerAreaName").textContent=currentArea;
}
setArea();

function setGuard(){
 guardName=localStorage.getItem(GUARD_KEY)||"";
 const shown=guardName||"Sin configurar";
 $("#guardDisplay").textContent=`👮 ${shown}`;
 $("#statusGuard").textContent=`👮 ${shown}`;
 $("#drawerGuardName").textContent=shown;
}
setGuard();

const forms={
paciente:{
 title:"Ingreso / registro de paciente", fields:[
 ["nombre","Nombre del paciente","text",true],["sexo","Sexo","select",true,["Femenino","Masculino","Otro / no especificado"]],
 ["edad","Edad","number",true],["procedencia","Procedencia","text",false],["acompanante","Acompañante","text",false],
 ["acompananteSexo","Sexo del acompañante","select",false,["Femenino","Masculino","Otro / no especificado"]],
 ["acompananteEdad","Edad del acompañante","number",false],["idPaciente","Identificación del paciente","text",false],
 ["observaciones","Observaciones / incidencia","textarea",false],
 ["foto","📷 Foto / evidencia","photo",false]
]},
internamiento:{
 title:"Internamiento", fields:[
 ["nombre","Nombre del paciente","text",true],["sexo","Sexo","select",true,["Femenino","Masculino","Otro / no especificado"]],
 ["edad","Edad","number",true],["procedencia","Procedencia","text",false],["responsable","Familiar / responsable a cargo","text",true],
 ["responsableSexo","Sexo del responsable","select",false,["Femenino","Masculino","Otro / no especificado"]],
 ["responsableEdad","Edad del responsable","number",false],["idPaciente","Identificación del paciente","text",false],
 ["idResponsable","Identificación del responsable","text",true],["observaciones","Observaciones","textarea",false],
 ["foto","📷 Foto / evidencia","photo",false]
]},
vehiculo:{
 title:"Registro de vehículo", fields:[
 ["tipoVehiculo","Tipo de vehículo","select",true,["Automóvil","Camioneta","Motocicleta","Ambulancia","Taxi","Camión","Otro"]],
 ["placa","Placa","text",true],["color","Color","text",false],["marcaModelo","Marca / modelo","text",false],
 ["chofer","Nombre del chófer","text",false],["origen","Procedencia / de dónde viene","text",false],
 ["motivo","Motivo de ingreso","text",false],["observaciones","Observaciones","textarea",false],
 ["foto","📷 Foto / evidencia","photo",false]
]},
ambulancia:{
 title:"Traslado en ambulancia", fields:[
 ["destino","Destino del traslado","text",true],
 ["horaSalidaAmb","Hora de salida de ambulancia","timeToggle",false],
 ["horaRegresoAmb","Hora de regreso de ambulancia","timeToggle",false],
 ["pacientes","Pacientes del traslado","patientList",true],
 ["acompanantes","Acompañantes","companionList",false],
 ["ambulancia","Datos / número de ambulancia","text",false],
 ["placaAmb","Placa de la ambulancia","text",false],
 ["choferAmb","Nombre del conductor","text",true],
 ["kmSalida","Kilometraje de salida","number",false],
 ["combustible","Nivel de combustible","select",false,["Vacío","1/4","1/2","3/4","Lleno","No registrado"]],
 ["fotoVehiculo","📷 Foto de kilometraje / combustible","photo",false],
 ["personal1","Personal de salud 1","text",true],
 ["personal1Cargo","Cargo","select",false,["Enfermero/a","Médico/a","Paramédico/a","Otro"]],
 ["personal2","Personal de salud 2","text",false],
 ["personal2Cargo","Cargo","select",false,["Enfermero/a","Médico/a","Paramédico/a","Otro"]],
 ["observaciones","Observaciones del traslado","textarea",false],
 ["fotoAdicional","📷 Foto adicional","photo",false]
]},
incidencia:{
 title:"Incidencia / control de acceso", fields:[
 ["persona","Nombre de la persona","text",true],["tipoMovimiento","Movimiento","select",true,["Entrada","Salida","Regreso","Otro"]],
 ["acompanado","¿A quién visita / acompaña?","text",false],["horaRelacionada","Hora de salida / regreso relacionada","time",false],
 ["pertenencias","Qué llevaba / objetos relevantes","textarea",false],["procedencia","Procedencia","text",false],
 ["observaciones","Descripción de la incidencia","textarea",true],
 ["foto","📷 Foto / evidencia","photo",false]
]},
nota:{
 title:"Nota libre", fields:[
 ["titulo","Título / asunto","text",true],["nota","Nota","textarea",true],
 ["foto","📷 Foto / evidencia","photo",false]
]}
};

function fieldHTML(f){
 const [id,label,type,required,opts]=f;
 if(type==="textarea") return `<label class="full-col">${label}${required?" *":""}<textarea id="f_${id}" ${required?"required":""} placeholder="Escribe aquí…"></textarea></label>`;
 if(type==="photo") return `<div class="full-col photo-picker"><span class="field-label">${label}</span><div class="photo-buttons"><button type="button" class="secondary photo-action" id="cam_${id}">📷 Tomar foto</button><button type="button" class="secondary photo-action" id="gal_${id}">🖼️ Galería</button><button type="button" class="danger photo-action photo-clear" id="clear_${id}">✕ Quitar foto</button></div><input id="camfile_${id}" type="file" accept="image/*" capture="environment" hidden><input id="galfile_${id}" type="file" accept="image/*" hidden><div id="preview_${id}" class="photo-preview"></div><small class="photo-help">La foto puede incluir fecha/hora y ubicación si el dispositivo la proporciona. Si no hay conexión o ubicación, funciona normalmente.</small></div>`;
 if(type==="patientList") return `<div class="full-col repeat-section"><div class="repeat-head"><div><span class="field-label">👤 ${label}${required?" *":""}</span><small class="photo-help">Agrega todos los pacientes sin mezclar sus datos.</small></div><button type="button" class="secondary add-repeat" id="addPatientBtn">＋ Agregar paciente</button></div><div id="patientsList"></div></div>`;
 if(type==="companionList") return `<div class="full-col repeat-section"><div class="repeat-head"><div><span class="field-label">👥 ${label}</span><small class="photo-help">Cada acompañante queda relacionado con un paciente.</small></div><button type="button" class="secondary add-repeat" id="addCompanionBtn">＋ Agregar acompañante</button></div><div id="companionsList"></div></div>`;
 if(type==="timeToggle") return `<div class="time-toggle-wrap"><span class="field-label">${label}</span><button type="button" class="secondary time-toggle" id="time_${id}" data-field="${id}">🕐 Registrar hora</button><small id="time_help_${id}" class="photo-help">Toca para registrar la hora actual. Si ya está registrada, toca para quitarla.</small></div>`;
 if(type==="select") return `<label>${label}${required?" *":""}<select id="f_${id}" ${required?"required":""}><option value="">Seleccionar…</option>${opts.map(o=>`<option>${esc(o)}</option>`).join("")}</select></label>`;
 return `<label>${label}${required?" *":""}<input id="f_${id}" type="${type}" ${required?"required":""} ${type==="number"?"min=0 max=130":""} placeholder="${label}"></label>`;
}

let repeatState={patients:[],companions:[]};
function blankPatient(){return {nombre:"",sexo:"",edad:"",procedencia:"",id:"",foto:""}}
function blankCompanion(){return {nombre:"",sexo:"",edad:"",parentesco:"",parentescoOtro:"",id:"",foto:""}}
function repeatPhotoHTML(prefix,index,label,existing=""){
 const key=`${prefix}${index}_foto`;
 return `<div class="mini-photo"><span class="field-label">${label}</span><div class="photo-buttons"><button type="button" class="secondary photo-action" data-repeat-cam="${key}">📷 Foto</button><button type="button" class="secondary photo-action" data-repeat-gal="${key}">🖼️ Galería</button><button type="button" class="danger photo-action" data-repeat-clear="${key}">✕</button></div><input id="repeat_cam_${key}" type="file" accept="image/*" capture="environment" hidden><input id="repeat_gal_${key}" type="file" accept="image/*" hidden><div id="repeat_preview_${key}" class="photo-preview">${existing?`<img src="${existing}" alt="Identificación">`:""}</div></div>`;
}
function renderPatients(){
 const box=$("#patientsList"); if(!box)return;
 box.innerHTML=repeatState.patients.map((p,i)=>`<div class="repeat-card"><div class="repeat-card-head"><strong>Paciente ${i+1}</strong>${i?`<button type="button" class="danger mini-remove" data-remove-patient="${i}">Eliminar</button>`:""}</div><div class="form-grid"><label>Nombre *<input data-patient="${i}" data-key="nombre" value="${esc(p.nombre)}" placeholder="Nombre del paciente"></label><label>Sexo<select data-patient="${i}" data-key="sexo"><option value="">Seleccionar…</option>${["Femenino","Masculino","Otro / no especificado"].map(o=>`<option ${p.sexo===o?"selected":""}>${o}</option>`).join("")}</select></label><label>Edad<input type="number" min="0" max="130" data-patient="${i}" data-key="edad" value="${esc(p.edad)}"></label><label>Procedencia<input data-patient="${i}" data-key="procedencia" value="${esc(p.procedencia)}"></label><label class="full-col">Identificación<input data-patient="${i}" data-key="id" value="${esc(p.id)}" placeholder="INE, CURP, pasaporte, etc."></label>${repeatPhotoHTML("p",i,"📷 Foto de identificación",p.foto)}</div></div>`).join("");
 wireRepeatInputs();
}
function renderCompanions(){
 const box=$("#companionsList"); if(!box)return;
 box.innerHTML=repeatState.companions.map((c,i)=>`<div class="repeat-card"><div class="repeat-card-head"><strong>Acompañante ${i+1}</strong><button type="button" class="danger mini-remove" data-remove-companion="${i}">Eliminar</button></div><div class="form-grid"><label>Nombre<input data-companion="${i}" data-key="nombre" value="${esc(c.nombre)}" placeholder="Nombre del acompañante"></label><label>Sexo<select data-companion="${i}" data-key="sexo"><option value="">Seleccionar…</option>${["Femenino","Masculino","Otro / no especificado"].map(o=>`<option ${c.sexo===o?"selected":""}>${o}</option>`).join("")}</select></label><label>Edad<input type="number" min="0" max="130" data-companion="${i}" data-key="edad" value="${esc(c.edad)}"></label><label>Parentesco<select data-companion="${i}" data-key="parentesco" class="parentesco-select"><option value="">Seleccionar…</option>${["Padre","Madre","Esposo/a","Hijo/a","Hermano/a","Abuelo/a","Tío/a","Primo/a","Otro"].map(o=>`<option ${c.parentesco===o?"selected":""}>${o}</option>`).join("")}</select></label>${c.parentesco==="Otro"?`<label>Especifique parentesco<input data-companion="${i}" data-key="parentescoOtro" value="${esc(c.parentescoOtro)}" placeholder="Ej. vecino, amigo…"></label>`:""}<label class="full-col">Identificación<input data-companion="${i}" data-key="id" value="${esc(c.id)}" placeholder="INE, CURP, etc."></label>${repeatPhotoHTML("c",i,"📷 Foto de identificación",c.foto)}</div></div>`).join("");
 wireRepeatInputs();
}
function wireRepeatInputs(){
 document.querySelectorAll("[data-patient]").forEach(el=>el.oninput=()=>{repeatState.patients[+el.dataset.patient][el.dataset.key]=el.value});
 document.querySelectorAll("[data-companion]").forEach(el=>{el.oninput=()=>{const i=+el.dataset.companion;repeatState.companions[i][el.dataset.key]=el.value;if(el.dataset.key==="parentesco")renderCompanions()}});
 document.querySelectorAll("[data-remove-patient]").forEach(b=>b.onclick=()=>{repeatState.patients.splice(+b.dataset.removePatient,1);renderPatients()});
 document.querySelectorAll("[data-remove-companion]").forEach(b=>b.onclick=()=>{repeatState.companions.splice(+b.dataset.removeCompanion,1);renderCompanions()});
 document.querySelectorAll("[data-repeat-cam],[data-repeat-gal],[data-repeat-clear]").forEach(btn=>{
   const key=btn.dataset.repeatCam||btn.dataset.repeatGal||btn.dataset.repeatClear;
   const cam=$("#repeat_cam_"+key),gal=$("#repeat_gal_"+key),preview=$("#repeat_preview_"+key);
   if(btn.dataset.repeatCam)btn.onclick=()=>cam.click();
   if(btn.dataset.repeatGal)btn.onclick=()=>gal.click();
   if(btn.dataset.repeatClear)btn.onclick=()=>{photoFiles[key]=null;photoCleared[key]=true;preview.innerHTML=""};
   const choose=file=>{if(!file)return;photoFiles[key]=file;photoCleared[key]=false;preview.innerHTML="<span class=\"photo-help\">Foto seleccionada</span>"};
   cam.onchange=e=>choose(e.target.files?.[0]);gal.onchange=e=>choose(e.target.files?.[0]);
 });
}
function setupTimeToggles(){
 ["horaSalidaAmb","horaRegresoAmb"].forEach(id=>{const b=$("#time_"+id);if(!b)return;b.onclick=()=>{const current=$("#f_"+id)?.value;if(current){$("#f_"+id).value="";b.textContent="🕐 Registrar hora";}else{const now=new Date();const t=new Intl.DateTimeFormat("es-MX",{hour:"2-digit",minute:"2-digit",hour12:false}).format(now);$("#f_"+id).value=t;b.textContent=`🕐 ${t}`;}}});
}

function setupPhotoPickers(fields, resetState=true){
 if(resetState){photoFiles={};photoCleared={};}
 fields.filter(([id,,ft])=>ft==="photo").forEach(([id])=>{
  const camBtn=$("#cam_"+id),galBtn=$("#gal_"+id),clearBtn=$("#clear_"+id),cam=$("#camfile_"+id),gal=$("#galfile_"+id),preview=$("#preview_"+id);
  camBtn.onclick=()=>cam.click(); galBtn.onclick=()=>gal.click();
  const choose=file=>{if(!file)return;photoFiles[id]=file;photoCleared[id]=false;preview.innerHTML="";const img=document.createElement("img");img.src=URL.createObjectURL(file);preview.appendChild(img);};
  const clear=()=>{photoFiles[id]=null;photoCleared[id]=true;cam.value="";gal.value="";preview.innerHTML="";};
  clearBtn.onclick=clear;
  cam.onchange=e=>choose(e.target.files?.[0]); gal.onchange=e=>choose(e.target.files?.[0]);
 });
}

function openForm(type,useHistory=true){
 editingId=null;
 editingRecordId=null;
 photoFiles={};photoCleared={};
 const cfg=forms[type]; if(useHistory)pushView("record"); $("#modalTitle").textContent=cfg.title;
 $("#modalEyebrow").textContent=`NUEVO REGISTRO · ${currentArea.toUpperCase()}`;
 $("#recordForm").innerHTML=`<div class="form-grid">${cfg.fields.map(fieldHTML).join("")}</div>
 <div class="form-actions"><button type="button" class="secondary" id="cancelForm">Cancelar</button><button class="primary" type="submit">💾 Guardar registro</button></div>`;
 $("#modal").classList.remove("hidden");$("#modal").setAttribute("aria-hidden","false");
 $("#recordForm").dataset.type=type;setupPhotoPickers(cfg.fields);
 if(type==="ambulancia"){repeatState={patients:[blankPatient()],companions:[]};renderPatients();renderCompanions();$("#addPatientBtn").onclick=()=>{repeatState.patients.push(blankPatient());renderPatients()};$("#addCompanionBtn").onclick=()=>{repeatState.companions.push(blankCompanion());renderCompanions()};setupTimeToggles();}
 $("#f_nombre")?.focus();$("#cancelForm").onclick=closeModal;
}

function closeModal(fromPop=false){$("#modal").classList.add("hidden");$("#modal").setAttribute("aria-hidden","true");if(!fromPop&&history.state?.view==="record")replaceView("base")}
document.querySelectorAll(".quick-card").forEach(b=>b.onclick=()=>{
 if(!guardName){pendingQuickType=b.dataset.type;$("#guardNameInput").value="";$("#guardModal").classList.remove("hidden");$("#guardNameInput").focus();return;}
 openForm(b.dataset.type);
});
$("#closeModal").onclick=closeModal;
async function prepareRepeatedPeople(list,prefix){
 const out=[];
 for(let i=0;i<list.length;i++){
   const x=list[i];
   const isComp=prefix==="c";
   const hasAny=Object.entries(x).some(([k,v])=>k!=="foto"&&String(v||"").trim());
   if(!hasAny)continue;
   const item={...x};
   const key=`${prefix}${i}_foto`;
   if(photoFiles[key]) item.foto=await compressImage(photoFiles[key]);
   else if(editingRecordId && !photoCleared[key]){const old=records.find(r=>r.id===editingRecordId);const oldList=old?.data?.[isComp?"acompanantes":"pacientes"]||[];if(oldList[i]?.foto)item.foto=oldList[i].foto;}
   if(isComp && item.parentesco==="Otro")item.parentesco=item.parentescoOtro||"Otro";
   delete item.parentescoOtro;
   out.push(item);
 }
 return out;
}
$("#recordForm").onsubmit=async e=>{
 e.preventDefault();
 if(!guardName){pendingQuickType=e.currentTarget.dataset.type;closeModal();openGuardModal();return}
 const type=e.currentTarget.dataset.type,cfg=forms[type],data={};
 if(type==="ambulancia"){
   if(!repeatState.patients.length || !repeatState.patients[0].nombre.trim())return toast("Agrega al menos un paciente","warning");
   data.pacientes=await prepareRepeatedPeople(repeatState.patients,"p","Paciente");
   data.acompanantes=await prepareRepeatedPeople(repeatState.companions,"c","Acompañante");
 }
 for(const [id,,fieldType] of cfg.fields){
   if(fieldType==="patientList"||fieldType==="companionList")continue;
   const el=$("#f_"+id);
   if(fieldType==="photo"){
     if(photoFiles[id]) data[id]=await compressImage(photoFiles[id]);
     else if(editingRecordId){const old=records.find(x=>x.id===editingRecordId);if(old?.data?.[id]&&!photoCleared[id])data[id]=old.data[id];}
   } else data[id]=el?.value?.trim()||"";
 }
 if(editingRecordId){
   const r=records.find(x=>x.id===editingRecordId);
   if(r){r.data=data;save();closeModal();toast("Registro actualizado");}
 }else{
   records.unshift({id:crypto.randomUUID(),type,createdAt:nowISO(),area:currentArea,guard:guardName||"Sin configurar",data});
   save();closeModal();toast("Registro guardado correctamente");
 }
};

function summary(r){
 const d=r.data;
 if(r.type==="paciente") return `${d.nombre||"Paciente"} · ${d.sexo||""} · ${d.edad||"?"} años${d.procedencia?" · "+d.procedencia:""}`;
 if(r.type==="internamiento") return `${d.nombre||"Paciente"} · Responsable: ${d.responsable||"—"}`;
 if(r.type==="vehiculo") return `${d.tipoVehiculo||"Vehículo"} · ${d.placa||"Sin placa"}${d.chofer?" · "+d.chofer:""}`;
 if(r.type==="ambulancia") return `Traslado a ${d.destino||"destino no indicado"} · ${d.nombre||"Paciente"}${d.choferAmb?" · Conductor: "+d.choferAmb:""}`;
 if(r.type==="incidencia") return `${d.tipoMovimiento||"Movimiento"} · ${d.persona||"Persona"}${d.acompanado?" · "+d.acompanado:""}${r.returnedAt?" · ↩ Regresó "+fmtTime(r.returnedAt):""}`;
 return `${d.titulo||"Nota"} · ${d.nota||""}`;
}
function typeName(t){return {paciente:"Paciente",internamiento:"Internamiento",vehiculo:"Vehículo",ambulancia:"Traslado en ambulancia",incidencia:"Entrada / salida",nota:"Nota"}[t]}

function getPhotoLocation(){
 return new Promise(resolve=>{
   if(!navigator.geolocation)return resolve("");
   navigator.geolocation.getCurrentPosition(pos=>resolve(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`),()=>resolve(""),{enableHighAccuracy:true,timeout:2500,maximumAge:60000});
 });
}
function compressImage(file){
 return new Promise(async (resolve,reject)=>{
   try{
     const reader=new FileReader();
     reader.onload=async()=>{
       try{
         const img=new Image();
         img.onload=async()=>{
           const max=900, scale=Math.min(1,max/Math.max(img.width,img.height));
           const footer=82;
           const c=document.createElement("canvas");c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale)+footer;
           const ctx=c.getContext("2d");ctx.fillStyle="#fff";ctx.fillRect(0,0,c.width,c.height);
           ctx.drawImage(img,0,0,c.width,c.height-footer);
           const location=await getPhotoLocation();
           const when=new Date();
           ctx.fillStyle="#fff";ctx.fillRect(0,c.height-footer,c.width,footer);
           ctx.fillStyle="#111";ctx.font="bold 18px Arial";ctx.fillText("Bitácora de Guardia",18,c.height-footer+25);
           ctx.font="15px Arial";ctx.fillText(`Fecha/hora: ${fmt(when)}`,18,c.height-footer+47);
           ctx.fillText(location?`Ubicación GPS: ${location}`:"Ubicación GPS: no disponible",18,c.height-footer+68);
           resolve(c.toDataURL("image/jpeg",.58));
         };
         img.onerror=reject;img.src=reader.result;
       }catch(e){reject(e)}
     };
     reader.onerror=reject;reader.readAsDataURL(file);
   }catch(e){reject(e)}
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
  `👮 Guardia: ${r.guard||"Sin configurar"}`,
  `📅 Fecha y hora: ${fmt(r.createdAt)}`
 ];
 if(r.type==="incidencia" && r.data.tipoMovimiento==="Salida") lines.push(r.returnedAt?`↩️ Regreso: ${fmt(r.returnedAt)}`:`↩️ Regreso: Pendiente`);
 const labels={
  destino:"Destino del traslado",horaSalidaAmb:"Hora de salida de ambulancia",horaRegresoAmb:"Hora de regreso de ambulancia",ambulancia:"Ambulancia",placaAmb:"Placa de ambulancia",choferAmb:"Conductor",
  kmSalida:"Kilometraje de salida",combustible:"Nivel de combustible",
  nombre:"Paciente",sexo:"Sexo",edad:"Edad",procedencia:"Procedencia",acompanante:"Acompañante",
  acompananteSexo:"Sexo del acompañante",acompananteEdad:"Edad del acompañante",idPaciente:"Identificación del paciente",
  responsable:"Familiar / responsable",responsableSexo:"Sexo del responsable",responsableEdad:"Edad del responsable",
  idResponsable:"Identificación del responsable",
  acompanante1:"Familiar acompañante 1",acompanante1Sexo:"Sexo acompañante 1",acompanante1Edad:"Edad acompañante 1",acompanante1Id:"Identificación acompañante 1",
  acompanante2:"Familiar acompañante 2",acompanante2Sexo:"Sexo acompañante 2",acompanante2Edad:"Edad acompañante 2",acompanante2Id:"Identificación acompañante 2",
  personal1:"Personal de salud 1",personal1Cargo:"Cargo personal 1",personal2:"Personal de salud 2",personal2Cargo:"Cargo personal 2",
  tipoVehiculo:"Tipo de vehículo",placa:"Placa",color:"Color",marcaModelo:"Marca / modelo",chofer:"Chófer",
  origen:"Procedencia",motivo:"Motivo de ingreso",persona:"Persona",tipoMovimiento:"Movimiento",
  acompanhado:"A quién visita / acompaña",acompanado:"A quién visita / acompaña",horaRelacionada:"Hora relacionada",
  pertenencias:"Objetos / pertenencias",titulo:"Asunto",nota:"Nota",observaciones:"Observaciones"
 };

 // Los pacientes y acompañantes se reportan por separado para no mezclar datos.
 if(r.type==="ambulancia"){
   (d.pacientes||[]).forEach((p,i)=>{
     lines.push(`👤 Paciente ${i+1}: ${p.nombre||"—"}`);
     if(p.sexo)lines.push(`  • Sexo: ${p.sexo}`); if(p.edad)lines.push(`  • Edad: ${p.edad}`); if(p.procedencia)lines.push(`  • Procedencia: ${p.procedencia}`); if(p.id)lines.push(`  • Identificación: ${p.id}`);
   });
   (d.acompanantes||[]).forEach((c,i)=>{
     lines.push(`👥 Acompañante ${i+1}: ${c.nombre||"—"}`);
     if(c.parentesco)lines.push(`  • Parentesco: ${c.parentesco}`); if(c.sexo)lines.push(`  • Sexo: ${c.sexo}`); if(c.edad)lines.push(`  • Edad: ${c.edad}`); if(c.id)lines.push(`  • Identificación: ${c.id}`);
   });
 }
 // IMPORTANTÍSIMO: los campos de fotografía se guardan como Data URL,
 // pero JAMÁS se incluyen en el texto del reporte.
 Object.entries(d).forEach(([k,v])=>{
   if(k==="pacientes"||k==="acompanantes")return;
   if(!v)return;
   if(k.toLowerCase().includes("foto"))return;
   if(typeof v==="string" && v.startsWith("data:image/"))return;
   lines.push(`• ${labels[k]||k}: ${v}`);
 });
 lines.push(`━━━━━━━━━━━━━━━━━━`);
 return lines.join("\n");
}
async function makeShareImage(r){
 const photos=photoData(r);
 if(!photos.length)return null;

 // Una sola foto: conservarla como fotografía normal, sin volver a dibujarla.
 if(photos.length===1){
   const response=await fetch(photos[0].data);
   return await response.blob();
 }

 // Varias fotos: unirlas en una sola imagen para que Android/WhatsApp
 // reciba un único archivo y evitar bloqueos por múltiples adjuntos.
 const imgs=await Promise.all(photos.map(p=>new Promise((resolve,reject)=>{
   const img=new Image();
   img.onload=()=>resolve(img);
   img.onerror=reject;
   img.src=p.data;
 })));

 const maxW=1000,gap=12;
 const sizes=imgs.map(img=>{
   const scale=Math.min(1,maxW/img.width);
   return {w:Math.round(img.width*scale),h:Math.round(img.height*scale)};
 });
 const width=Math.max(...sizes.map(x=>x.w));
 const height=sizes.reduce((sum,x)=>sum+x.h,0)+gap*(sizes.length-1);
 const canvas=document.createElement("canvas");
 canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext("2d");
 ctx.fillStyle="#fff";ctx.fillRect(0,0,width,height);
 let y=0;
 imgs.forEach((img,i)=>{
   const z=sizes[i],x=Math.round((width-z.w)/2);
   ctx.drawImage(img,x,y,z.w,z.h);
   y+=z.h+gap;
 });
 return new Promise(resolve=>canvas.toBlob(resolve,"image/jpeg",.78));
}
async function share(r){
 const text=shareText(r);
 const photos=photoData(r);

 if(navigator.share){
   try{
     if(photos.length && navigator.canShare){
       const blob=await makeShareImage(r);
       if(blob){
         const extension=blob.type==="image/png"?"png":"jpg";
         const file=new File([blob],`bitacora_${r.id}.${extension}`,{type:blob.type||"image/jpeg"});
         if(navigator.canShare({files:[file]})){
           await navigator.share({
             title:"Bitácora de guardia",
             text:text,
             files:[file]
           });
           return;
         }
       }
     }

     // Si el dispositivo no permite adjuntar archivos, compartir solamente texto.
     await navigator.share({title:"Bitácora de guardia",text:text});
     return;
   }catch(e){
     if(e?.name==="AbortError")return;
   }
 }

 try{await navigator.clipboard?.writeText(text)}catch(_){}
 toast(photos.length
   ?"Texto copiado. Este navegador no permite adjuntar la foto desde aquí."
   :"Texto copiado. Puedes pegarlo en WhatsApp.");
}
function markReturnById(id){
 const r=records.find(x=>x.id===id);
 if(!r || r.type!=="incidencia" || r.data.tipoMovimiento!=="Salida") return;
 if(r.returnedAt) return toast(`Regreso ya registrado: ${fmtTime(r.returnedAt)}`);
 r.returnedAt=nowISO();save();toast(`↩️ Regreso registrado a las ${fmtTime(r.returnedAt)}`);
}
window.markReturnById=markReturnById;

function deleteRecord(id){if(confirm("¿Eliminar este registro? Esta acción no se puede deshacer.")){records=records.filter(r=>r.id!==id);save();toast("Registro eliminado")}}
function render(){
 const q=($("#searchInput")?.value||"").toLowerCase();
 const date=$("#dateFilter")?.value||selectedDate;
 selectedDate=date;
 const arr=records.filter(r=>{
   const localDate=new Date(r.createdAt).toLocaleDateString("en-CA");
   return localDate===date && JSON.stringify(r).toLowerCase().includes(q);
 });
 const dayCount=records.filter(r=>new Date(r.createdAt).toLocaleDateString("en-CA")===date).length;
 $("#countBadge").textContent=dayCount;
 $("#emptyState").style.display=arr.length?"none":"block";
 $("#emptyState").innerHTML=`<div>📒</div><strong>${date===new Date().toLocaleDateString("en-CA")?"No hay registros de hoy":"No hay registros en este día"}</strong><p>${date===new Date().toLocaleDateString("en-CA")?"Selecciona una opción arriba para comenzar.":"Puedes consultar otro día desde el historial."}</p>`;
 $("#records").innerHTML=arr.map(r=>`<article class="record record-clickable" onclick="openRecordById('${r.id}')">
 <div class="record-top">
  <div><div class="record-title">${esc(typeName(r.type))}</div><div class="record-meta">📍 ${esc(r.area)} · 👮 ${esc(r.guard||"Sin configurar")} · ${esc(fmt(r.createdAt))}</div></div>
  ${r.type==="incidencia" && r.data.tipoMovimiento==="Salida" ? (r.returnedAt
   ? `<span class="return-status">↩️ ${esc(fmtTime(r.returnedAt))}</span>`
   : `<button class="return-btn" title="Marcar regreso" onclick="event.stopPropagation();markReturnById('${r.id}')">↩</button>`) : ""}
 </div>
 <div class="record-summary">${esc(summary(r))}</div>
 ${photoData(r).length?`<div class="record-photo">📷 ${photoData(r).length} foto${photoData(r).length>1?"s":""} adjunta${photoData(r).length>1?"s":""}</div>`:""}
 <div class="record-actions">
  <button onclick="event.stopPropagation();shareById('${r.id}')">📤 Compartir</button>
  <button onclick="event.stopPropagation();editById('${r.id}')">✏️ Ver / editar</button>
  <button class="danger" onclick="event.stopPropagation();deleteRecord('${r.id}')">🗑️</button>
 </div>
</article>`).join("");
}
window.shareById=id=>{const r=records.find(x=>x.id===id);if(r)share(r)}
window.openRecordById=id=>{const r=records.find(x=>x.id===id);if(r)editById(id)};
window.deleteRecord=deleteRecord;
window.editById=id=>{
 const r=records.find(x=>x.id===id);if(!r)return;
 editingRecordId=r.id;
 openForm(r.type,!(history.state?.view==="record"));
 editingRecordId=r.id;
 forms[r.type].fields.forEach(([k,,ft])=>{const el=$("#f_"+k);if(el&&ft!=="photo"&&ft!=="patientList"&&ft!=="companionList"&&ft!=="timeToggle")el.value=r.data[k]||""});
 setupPhotoPickers(forms[r.type].fields,false);
 if(r.type==="ambulancia"){repeatState={patients:(r.data.pacientes||[]).map(x=>({...blankPatient(),...x})),companions:(r.data.acompanantes||[]).map(x=>({...blankCompanion(),...x}))};if(!repeatState.patients.length)repeatState.patients=[blankPatient()];renderPatients();renderCompanions();$("#addPatientBtn").onclick=()=>{repeatState.patients.push(blankPatient());renderPatients()};$("#addCompanionBtn").onclick=()=>{repeatState.companions.push(blankCompanion());renderCompanions()};setupTimeToggles();["horaSalidaAmb","horaRegresoAmb"].forEach(id=>{const b=$("#time_"+id),v=r.data[id];if(v){$("#f_"+id).value=v;b.textContent=`🕐 ${v}`}});}

 forms[r.type].fields.forEach(([k,,ft])=>{if(ft==="photo"&&r.data[k]){const preview=$("#preview_"+k);if(preview)preview.innerHTML=`<img src="${r.data[k]}" alt="Foto guardada">`}});
};

$("#searchInput").oninput=render;
$("#dateFilter").value=selectedDate;
$("#dateFilter").onchange=()=>{selectedDate=$("#dateFilter").value;$("#searchInput").value="";render()};
async function shareCurrentDay(){
 const date=$("#dateFilter")?.value||selectedDate;
 const dayRecords=records.filter(r=>new Date(r.createdAt).toLocaleDateString("en-CA")===date);
 if(!dayRecords.length)return toast("No hay registros para compartir de este día","warning");
 const guards=[...new Set(dayRecords.map(r=>r.guard||"Sin configurar"))];
 const text=["🏥 BITÁCORA DE GUARDIA",`📅 Día: ${date}`,`👮 Guardia(s): ${guards.join(", ")}`,`📍 Registros: ${dayRecords.length}`,"━━━━━━━━━━━━━━━━━━",...dayRecords.slice().reverse().map(shareText)].join("\n\n");
 if(navigator.share){try{await navigator.share({title:`Bitácora ${date}`,text});return}catch(e){if(e?.name==="AbortError")return}}
 try{await navigator.clipboard?.writeText(text)}catch(_){}
 toast("Reporte del día copiado. Puedes pegarlo en WhatsApp.");
}
function openDrawer(){
 pushView("drawer");$("#drawer").classList.add("open");$("#drawerBackdrop").classList.remove("hidden");$("#drawer").setAttribute("aria-hidden","false");
}
function closeDrawer(fromPop=false){
 $("#drawer").classList.remove("open");$("#drawerBackdrop").classList.add("hidden");$("#drawer").setAttribute("aria-hidden","true");
 if(!fromPop&&history.state?.view==="drawer")history.back();
}
$("#menuBtn").onclick=openDrawer;
$("#closeDrawer").onclick=closeDrawer;
$("#drawerBackdrop").onclick=closeDrawer;

function openAreaModal(){
 $("#areaInput").value=currentArea;
 if(history.state?.view==="drawer")replaceView("area");else pushView("area");
 closeDrawer(true);$("#areaModal").classList.remove("hidden");
}
function openGuardModal(){
 $("#guardNameInput").value=guardName;
 if(history.state?.view==="drawer")replaceView("guard");else pushView("guard");
 closeDrawer(true);$("#guardModal").classList.remove("hidden");$("#guardNameInput").focus();
}
$("#quickAreaBtn").onclick=openAreaModal;
$("#drawerArea").onclick=openAreaModal;
$("#drawerGuard").onclick=openGuardModal;
$("#drawerToday").onclick=()=>{
 selectedDate=new Date().toLocaleDateString("en-CA");
 $("#dateFilter").value=selectedDate;
 $("#searchInput").value="";
 render(); closeDrawer();
};
$("#drawerHistory").onclick=()=>{openHistory();closeDrawer()};
$("#drawerShare").onclick=()=>{shareCurrentDay();closeDrawer()};
$("#drawerExport").onclick=()=>{exportBackup();closeDrawer()};
$("#drawerImport").onclick=()=>{closeDrawer();$("#backupFileInput").value="";$("#backupFileInput").click()};
$("#backupFileInput").onchange=e=>{const file=e.target.files?.[0];if(file)importBackupFile(file)};

$("#closeAreaModal").onclick=()=>closeAreaModal();
function closeAreaModal(fromPop=false){$("#areaModal").classList.add("hidden");if(!fromPop&&history.state?.view==="area")history.back();}
$("#saveAreaBtn").onclick=()=>{
 const a=$("#areaInput").value.trim();
 if(!a)return toast("Escribe un área");
 currentArea=a;localStorage.setItem(AREA_KEY,a);setArea();
 closeAreaModal(true);replaceView("base");toast("Área actualizada");
};

$("#closeGuardModal").onclick=()=>closeGuardModal();
function closeGuardModal(fromPop=false){$("#guardModal").classList.add("hidden");if(!fromPop&&history.state?.view==="guard")history.back();}
$("#saveGuardBtn").onclick=()=>{
 const n=$("#guardNameInput").value.trim();
 if(!n)return toast("Escribe el nombre del guardia");
 guardName=n;localStorage.setItem(GUARD_KEY,n);setGuard();
 closeGuardModal(true);replaceView("base");toast("Guardia configurado");
 if(pendingQuickType){
   const t=pendingQuickType; pendingQuickType=null;
   setTimeout(()=>openForm(t),120);
 }
};

function exportBackup(){
 const payload={app:"Bitácora de Guardia",schemaVersion:4,exportedAt:nowISO(),currentArea,guardName,selectedDate,records};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
 a.href=url;a.download=`bitacora_guardia_respaldo_${new Date().toISOString().slice(0,10)}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast("Respaldo exportado correctamente");
}
async function importBackupFile(file){
 try{
  const payload=JSON.parse(await file.text());
  if(!payload||payload.app!=="Bitácora de Guardia"||!Array.isArray(payload.records))throw new Error();
  if(!confirm(`El respaldo contiene ${payload.records.length} registros. ¿Quieres reemplazar los datos actuales por este respaldo?`))return;
  records=payload.records;currentArea=String(payload.currentArea||"Urgencias");guardName=String(payload.guardName||"");selectedDate=String(payload.selectedDate||new Date().toLocaleDateString("en-CA"));
  localStorage.setItem(KEY,JSON.stringify(records));localStorage.setItem(AREA_KEY,currentArea);localStorage.setItem(GUARD_KEY,guardName);
  $("#dateFilter").value=selectedDate;setArea();setGuard();render();toast("Respaldo importado correctamente");
 }catch(e){toast("No se pudo importar: archivo inválido","error")}
}

function openHistory(){
 const days=[...new Set(records.map(r=>new Date(r.createdAt).toLocaleDateString("en-CA")))].sort().reverse();
 if(!days.length)return toast("Todavía no hay días guardados","warning");
 const chosen=prompt(
   "Escribe la fecha que deseas consultar (AAAA-MM-DD):\n\n"+
   days.map(d=>`${d} · ${records.filter(r=>new Date(r.createdAt).toLocaleDateString("en-CA")===d).length} registros`).join("\n"),
   selectedDate
 );
 if(chosen && /^\d{4}-\d{2}-\d{2}$/.test(chosen)){
   selectedDate=chosen;$("#dateFilter").value=chosen;$("#searchInput").value="";render();
 }
}

$("#prevDayBtn").onclick=()=>{
 const d=new Date(selectedDate+"T12:00:00"); d.setDate(d.getDate()-1);
 selectedDate=d.toLocaleDateString("en-CA");$("#dateFilter").value=selectedDate;$("#searchInput").value="";render();
};
$("#nextDayBtn").onclick=()=>{
 const d=new Date(selectedDate+"T12:00:00"); d.setDate(d.getDate()+1);
 selectedDate=d.toLocaleDateString("en-CA");$("#dateFilter").value=selectedDate;$("#searchInput").value="";render();
};

window.addEventListener("popstate",e=>{
 const view=e.state?.bitacora?e.state.view:"base";hideAllOverlays();
 if(view==="drawer"){$("#drawer").classList.add("open");$("#drawerBackdrop").classList.remove("hidden")}
 if(view==="area")$("#areaModal").classList.remove("hidden");
 if(view==="guard")$("#guardModal").classList.remove("hidden");
 if(view==="record")$("#modal").classList.remove("hidden");
});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredInstall=e;$("#installBtn").classList.remove("hidden")});
$("#installBtn")?.addEventListener("click",async()=>{if(!deferredInstall)return;deferredInstall.prompt();deferredInstall=null});

if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js").catch(()=>{}));
render();

/* Evita menú contextual/selección accidental al mantener pulsada la pantalla. */
document.addEventListener("contextmenu",e=>{
  if(!["INPUT","TEXTAREA","SELECT"].includes(e.target.tagName)) e.preventDefault();
});
let longPressTimer;
document.addEventListener("touchstart",e=>{
  if(["INPUT","TEXTAREA","SELECT","BUTTON"].includes(e.target.tagName)) return;
  longPressTimer=setTimeout(()=>{try{window.getSelection()?.removeAllRanges()}catch(_){}},450);
},{passive:true});
document.addEventListener("touchend",()=>clearTimeout(longPressTimer),{passive:true});
document.addEventListener("touchmove",()=>clearTimeout(longPressTimer),{passive:true});

var DAYS=[["lun","Lundi"],["mar","Mardi"],["mer","Mercredi"],["jeu","Jeudi"],["ven","Vendredi"],["sam","Samedi"],["dim","Dimanche"]];
var recettes=[],view="people",openRec=null,editRec=false,delRec=null,people=[],sel=null,tab="fiche",delAsk=false,loaded=false;
function h(tag,p){var e=document.createElement(tag);p=p||{};for(var k in p){var v=p[k];if(k==="class")e.className=v;else if(k==="value"||k==="checked")e[k]=v;else if(k.indexOf("on")===0)e.addEventListener(k.slice(2),v);else e.setAttribute(k,v)}
for(var i=2;i<arguments.length;i++){var c=arguments[i];if(c==null)continue;if(Array.isArray(c)){c.forEach(function(x){e.append(x.nodeType?x:document.createTextNode(x))})}else e.append(c.nodeType?c:document.createTextNode(c))}return e}
function cur(){return people.find(function(p){return p.id===sel})}
var KEY="cuisine-christine-v1";
function persist(){try{localStorage.setItem(KEY,JSON.stringify(people))}catch(e){alert("Mémoire pleine sur cet appareil : supprimez d’anciennes photos de tickets ou téléchargez une sauvegarde.")}}
function save(id,data){var p=people.find(function(x){return x.id===id});if(!p)return;for(var k in data){var v=data[k];if(v&&typeof v==="object"&&!Array.isArray(v))p[k]=Object.assign({},p[k]||{},v);else p[k]=v}persist();render()}
function cleanLines(txt){return String(txt||"").split(/\r?\n/).map(function(s){return s.replace(/^[\s•\-\*]+/,"").replace(/\s+/g," ").trim()}).filter(Boolean).join("\n")}
function render(){
 var pe=document.getElementById("people");pe.textContent="";
 pe.append(h("button",{class:"chip"+(view==="recettes"?" on":""),onclick:function(){view="recettes";openRec=null;editRec=false;render()}},"📖 Recettes"));
 people.forEach(function(p){pe.append(h("button",{class:"chip"+(view==="people"&&p.id===sel?" on":""),onclick:function(){sel=p.id;tab="fiche";delAsk=false;view="people";render()}},p.name))});
 var m=document.getElementById("main");m.textContent="";
 if(view==="recettes"){renderRecettes(m);return}
 var p=cur();
 if(!p){m.append(h("div",{class:"empty"},loaded?"Ajoutez une première personne avec le champ à gauche (ou en haut sur téléphone) : Mamie, Océane, un voisin…":"Chargement…"));return}
 m.append(h("h2",{},p.name));
 var tabs=h("div",{class:"tabs"});
 [["fiche","Fiche"],["planning","Planning"],["courses","Courses et budget"]].forEach(function(t){tabs.append(h("button",{class:"tab"+(tab===t[0]?" on":""),onclick:function(){tab=t[0];render()}},t[1]))});
 m.append(tabs);
 if(tab==="fiche")fiche(m,p);else if(tab==="planning")planning(m,p);else courses(m,p);
}
var RKEY="cuisine-christine-recettes-v1";
function persistR(){try{localStorage.setItem(RKEY,JSON.stringify(recettes))}catch(e){alert("Enregistrement impossible sur cet appareil.")}}
function renderRecettes(m){
 if(openRec){
  var r=recettes.find(function(x){return x.id===openRec});
  if(!r){openRec=null;renderRecettes(m);return}
  var top=h("div",{style:"display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px"},
   h("button",{class:"btn ghost",onclick:function(){openRec=null;editRec=false;delRec=null;render()}},"← Retour aux recettes"),
   h("button",{class:"btn ghost",onclick:function(){editRec=!editRec;render()}},editRec?"Terminer la modification":"✏️ Modifier la recette")
  );
  m.append(top);
  var box=h("div",{class:"rec-full"});
  if(editRec){
   var nm=h("input",{value:r.nom,style:"font-weight:700;font-size:18px"});
   nm.addEventListener("change",function(){r.nom=nm.value.trim()||r.nom;persistR()});
   var gi=h("textarea",{value:r.ing||"",style:"min-height:180px"});
   gi.addEventListener("change",function(){r.ing=cleanLines(gi.value);gi.value=r.ing;persistR()});
   var ge=h("textarea",{value:r.etapes||"",style:"min-height:220px"});
   ge.addEventListener("change",function(){r.etapes=cleanLines(ge.value);ge.value=r.etapes;persistR()});
   box.append(h("label",{},"Nom de la recette"),nm,h("label",{},"Ingrédients (un par ligne)"),gi,h("label",{},"Étapes (une par ligne)"),ge);
  }else{
   box.append(h("h2",{style:"margin-bottom:4px"},r.nom));
   var ingArr=(r.ing||"").split("\n").map(function(s){return s.trim()}).filter(Boolean);
   var stepArr=(r.etapes||"").split("\n").map(function(s){return s.trim()}).filter(Boolean);
   var ul=h("ul",{class:"ing-list"});
   if(ingArr.length)ingArr.forEach(function(line){ul.append(h("li",{},line))});
   else ul.append(h("div",{class:"mut"},"Aucun ingrédient renseigné."));
   var ol=h("ol",{class:"step-list"});
   if(stepArr.length)stepArr.forEach(function(line){ol.append(h("li",{},line.replace(/^étape\s*\d+\s*[:\-\.]?\s*/i,"")))});
   else ol.append(h("div",{class:"mut"},"Aucune étape renseignée."));
   box.append(h("div",{class:"rec-grid"},
    h("div",{},h("h3",{},"Ingrédients"),ul),
    h("div",{},h("h3",{},"Préparation"),ol)
   ));
  }
  var bar=h("div",{class:"pick-people"});
  if(people.length){
   var checks=[];
   people.forEach(function(p){
    var cb=h("input",{type:"checkbox",checked:true});
    checks.push({person:p,cb:cb});
    bar.append(h("label",{class:"pick-chip"},cb,p.name));
   });
   var tc=h("button",{class:"btn",onclick:function(){
    var targets=checks.filter(function(x){return x.cb.checked}).map(function(x){return x.person});
    if(!targets.length){alert("Coche au moins une personne.");return}
    var lines=(r.ing||"").split("\n").map(function(s){return s.trim()}).filter(Boolean);
    targets.forEach(function(p){
     p.courses=(p.courses||[]).concat(lines.map(function(t){return {txt:t,fait:false}}));
    });
    persist();
    tc.textContent="Ajouté à "+targets.map(function(p){return p.name}).join(", ")+" ✓";
   }},"Ajouter aux courses");
   bar.append(tc);
  }
  var del=h("button",{class:"btn ghost",style:"margin-left:auto",onclick:function(){
   if(delRec!==r.id){delRec=r.id;render();return}
   recettes=recettes.filter(function(x){return x.id!==r.id});delRec=null;openRec=null;persistR();render()}},delRec===r.id?"Confirmer la suppression ?":"Supprimer");
  bar.append(del);
  box.append(bar);
  m.append(box);
  return;
 }

 m.append(h("h2",{},"Recettes"));
 var n=h("input",{placeholder:"Nom de la recette (ex. Lasagnes à la bolognaise)"});
 var web=h("button",{class:"btn ghost",type:"button",onclick:function(){
  var q=n.value.trim();
  if(!q){alert("Écris d’abord le nom d’une recette.");return}
  window.open("https://www.google.com/search?q="+encodeURIComponent("recette "+q),"_blank","noopener");
 }},"🔍 Chercher sur Google");
 var ing=h("textarea",{placeholder:"Colle ou écris les ingrédients (les espaces en trop sont nettoyés automatiquement)"});
 var st=h("textarea",{placeholder:"Colle ou écris les étapes (et les appareils utilisés si besoin : Cookeo, four…)"});
 var add=h("button",{class:"btn",onclick:function(){
  if(!n.value.trim())return;
  var id="r"+Date.now();
  recettes.unshift({id:id,nom:n.value.trim(),ing:cleanLines(ing.value),etapes:cleanLines(st.value)});
  persistR();openRec=id;editRec=false;render();
 }},"Ajouter la recette");
 m.append(h("div",{class:"card"},h("label",{},"Nouvelle recette"),h("div",{class:"rec-head"},n,web),h("label",{},"Ingrédients"),ing,h("label",{},"Étapes"),st,h("div",{style:"margin-top:12px"},add)));

 if(!recettes.length){m.append(h("div",{class:"mut"},"Aucune recette pour l’instant."));return}
 m.append(h("div",{class:"mut",style:"margin-bottom:8px"},"Clique sur une recette pour l’ouvrir en grand :"));
 recettes.forEach(function(r){
  var nb=(r.ing||"").split("\n").filter(Boolean).length;
  m.append(h("button",{class:"rec-item",onclick:function(){openRec=r.id;editRec=false;delRec=null;render()}},
   h("b",{},r.nom),
   h("span",{class:"mut"},nb?nb+" ingrédient"+(nb>1?"s":"")+" →":"Ouvrir →")
  ));
 });
}
function field(p,key,label,area){
 var f=p.fiche||{};var el=h(area?"textarea":"input",{value:f[key]||""});
 el.addEventListener("change",function(){var o={};o[key]=el.value;save(p.id,{fiche:o})});
 return [h("label",{},label),el];
}
function fiche(m,p){
 var a=h("div",{class:"card warn"},field(p,"allergies","⚠ Allergies et régimes",true));
 var b=h("div",{class:"card"},field(p,"aime","Ce que la personne aime",true),field(p,"naime","Ce qu’elle n’aime pas",true),field(p,"portions","Nombre de portions"),field(p,"jours","Jours de livraison ou de repas"),field(p,"notes","Autres notes",true));
 m.append(a,b);
 var del=h("button",{class:"btn ghost",onclick:function(){
  if(!delAsk){delAsk=true;render();return}
  people=people.filter(function(x){return x.id!==p.id});sel=null;delAsk=false;persist();render()}},delAsk?"Confirmer la suppression ?":"Supprimer cette personne");
 m.append(del);
}
function norm(s){return String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim()}
function planning(m,p){
 var pl=p.planning||{};var c=h("div",{class:"card"});
 var dl=h("datalist",{id:"rl"});recettes.forEach(function(r){dl.append(h("option",{value:r.nom}))});c.append(dl);
 DAYS.forEach(function(d){var el=h("input",{value:pl[d[0]]||"",placeholder:"Plat prévu",list:"rl"});
  el.addEventListener("change",function(){var o={};o[d[0]]=el.value;save(p.id,{planning:o})});
  c.append(h("div",{class:"row"},h("b",{},d[1]),el))});
 var rnd=h("button",{class:"btn ghost",onclick:function(){
  var bad=((p.fiche||{}).naime||"").split(/[,;\n]+/).map(norm).filter(Boolean);
  var ok=recettes.filter(function(r){var t=norm((r.ing||"")+" "+r.nom);return !bad.some(function(b){return t.indexOf(b)>=0})});
  if(!ok.length){alert(recettes.length?"Aucune recette ne convient à cette personne.":"Ajoutez d’abord des recettes.");return}
  var pool=[],o={};
  DAYS.forEach(function(d){if(pl[d[0]])return;if(!pool.length)pool=ok.slice();var i=Math.floor(Math.random()*pool.length);o[d[0]]=pool.splice(i,1)[0].nom});
  save(p.id,{planning:o})}},"🎲 Remplir les jours vides au hasard");
 m.append(c,rnd,h("div",{class:"mut",style:"margin-top:8px"},"Chaque modification s’enregistre toute seule. Le hasard évite les recettes qui contiennent un ingrédient de « Ce qu’elle n’aime pas »."));
}
function today(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function monthLabel(k){var s=new Date(k+"-01T12:00:00").toLocaleDateString("fr-FR",{month:"long",year:"numeric"});return s.charAt(0).toUpperCase()+s.slice(1)}
function readReceiptFile(file,cb){
 if(!file){cb(null);return}
 if(file.type.indexOf("image/")===0){
  var r=new FileReader();
  r.onload=function(){
   var img=new Image();
   img.onload=function(){
    var max=1100,w=img.width,ht=img.height;
    if(w>max||ht>max){if(w>ht){ht=Math.round(ht*max/w);w=max}else{w=Math.round(w*max/ht);ht=max}}
    var cv=document.createElement("canvas");cv.width=w;cv.height=ht;
    cv.getContext("2d").drawImage(img,0,0,w,ht);
    cb({name:file.name,type:"image/jpeg",data:cv.toDataURL("image/jpeg",0.72)});
   };
   img.src=r.result;
  };
  r.readAsDataURL(file);
 }else{
  if(file.size>1800000){alert("Ce PDF est trop lourd pour la mémoire du navigateur (maximum 1,8 Mo).");cb(null);return}
  var r2=new FileReader();
  r2.onload=function(){cb({name:file.name,type:file.type||"application/pdf",data:r2.result})};
  r2.readAsDataURL(file);
 }
}
function showFileModal(f){
 var ov=h("div",{class:"modal",onclick:function(e){if(e.target===ov)ov.remove()}});
 var box=h("div",{class:"modal-box"});
 box.append(h("div",{style:"display:flex;justify-content:space-between;align-items:center;gap:12px"},
  h("b",{},f.name||"Justificatif"),
  h("button",{class:"btn ghost",onclick:function(){ov.remove()}},"Fermer")
 ));
 if(f.type&&f.type.indexOf("image/")===0)box.append(h("img",{src:f.data}));
 else box.append(h("iframe",{src:f.data}));
 ov.append(box);
 document.body.append(ov);
}
function courses(m,p){
 var list=(p.courses||[]).slice();
 var c=h("div",{class:"card"},h("b",{},"Liste de courses"));
 if(!list.length)c.append(h("div",{class:"mut",style:"margin-top:8px"},"Rien pour l’instant."));
 list.forEach(function(x,i){
  var cb=h("input",{type:"checkbox",checked:!!x.fait});
  cb.addEventListener("change",function(){list[i].fait=cb.checked;save(p.id,{courses:list})});
  var t=h("input",{value:x.txt||"",class:x.fait?"done":""});
  t.addEventListener("change",function(){list[i].txt=t.value;save(p.id,{courses:list})});
  var d=h("button",{class:"btn ghost","aria-label":"Retirer",onclick:function(){list.splice(i,1);save(p.id,{courses:list})}},"✕");
  c.append(h("div",{class:"item",style:"grid-template-columns:auto 1fr auto;margin-top:8px"},cb,t,d));
 });
 var nt=h("input",{placeholder:"Ajouter un article"});
 var go=function(){if(!nt.value.trim())return;list.push({txt:nt.value.trim(),fait:false});save(p.id,{courses:list})};
 nt.addEventListener("keydown",function(e){if(e.key==="Enter")go()});
 c.append(h("div",{class:"item",style:"grid-template-columns:1fr auto;margin-top:8px"},nt,h("button",{class:"btn",onclick:go},"+")));
 c.append(h("button",{class:"btn ghost",style:"margin-top:6px",onclick:function(){save(p.id,{courses:[]})}},"Vider la liste"));
 m.append(c);

 var dep=(p.depenses||[]).slice();var bud=parseFloat(p.budget)||0;
 var bi=h("input",{type:"number",step:"0.01",min:"0",value:p.budget||"",placeholder:"Ex. 250"});
 bi.addEventListener("change",function(){save(p.id,{budget:bi.value})});
 var e=h("div",{class:"card"},h("b",{},"Tickets de caisse"),h("label",{},"Budget par mois (€)"),bi);
 var dd=h("input",{type:"date",value:today()});
 var ms=h("input",{placeholder:"Magasin (ex. Leclerc)"});
 var ma=h("input",{type:"number",step:"0.01",min:"0",placeholder:"Total €"});
 var fi=h("input",{type:"file",accept:"image/*,application/pdf"});
 var flTxt=h("span",{},"📎 Ticket / PDF");
 fi.addEventListener("change",function(){flTxt.textContent=fi.files[0]?"📎 "+fi.files[0].name.slice(0,14):"📎 Ticket / PDF"});
 var fl=h("label",{class:"file-lbl"},flTxt,fi);
 var add=h("button",{class:"btn",onclick:function(){
  var v=parseFloat(ma.value);if(isNaN(v))return;
  var file=fi.files[0];
  readReceiptFile(file,function(savedFile){
   dep.push({id:"d"+Date.now(),date:dd.value||today(),magasin:ms.value.trim(),montant:v,fichier:savedFile});
   save(p.id,{depenses:dep});
  });
 }},"Ajouter");
 e.append(h("label",{},"Nouveau ticket (avec photo ou PDF facultatif)"),h("div",{class:"dep"},dd,ms,ma,fl,add));
 var groups={};dep.forEach(function(x){var k=(x.date||"").slice(0,7);(groups[k]=groups[k]||[]).push(x)});
 var keys=Object.keys(groups).sort().reverse();
 if(!keys.length)e.append(h("div",{class:"mut",style:"margin-top:10px"},"Aucun ticket pour l’instant. L’historique par mois apparaîtra ici."));
 keys.forEach(function(k){
  var arr=groups[k].sort(function(a,b){return (b.date||"").localeCompare(a.date||"")});
  var tot=0;arr.forEach(function(x){tot+=x.montant||0});
  var box=h("div",{class:"mois"},h("div",{class:"tot"},h("b",{},monthLabel(k)),h("b",{},tot.toFixed(2)+" €")));
  if(bud)box.append(h("div",{class:"mut"},"Reste sur le budget : "+(bud-tot).toFixed(2)+" €"));
  arr.forEach(function(x){
   var see=x.fichier?h("button",{class:"btn ghost",onclick:function(){showFileModal(x.fichier)}},"📄 Voir le ticket"):h("span",{});
   var del=h("button",{class:"btn ghost","aria-label":"Retirer",onclick:function(){save(p.id,{depenses:dep.filter(function(y){return y.id!==x.id})})}},"✕");
   box.append(h("div",{class:"ligne"},h("span",{},x.date.split("-").reverse().join("/")+(x.magasin?" · "+x.magasin:"")),see,h("b",{},(x.montant||0).toFixed(2)+" €"),del));
  });
  e.append(box);
 });
 m.append(e);
}
document.getElementById("addBtn").addEventListener("click",function(){var i=document.getElementById("newName");var n=i.value.trim();if(!n)return;var id="p"+Date.now();people.push({id:id,name:n,createdAt:Date.now(),fiche:{},planning:{},courses:[]});sel=id;tab="fiche";view="people";i.value="";persist();render()});
document.getElementById("newName").addEventListener("keydown",function(e){if(e.key==="Enter")document.getElementById("addBtn").click()});
document.getElementById("exportBtn").addEventListener("click",function(){
 var blob=new Blob([JSON.stringify({people:people,recettes:recettes},null,1)],{type:"application/json"});
 var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="cuisine-christine-sauvegarde.json";document.body.append(a);a.click();a.remove()});
document.getElementById("importFile").addEventListener("change",function(e){
 var f=e.target.files[0];if(!f)return;var r=new FileReader();
 r.onload=function(){try{var d=JSON.parse(r.result);if(Array.isArray(d)){people=d}else if(d&&Array.isArray(d.people)){people=d.people;recettes=Array.isArray(d.recettes)?d.recettes:[]}else throw 0;sel=people.length?people[0].id:null;persist();persistR();render()}catch(x){alert("Ce fichier n’est pas une sauvegarde valide.")}};
 r.readAsText(f);e.target.value=""});
try{people=JSON.parse(localStorage.getItem(KEY)||"[]")}catch(e){people=[]}
try{recettes=JSON.parse(localStorage.getItem(RKEY)||"[]")}catch(e){recettes=[]}
loaded=true;sel=people.length?people[0].id:null;render();

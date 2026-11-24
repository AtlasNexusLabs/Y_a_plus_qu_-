var DAYS=[["lun","Lundi"],["mar","Mardi"],["mer","Mercredi"],["jeu","Jeudi"],["ven","Vendredi"],["sam","Samedi"],["dim","Dimanche"]];
var recettes=[],view="people",delRec=null,people=[],sel=null,tab="fiche",delAsk=false,loaded=false;
function h(tag,p){var e=document.createElement(tag);p=p||{};for(var k in p){var v=p[k];if(k==="class")e.className=v;else if(k==="value"||k==="checked")e[k]=v;else if(k.indexOf("on")===0)e.addEventListener(k.slice(2),v);else e.setAttribute(k,v)}
for(var i=2;i<arguments.length;i++){var c=arguments[i];if(c==null)continue;if(Array.isArray(c)){c.forEach(function(x){e.append(x.nodeType?x:document.createTextNode(x))})}else e.append(c.nodeType?c:document.createTextNode(c))}return e}
function cur(){return people.find(function(p){return p.id===sel})}
var KEY="cuisine-christine-v1";
function persist(){try{localStorage.setItem(KEY,JSON.stringify(people))}catch(e){alert("Enregistrement impossible sur cet appareil.")}}
function save(id,data){var p=people.find(function(x){return x.id===id});if(!p)return;for(var k in data){var v=data[k];if(v&&typeof v==="object"&&!Array.isArray(v))p[k]=Object.assign({},p[k]||{},v);else p[k]=v}persist();render()}
function render(){
 var pe=document.getElementById("people");pe.textContent="";
 pe.append(h("button",{class:"chip"+(view==="recettes"?" on":""),onclick:function(){view="recettes";render()}},"📖 Recettes"));
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
 m.append(h("h2",{},"Recettes"));
 var n=h("input",{placeholder:"Nom de la recette (ex. Blanquette de veau)"});
 var web=h("button",{class:"btn ghost",type:"button",onclick:function(){
  var q=n.value.trim();
  if(!q){alert("Écris d’abord le nom d’une recette.");return}
  window.open("https://www.google.com/search?q="+encodeURIComponent("recette "+q),"_blank","noopener");
 }},"🔍 Chercher sur Google");
 var ing=h("textarea",{placeholder:"Un ingrédient par ligne (ex. 4 pommes de terre)"});
 var st=h("textarea",{placeholder:"Les étapes (et les appareils utilisés si besoin : Cookeo, four…)"});
 var add=h("button",{class:"btn",onclick:function(){if(!n.value.trim())return;recettes.unshift({id:"r"+Date.now(),nom:n.value.trim(),ing:ing.value,etapes:st.value});persistR();render()}},"Ajouter la recette");
 m.append(h("div",{class:"card"},h("label",{},"Nouvelle recette"),h("div",{class:"rec-head"},n,web),h("label",{},"Ingrédients"),ing,h("label",{},"Étapes"),st,h("div",{style:"margin-top:10px"},add)));
 if(!recettes.length)m.append(h("div",{class:"mut"},"Aucune recette pour l’instant."));
 recettes.forEach(function(r){
  var nm=h("input",{value:r.nom,style:"font-weight:700"});
  nm.addEventListener("change",function(){r.nom=nm.value;persistR()});
  var gi=h("textarea",{value:r.ing||"",style:"min-height:90px"});
  gi.addEventListener("change",function(){r.ing=gi.value;persistR()});
  var ge=h("textarea",{value:r.etapes||"",style:"min-height:110px"});
  ge.addEventListener("change",function(){r.etapes=ge.value;persistR()});
  var card=h("div",{class:"card"},nm,h("label",{},"Ingrédients"),gi,h("label",{},"Étapes"),ge);
  var bar=h("div",{style:"display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;align-items:center"});
  if(people.length){
   var sl=h("select",{style:"padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--ink);font:inherit"});
   people.forEach(function(p){sl.append(h("option",{value:p.id},p.name))});
   var tc=h("button",{class:"btn",onclick:function(){
    var p=people.find(function(x){return x.id===sl.value});if(!p)return;
    var lines=(r.ing||"").split("\n").map(function(s){return s.trim()}).filter(Boolean);
    p.courses=(p.courses||[]).concat(lines.map(function(t){return {txt:t,fait:false}}));
    persist();tc.textContent="Ajouté ✓"}},"Ajouter aux courses de");
   bar.append(tc,sl);
  }
  var del=h("button",{class:"btn ghost",onclick:function(){
   if(delRec!==r.id){delRec=r.id;render();return}
   recettes=recettes.filter(function(x){return x.id!==r.id});delRec=null;persistR();render()}},delRec===r.id?"Confirmer la suppression ?":"Supprimer");
  bar.append(del);card.append(bar);m.append(card);
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
 var add=h("button",{class:"btn",onclick:function(){var v=parseFloat(ma.value);if(isNaN(v))return;dep.push({id:"d"+Date.now(),date:dd.value||today(),magasin:ms.value.trim(),montant:v});save(p.id,{depenses:dep})}},"Ajouter");
 e.append(h("label",{},"Nouveau ticket : la date, le magasin et le total suffisent"),h("div",{class:"dep"},dd,ms,ma,add));
 var groups={};dep.forEach(function(x){var k=(x.date||"").slice(0,7);(groups[k]=groups[k]||[]).push(x)});
 var keys=Object.keys(groups).sort().reverse();
 if(!keys.length)e.append(h("div",{class:"mut",style:"margin-top:10px"},"Aucun ticket pour l’instant. L’historique par mois apparaîtra ici."));
 keys.forEach(function(k){
  var arr=groups[k].sort(function(a,b){return (b.date||"").localeCompare(a.date||"")});
  var tot=0;arr.forEach(function(x){tot+=x.montant||0});
  var box=h("div",{class:"mois"},h("div",{class:"tot"},h("b",{},monthLabel(k)),h("b",{},tot.toFixed(2)+" €")));
  if(bud)box.append(h("div",{class:"mut"},"Reste sur le budget : "+(bud-tot).toFixed(2)+" €"));
  arr.forEach(function(x){
   var del=h("button",{class:"btn ghost","aria-label":"Retirer",onclick:function(){save(p.id,{depenses:dep.filter(function(y){return y.id!==x.id})})}},"✕");
   box.append(h("div",{class:"ligne"},h("span",{},x.date.split("-").reverse().join("/")+(x.magasin?" · "+x.magasin:"")),h("span",{},(x.montant||0).toFixed(2)+" €"),del));
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

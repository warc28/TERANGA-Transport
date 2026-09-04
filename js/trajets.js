let trajetEnModification = null;

function afficherTrajets(){
  const body=document.getElementById("trajetsBody"); if(!body)return;
  recalculerPlacesToutesLesTrajets();
  body.innerHTML=TT.trajets.length?TT.trajets.map(t=>{const c=trouverCar(t.carId); const plein=t.placesDisponibles===0; return `<tr>
    <td><strong>${escapeHTML(t.id)}</strong></td><td>${escapeHTML(t.villeDepart)}</td><td>${escapeHTML(t.villeArrivee)}</td><td>${t.date}</td><td>${t.heureDepart}</td>
    <td>${c?`${escapeHTML(c.id)} — ${escapeHTML(c.marque)} ${escapeHTML(c.modele)}`:"Car introuvable"}</td><td>${formatFCFA(t.prix)}</td>
    <td><span class="availability ${plein?"full":""}">${t.placesDisponibles} / ${c?c.placesTotal:0}</span>${plein?'<small class="error block">Complet</small>':''}</td>
    <td class="actions"><button class="btn btn-outline btn-small" onclick="modifierTrajet('${t.id}')">Modifier</button><button class="btn btn-danger btn-small" onclick="supprimerTrajet('${t.id}')">Supprimer</button></td>
  </tr>`}).join(""):`<tr><td colspan="9" class="empty">Aucun trajet.</td></tr>`;
}
function remplirCarsTrajet(){const s=document.getElementById("trajetCarId");if(!s)return;s.innerHTML=`<option value="">Choisir un car disponible</option>`+TT.cars.map(c=>`<option value="${c.id}" ${c.etat!=="Disponible"?"disabled":""}>${escapeHTML(c.id)} — ${escapeHTML(c.marque)} ${escapeHTML(c.modele)} — ${c.placesTotal} places${c.etat!=="Disponible"?" (${escapeHTML(c.etat)})":""}</option>`).join("");}
function actualiserApercuPlaces(){const s=document.getElementById("trajetCarId"), out=document.getElementById("placesPreview");if(!s||!out)return;const c=trouverCar(s.value);out.innerHTML=c?`<strong>${c.placesTotal}</strong> places totales. Les places disponibles seront calculées automatiquement selon les réservations confirmées.`:"Sélectionnez un car pour connaître sa capacité.";}
function resetFormTrajet(){document.getElementById("trajetForm")?.reset();trajetEnModification=null;document.getElementById("trajetSubmit").textContent="Ajouter le trajet";document.getElementById("trajetCancel").classList.add("hidden");document.getElementById("placesPreview").textContent="Sélectionnez un car pour connaître sa capacité.";}
function ajouterTrajet(){
  const id=document.getElementById("trajetId").value.trim().toUpperCase(), depart=document.getElementById("villeDepart").value.trim(), arrivee=document.getElementById("villeArrivee").value.trim(), date=document.getElementById("trajetDate").value, heure=document.getElementById("heureDepart").value, carId=document.getElementById("trajetCarId").value, prix=Number(document.getElementById("trajetPrix").value);
  if(!id||!depart||!arrivee||!date||!heure||!carId||!prix)return alert("Veuillez remplir tous les champs du trajet.");
  if(depart.toLowerCase()===arrivee.toLowerCase())return alert("La ville de départ et la destination doivent être différentes.");
  const car=trouverCar(carId); if(!car)return alert("Le car sélectionné n'existe pas."); if(car.etat!=="Disponible")return alert("Ce car n'est pas disponible.");
  if(!trajetEnModification&&TT.trajets.some(t=>t.id===id))return alert("Cet ID de trajet existe déjà.");
  const existing=trajetEnModification?trouverTrajet(trajetEnModification):null;
  if(existing){ if(existing.carId!==carId && TT.reservations.some(r=>r.trajetId===existing.id&&r.statut==="Confirmee")) return alert("Impossible de changer de car : le trajet possède déjà des réservations confirmées."); existing.id=id;existing.villeDepart=depart;existing.villeArrivee=arrivee;existing.date=date;existing.heureDepart=heure;existing.carId=carId;existing.prix=prix; }
  else TT.trajets.push({id,villeDepart:depart,villeArrivee:arrivee,date,heureDepart:heure,carId,prix,placesDisponibles:car.placesTotal});
  recalculerPlacesToutesLesTrajets(); afficherTrajets(); resetFormTrajet(); document.getElementById("trajetMessage").textContent="Trajet enregistré. Les places disponibles sont calculées automatiquement.";
}
function modifierTrajet(id){const t=trouverTrajet(id);if(!t)return;trajetEnModification=id;document.getElementById("trajetId").value=t.id;document.getElementById("villeDepart").value=t.villeDepart;document.getElementById("villeArrivee").value=t.villeArrivee;document.getElementById("trajetDate").value=t.date;document.getElementById("heureDepart").value=t.heureDepart;document.getElementById("trajetCarId").value=t.carId;document.getElementById("trajetPrix").value=t.prix;actualiserApercuPlaces();document.getElementById("trajetSubmit").textContent="Enregistrer les modifications";document.getElementById("trajetCancel").classList.remove("hidden");document.getElementById("trajetForm").scrollIntoView({behavior:"smooth"});}
function supprimerTrajet(id){if(TT.reservations.some(r=>r.trajetId===id&&r.statut==="Confirmee"))return alert("Impossible : ce trajet possède des réservations confirmées.");if(!confirm(`Supprimer le trajet ${id} ?`))return;TT.trajets=TT.trajets.filter(t=>t.id!==id);TT.reservations=TT.reservations.filter(r=>r.trajetId!==id);sauvegarderDonnees();afficherTrajets();}

document.addEventListener("DOMContentLoaded",async()=>{if(!document.getElementById("trajetsBody"))return;await initialiserDonnees();remplirCarsTrajet();actualiserApercuPlaces();afficherTrajets();document.getElementById("trajetCarId")?.addEventListener("change",actualiserApercuPlaces);document.getElementById("trajetForm")?.addEventListener("submit",e=>{e.preventDefault();ajouterTrajet();});document.getElementById("trajetCancel")?.addEventListener("click",resetFormTrajet);document.getElementById("resetData")?.addEventListener("click",reinitialiserDonneesXML);});

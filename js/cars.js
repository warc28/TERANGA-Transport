let carEnModification = null;

function afficherCars() {
  const body = document.getElementById("carsBody"); if (!body) return;
  body.innerHTML = TT.cars.length ? TT.cars.map(car => `
    <tr><td><strong>${escapeHTML(car.id)}</strong></td><td>${escapeHTML(car.marque)}</td><td>${escapeHTML(car.modele)}</td>
    <td>${car.placesTotal}</td><td>${etatBadge(car.etat)}</td>
    <td class="actions"><button class="btn btn-outline btn-small" onclick="modifierCar('${car.id}')">Modifier</button>
    <button class="btn btn-danger btn-small" onclick="supprimerCar('${car.id}')">Supprimer</button></td></tr>`).join("")
    : `<tr><td colspan="6" class="empty">Aucun car.</td></tr>`;
}
function remplirSelectCars() {
  const s = document.getElementById("trajetCarId"); if (!s) return;
  s.innerHTML = `<option value="">Choisir un car disponible</option>` + TT.cars.map(c => `<option value="${c.id}" ${c.etat !== "Disponible" ? "disabled" : ""}>${escapeHTML(c.id)} — ${escapeHTML(c.marque)} ${escapeHTML(c.modele)} — ${c.placesTotal} places${c.etat !== "Disponible" ? " (${escapeHTML(c.etat)})" : ""}</option>`).join("");
}
function resetCarForm() { document.getElementById("carForm")?.reset(); carEnModification=null; document.getElementById("carSubmit").textContent="Ajouter le car"; document.getElementById("carCancel").classList.add("hidden"); }
function ajouterCar() {
  const id=document.getElementById("carId").value.trim().toUpperCase(), marque=document.getElementById("carMarque").value.trim(), modele=document.getElementById("carModele").value.trim(), places=Number(document.getElementById("carPlaces").value), etat=document.getElementById("carEtat").value;
  if(!id||!marque||!modele||!places||!etat) return alert("Tous les champs sont obligatoires.");
  if(places<20||places>50) return alert("Les places doivent être entre 20 et 50.");
  if(!carEnModification && TT.cars.some(c=>c.id===id)) return alert("Cet ID existe déjà.");
  const old=carEnModification?trouverCar(carEnModification):null;
  if(old){ old.id=id; old.marque=marque; old.modele=modele; old.placesTotal=places; old.etat=etat; }
  else TT.cars.push({id,marque,modele,placesTotal:places,etat});
  recalculerPlacesToutesLesTrajets(); afficherCars(); remplirSelectCars(); resetCarForm();
  document.getElementById("carMessage").textContent="Données du car enregistrées et stockées localement.";
}
function modifierCar(id){ const c=trouverCar(id); if(!c)return; carEnModification=id; ["carId","carMarque","carModele","carPlaces","carEtat"].forEach((x,i)=>document.getElementById(x).value=[c.id,c.marque,c.modele,c.placesTotal,c.etat][i]); document.getElementById("carSubmit").textContent="Enregistrer les modifications"; document.getElementById("carCancel").classList.remove("hidden"); document.getElementById("carForm").scrollIntoView({behavior:"smooth"}); }
function supprimerCar(id){ if(TT.trajets.some(t=>t.carId===id)) return alert("Impossible : ce car est utilisé par un trajet."); if(!confirm(`Supprimer le car ${id} ?`))return; TT.cars=TT.cars.filter(c=>c.id!==id); sauvegarderDonnees(); afficherCars(); remplirSelectCars(); }

document.addEventListener("DOMContentLoaded", async()=>{ if(!document.getElementById("carsBody"))return; await initialiserDonnees(); afficherCars(); remplirSelectCars(); document.getElementById("carForm")?.addEventListener("submit",e=>{e.preventDefault();ajouterCar();}); document.getElementById("carCancel")?.addEventListener("click",resetCarForm); document.getElementById("resetData")?.addEventListener("click",reinitialiserDonneesXML); });

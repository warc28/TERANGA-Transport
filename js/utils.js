/* =========================================================
   TERANGA TRANSPORT - Données, XML, stockage local et utilitaires
   ========================================================= */
const TT = {
  cars: [],
  trajets: [],
  passagers: [],
  reservations: []
};

const STORAGE_KEY = "terangaTransportData_v2";

function chargerXML(url) {
  return new Promise((resolve, reject) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.overrideMimeType("application/xml");
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status === 0) {
          const xmlDoc = xhr.responseXML;
          if (!xmlDoc) return reject(new Error(`Impossible de lire ${url}.`));
          if (xmlDoc.querySelector("parsererror")) return reject(new Error(`XML invalide : ${url}`));
          resolve(xmlDoc);
        } else reject(new Error(`Impossible de charger ${url} (HTTP ${xhr.status}).`));
      };
      xhr.onerror = () => reject(new Error(`Erreur réseau lors du chargement de ${url}.`));
      xhr.send();
    } catch (error) { reject(error); }
  });
}

function valeurNoeud(parent, nom, defaut = "") {
  const node = parent.querySelector(nom);
  return node ? node.textContent.trim() : defaut;
}

function extraireCars(xmlDoc) {
  return [...xmlDoc.querySelectorAll("car")].map(n => ({
    id: valeurNoeud(n, "id"), marque: valeurNoeud(n, "marque"), modele: valeurNoeud(n, "modele"),
    placesTotal: Number(valeurNoeud(n, "placesTotal", "0")), etat: valeurNoeud(n, "etat")
  }));
}
function extraireTrajets(xmlDoc) {
  return [...xmlDoc.querySelectorAll("trajet")].map(n => ({
    id: valeurNoeud(n, "id"), villeDepart: valeurNoeud(n, "villeDepart"), villeArrivee: valeurNoeud(n, "villeArrivee"),
    date: valeurNoeud(n, "date"), heureDepart: valeurNoeud(n, "heureDepart"), carId: valeurNoeud(n, "carId"),
    prix: Number(valeurNoeud(n, "prix", "0")), placesDisponibles: Number(valeurNoeud(n, "placesDisponibles", "0"))
  }));
}
function extrairePassagers(xmlDoc) {
  return [...xmlDoc.querySelectorAll("passager")].map(n => ({
    id: valeurNoeud(n, "id"), nom: valeurNoeud(n, "nom"), prenom: valeurNoeud(n, "prenom"),
    telephone: valeurNoeud(n, "telephone"), email: valeurNoeud(n, "email"), pieceIdentite: valeurNoeud(n, "pieceIdentite")
  }));
}
function extraireReservations(xmlDoc) {
  return [...xmlDoc.querySelectorAll("reservation")].map(n => ({
    id: valeurNoeud(n, "id"), passagerId: valeurNoeud(n, "passagerId"), trajetId: valeurNoeud(n, "trajetId"),
    place: Number(valeurNoeud(n, "place", "0")), dateReservation: valeurNoeud(n, "dateReservation"),
    prix: Number(valeurNoeud(n, "prix", "0")), statut: valeurNoeud(n, "statut") || "Confirmee"
  }));
}

function chargerStockage() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!data) return false;
    TT.cars = Array.isArray(data.cars) ? data.cars : [];
    TT.trajets = Array.isArray(data.trajets) ? data.trajets : [];
    TT.passagers = Array.isArray(data.passagers) ? data.passagers : [];
    TT.reservations = Array.isArray(data.reservations) ? data.reservations : [];
    recalculerPlacesToutesLesTrajets(false);
    return true;
  } catch (e) { console.error(e); return false; }
}

function sauvegarderDonnees() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    cars: TT.cars, trajets: TT.trajets, passagers: TT.passagers, reservations: TT.reservations
  }));
}

async function initialiserDonnees() {
  if (chargerStockage()) return;
  const [cars, trajets, passagers, reservations] = await Promise.all([
    chargerXML("../xml/cars.xml").catch(() => null),
    chargerXML("../xml/trajets.xml").catch(() => null),
    chargerXML("../xml/passagers.xml").catch(() => null),
    chargerXML("../xml/reservations.xml").catch(() => null)
  ]);
  TT.cars = cars ? extraireCars(cars) : [];
  TT.trajets = trajets ? extraireTrajets(trajets) : [];
  TT.passagers = passagers ? extrairePassagers(passagers) : [];
  TT.reservations = reservations ? extraireReservations(reservations) : [];
  recalculerPlacesToutesLesTrajets(false);
  sauvegarderDonnees();
}

function reinitialiserDonneesXML() {
  if (!confirm("Réinitialiser toutes les données avec les fichiers XML ? Les modifications locales seront supprimées.")) return;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
}

function recalculerPlacesToutesLesTrajets(sauver = true) {
  TT.trajets.forEach(t => {
    const car = trouverCar(t.carId);
    if (!car) return;
    const reservees = TT.reservations.filter(r => r.trajetId === t.id && r.statut === "Confirmee").length;
    t.placesDisponibles = Math.max(0, car.placesTotal - reservees);
  });
  if (sauver) sauvegarderDonnees();
}

function mettreAJourPlacesDisponibles(trajetId) {
  const t = trouverTrajet(trajetId);
  if (!t) return 0;
  const car = trouverCar(t.carId);
  if (!car) return 0;
  const reservees = TT.reservations.filter(r => r.trajetId === trajetId && r.statut === "Confirmee").length;
  t.placesDisponibles = Math.max(0, car.placesTotal - reservees);
  sauvegarderDonnees();
  return t.placesDisponibles;
}

function trouverCar(id) { return TT.cars.find(c => c.id === id); }
function trouverTrajet(id) { return TT.trajets.find(t => t.id === id); }
function trouverPassager(id) { return TT.passagers.find(p => p.id === id); }
function trouverReservation(id) { return TT.reservations.find(r => r.id === id); }

function formatFCFA(n) { return `${Number(n || 0).toLocaleString("fr-FR")} FCFA`; }
function escapeHTML(v) { return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function statutBadge(statut) {
  return statut === "Confirmee"
    ? `<span class="badge badge-green">Confirmée</span>`
    : `<span class="badge badge-red">Annulée</span>`;
}
function etatBadge(etat) {
  const s = String(etat).toLowerCase();
  const cls = s === "disponible" ? "badge-green" : s.includes("révision") ? "badge-orange" : "badge-red";
  return `<span class="badge ${cls}">${escapeHTML(etat)}</span>`;
}
function afficherErreur(id, msg) { const e = document.getElementById(id); if (e) e.textContent = msg || ""; }
function aujourdHuiISO() { return new Date().toISOString().slice(0, 10); }

function initialiserMenuMobile() {
  const toggle = document.querySelector(".nav-toggle"), nav = document.querySelector(".main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => { const open = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", String(open)); });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
}
function activerLienNavigation() {
  const current = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach(a => { if (a.getAttribute("href").split("/").pop() === current) a.classList.add("active"); });
}

document.addEventListener("DOMContentLoaded", () => { initialiserMenuMobile(); activerLienNavigation(); });

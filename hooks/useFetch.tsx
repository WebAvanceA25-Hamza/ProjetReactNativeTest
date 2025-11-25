// src/composables/useFetch.ts
/*!!!! pourquoi je dois obligteoirement utilsier ngrok dans mon projet pour que mon appareil phsyique fonctionne 
🧠 1. Pourquoi ça marche sur l’émulateur mais pas en tunnel
✅ Cas de ton émulateur Android

Quand tu es en LAN (mode par défaut avec npx expo start) :

L’émulateur partage le réseau de ton PC.

Il peut donc atteindre ton backend local via :

const API_URL = "http://10.0.2.2:3001"; // ou http://192.168.x.x:3001


➡️ Résultat : tout fonctionne, normal 👍

❌ Cas de ton iPhone avec Expo en mode tunnel

Le tunnel Expo passe par les serveurs d’Expo (cloud).
Ton iPhone communique via Internet, pas directement sur ton réseau local.

👉 Donc, quand ton app React Native tente d’appeler :

fetch("http://192.168.x.x:3001/todos")


ton iPhone ne trouve rien, car il essaie d’atteindre ton PC à une IP locale non accessible depuis Internet.

En résumé :

Le tunnel Expo ne rend pas ton backend accessible — il ne sert qu’à charger le code JavaScript de ton app.

✅ 2. Solution : exposer ton backend via ngrok

C’est la seule solution simple et rapide pour que ton iPhone (en tunnel) puisse accéder à ton backend local.*/

import useLocalStorage from "./AsyncStorage";

// ⚠️ IMPORTANT : pour les appareils mobiles, remplace "localhost"
// par l'adresse IP locale de votre machine (ex: "http://192.168.1.50:3001/api")
//const BASE_URL = 'http://192.168.103.24:3001/api';on utilsie pour l'appeil physique mon iphone et vue que mon ordinateur a e parfeu pour lancer projet sur iphone je dosi faire npx expo start --tunnel
//const BASE_URL = 'http://10.0.2.2:3001/api'; on utilsiepour l'émulateur 
//on peut tuilsier ngrok donc il pourra accéder mais directement les firewall vont le blocker  ou le mettre sur un 
//Dans le menu Expo (npx expo start), choisis LAN au lieu de Tunnel.
/**
 * Hook générique pour gérer les requêtes HTTP avec Fetch et TypeScript
 */
///Probleme:Pouruqoi au début j'Ai pas pu accéder parce que mon firewall blaoque et mon api ecoute jsute sur le localhost pas tous les ports genre 0.0.0.0 ce qui blqouer
//Solution: soit utilsier nkgrok , soit le mettre sur un VPS accessible , soit ouvirer l'api pour qu'elle écoute sur tous les port -é-é-é-
const BASE_URL = 'http://10.0.2.2:4000/api';
const useFetch = () => {
  // Déclaration de handleResponse, visible dans tout useFetch
  async function handleResponse<T>(response: Response): Promise<T | undefined> {
    if (!response.ok) {
      switch (response.status) {
        case 500:
          throw new Error('Erreur serveur interne');
        case 404:
          return undefined;
        case 400:
          throw new Error("Le corps de la requête (payload) est invalide");
        default:
          throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        return (await response.json()) as T;
      } catch (err) {
        console.warn('Réponse vide ou JSON invalide :', err);
        return undefined;
      }
    }
    return undefined;
  }

  // GET avec headers optionnels
  async function GET<T>(url: string, headers?: Record<string, string>): Promise<T | undefined> {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        method: 'GET',
        headers: headers ?? {},
      });
      return handleResponse<T>(response);
    } catch (error) {
      console.error('Erreur GET:', error);
      throw error;
    }
  }

  // POST avec headers optionnels
  async function POST<T, R = T>(url: string, body: T, headers?: Record<string, string>): Promise<R | undefined> {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      return handleResponse<R>(response);
    } catch (error) {
      console.error('Erreur POST:', error);
      throw error;
    }
  }

  // PUT avec headers optionnels
  async function PUT<T, R = T>(url: string, body: T, headers?: Record<string, string>): Promise<R | undefined> {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      return handleResponse<R>(response);
    } catch (error) {
      console.error('Erreur PUT:', error);
      throw error;
    }
  }

  // PATCH avec headers optionnels
  async function PATCH<T>(url: string, body: T, headers?: Record<string, string>): Promise<void | undefined> {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('Erreur PATCH:', error);
      throw error;
    }
  }

  // DELETE avec headers optionnels
  async function DELETE(url: string, headers?: Record<string, string>): Promise<void> {
    try {
      const response = await fetch(`${BASE_URL}${url}`, {
        method: 'DELETE',
        headers: headers ?? {},
      });
      await handleResponse(response);
    } catch (error) {
      console.error('Erreur DELETE:', error);
      throw error;
    }
  }

  return { GET, POST, PUT, PATCH, DELETE };
};

export default useFetch;

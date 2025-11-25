
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

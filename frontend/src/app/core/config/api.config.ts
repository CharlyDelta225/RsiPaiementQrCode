/**
 * Adresse relative : l'API est servie sur la même origine que l'application.
 * En développement, `ng serve` relaie /api vers le backend (proxy.conf.json) ;
 * en production, le serveur web (ou le reverse proxy) fait de même.
 */
export const API_BASE_URL = '/api';

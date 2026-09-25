// frontend/config/keycloak.js
import Keycloak from "keycloak-js";

let keycloak = null;

// Inicializar Keycloak (solo una vez)
export const initKeycloak = () => {
  if (!keycloak) {
    keycloak = new Keycloak({
      url: "http://localhost:8080/",
      realm: "cine-realm",
      clientId: "cine-frontend",
    });
  }

  return keycloak.init({
    onLoad: "check-sso",
    checkLoginIframe: false,
    pkceMethod: "S256",
  });
};

// 🚀 Refrescar token (FUNCIONAL)
export const updateToken = async (minValidity = 5) => {
  if (!keycloak) return null;
  try {
    await keycloak.updateToken(minValidity);
    return keycloak.token;
  } catch (error) {
    console.error("❌ Error actualizando token, iniciando login");
    doLogin();
    return null;
  }
};

// Exportar funciones seguras
export const getKeycloak = () => keycloak;
export const getToken = () => keycloak?.token || null;
export const doLogin = () => keycloak?.login();
export const doLogout = () => keycloak?.logout({ redirectUri: window.location.origin });
export const isAuthenticated = () => !!keycloak?.authenticated;
export const getUsername = () => keycloak?.tokenParsed?.preferred_username || '';
export const hasRole = (role) =>
  keycloak?.tokenParsed?.realm_access?.roles?.includes(role) || false;

export default keycloak;

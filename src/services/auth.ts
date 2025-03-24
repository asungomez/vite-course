import axios from "axios";
import pkceChallenge from "pkce-challenge";
import qs from "qs";

const CODE_VERIFIER_KEY = "Vite-PKCE-code-verifier";
const AT_KEY = "Vite-access-token";
const ID_TOKEN_KEY = "Vite-id-token";

/**
 * Clears the stored login data from local storage
 */
export const clearLoginData = () => {
  localStorage.removeItem(CODE_VERIFIER_KEY);
  localStorage.removeItem(AT_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);
};

/**
 * Generate PKCE Challenge code and save PKCE verifier in local storage
 * @returns PKCE Challenge code
 */
export const generatePkceChallenge = async () => {
  const { code_challenge, code_verifier } = await pkceChallenge();
  localStorage.setItem(CODE_VERIFIER_KEY, code_verifier);
  return code_challenge;
};

/**
 * Retrieves credentials from Okta using the code received and the
 * PKCE challenge. Stores the credentials in the local storage to keep
 * them between sessions.
 * @param code Code received from Okta SSO login screen as a query parameter
 * @returns Access token
 */
export const getCredentialsFromCode = async (code: string): Promise<string> => {
  const codeVerifier = getPkceVerifier();
  const response = await axios({
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    data: qs.stringify({
      grant_type: "authorization_code",
      code,
      code_verifier: codeVerifier,
      client_id: import.meta.env.VITE_OKTA_CLIENT_ID,
      redirect_uri: import.meta.env.VITE_OKTA_LOGIN_REDIRECT,
    }),
    url: `${import.meta.env.VITE_OKTA_DOMAIN}/oauth2/default/v1/token`,
  });
  const {
    data: { access_token: accessToken, id_token: idToken },
  } = response;
  localStorage.setItem(AT_KEY, accessToken);
  localStorage.setItem(ID_TOKEN_KEY, idToken);
  localStorage.removeItem(CODE_VERIFIER_KEY);
  return accessToken;
};

/**
 * Retrieves the stored PKCE verifier from local storage
 * @returns PKCE Verifier
 */
export const getPkceVerifier = () => {
  return localStorage.getItem(CODE_VERIFIER_KEY);
};

/**
 * Retrieves the stored access token from local storage
 */
export const getStoredCrendentials = async (): Promise<string | null> => {
  const accessToken = localStorage.getItem(AT_KEY);
  if (!accessToken) {
    return null;
  }
  const data = {
    token_type_hint: "access_token",
    token: accessToken,
    client_id: import.meta.env.VITE_OKTA_CLIENT_ID,
  };
  const url = `${
    import.meta.env.VITE_OKTA_DOMAIN
  }/oauth2/default/v1/introspect`;
  try {
    const response = await axios({
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      data: new URLSearchParams(data).toString(),
      url,
    });
    if (!response?.data?.active) {
      return null;
    }
  } catch (error) {
    return null;
  }
  return accessToken;
};

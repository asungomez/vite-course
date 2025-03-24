import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import {
  clearLoginData,
  generatePkceChallenge,
  getCredentials,
} from "../../services/auth";
import { AuthContext, AuthStatus } from "./AuthContext";
import { useNavigate, useSearchParams } from "react-router";
import { Spinner } from "../../atoms/Spinner/Spinner";
import { MessagePage } from "../../features/MessagePage/MessagePage";
import { Alert } from "../../atoms/Alert/Alert";
import { Button } from "../../atoms/Button/Button";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  let navigate = useNavigate();

  useEffect(() => {
    if (authStatus == "loading") {
      if (code && state) {
        getCredentials(code)
          .then((accessToken) => {
            setAuthStatus("authenticated");
            setAccessToken(accessToken);
            navigate("/profiles");
          })
          .catch((error) => {
            clearLoginData();
            setAuthStatus("unauthenticated");
            setLoginError(error.message);
          });
      } else {
        // TODO check stored tokens
        setAuthStatus("unauthenticated");
      }
    }
  }, [code, state, authStatus]);

  const redirectToLogin = useCallback(async () => {
    const codeChallenge = await generatePkceChallenge();
    const oktaLoginUrl = `${
      import.meta.env.VITE_OKTA_DOMAIN
    }/oauth2/v1/authorize?response_type=code&client_id=${
      import.meta.env.VITE_OKTA_CLIENT_ID
    }&state=vitecourse&scope=openid&redirect_uri=${encodeURI(
      import.meta.env.VITE_OKTA_LOGIN_REDIRECT
    )}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
    window.location.href = oktaLoginUrl;
  }, []);

  if (code && state) {
    return (
      <MessagePage>
        <Spinner size={10} />
        <div>Loading...</div>
      </MessagePage>
    );
  }

  if (loginError) {
    return (
      <MessagePage direction="col">
        <Alert color="danger" title="Error logging in">
          {loginError}
        </Alert>
        <Button onClick={redirectToLogin}>Try again</Button>
      </MessagePage>
    );
  }

  return (
    <AuthContext.Provider
      value={{ redirectToLogin, accessToken, status: authStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
};

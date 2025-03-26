import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { getAuthenticatedUser } from "../../services/auth";
import { AuthContext, AuthStatus } from "./AuthContext";
import { Spinner } from "../../atoms/Spinner/Spinner";
import { MessagePage } from "../../features/MessagePage/MessagePage";
import { User } from "../../models/user";

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    if (authStatus == "loading") {
      getAuthenticatedUser()
        .then((user) => {
          setUser(user);
          setAuthStatus("authenticated");
        })
        .catch((error) => {
          console.error(error);
          setAuthStatus("unauthenticated");
        });
    }
  }, [authStatus]);

  const redirectToLogin = useCallback(async () => {
    const oktaLoginUrl = `${
      import.meta.env.VITE_OKTA_DOMAIN
    }/oauth2/default/v1/authorize?response_type=code&client_id=${
      import.meta.env.VITE_OKTA_CLIENT_ID
    }&state=vitecourse&scope=openid&redirect_uri=${encodeURI(
      import.meta.env.VITE_OKTA_LOGIN_REDIRECT
    )}`;
    window.location.href = oktaLoginUrl;
  }, []);

  if (authStatus == "loading") {
    return (
      <MessagePage>
        <Spinner size={10} />
        <div>Loading...</div>
      </MessagePage>
    );
  }

  return (
    <AuthContext.Provider value={{ redirectToLogin, user, status: authStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

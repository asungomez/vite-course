import { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { LogInPage } from "../pages/LogIn";
import { AuthProvider } from "../context/auth/AuthProvider";

export const Router: FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route index element={<LogInPage />} />
          <Route path="profiles">
            <Route index element={<div>Profiles</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

import { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { LogInPage } from "../pages/LogIn";

export const Router: FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<LogInPage />} />
      </Routes>
    </BrowserRouter>
  );
};

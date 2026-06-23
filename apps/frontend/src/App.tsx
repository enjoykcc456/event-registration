import { AppBar, Box, Container, Tab, Tabs, Toolbar } from "@mui/material";
import React from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import CreateEventPage from "./pages/admin/CreateEventPage";
import EventListPage from "./pages/admin/EventListPage";
import RegisterPage from "./pages/public/RegisterPage";

function NavBar(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = location.pathname.startsWith("/admin");
  const tab = isAdmin ? 0 : 1;

  return (
    <AppBar position="static">
      <Toolbar>
        <Tabs
          value={tab}
          onChange={(_, v) => navigate(v === 0 ? "/admin" : "/")}
          textColor="inherit"
          indicatorColor="secondary"
        >
          <Tab label="Admin" />
          <Tab label="Public" />
        </Tabs>
      </Toolbar>
    </AppBar>
  );
}

function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <NavBar />
        <Container maxWidth={false} sx={{ flex: 1, py: 2 }}>
          <Routes>
            <Route path="/" element={<RegisterPage />} />
            <Route path="/admin" element={<EventListPage />} />
            <Route path="/admin/create-event" element={<CreateEventPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </Box>
    </BrowserRouter>
  );
}

export default App;

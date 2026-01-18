import AppRoutes from "./routes";
import { AuthProvider } from "./auth/auth-provider";

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

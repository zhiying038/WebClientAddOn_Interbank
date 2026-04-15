import { Loader, SelectTheme } from "@/components";
import { UserProvider } from "@/contexts";
import { useAppStartup } from "@/hooks";
import { InterbankScreen } from "@/screens";

function App() {
  // ========== HOOKS
  const { isPending, user } = useAppStartup();

  // ========== VIEWS
  if (isPending) {
    return <Loader />;
  }

  return (
    <UserProvider value={{ user }}>
      {import.meta.env.DEV && <SelectTheme />}

      <div style={{ padding: "1rem" }}>
        <InterbankScreen />
      </div>
    </UserProvider>
  );
}

export default App;

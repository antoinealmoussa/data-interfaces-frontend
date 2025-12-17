import { Header } from "./components/layout/Header";
import { Sidebar } from "./components/layout/Sidebar";
import { RandomCard } from "./components/ui/RandomCard";
import Dashboard from "./components/ui/Dashboard"

export default function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header />

        {/* Corps de la page */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Dashboard prénom */}
          <Dashboard />
        </div>

        {/* Cartes aléatoires */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <RandomCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

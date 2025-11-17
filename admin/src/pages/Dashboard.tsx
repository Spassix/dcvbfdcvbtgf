import Layout from "../components/Layout";

export default function Dashboard() {
  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Produits</h2>
            <p className="text-3xl font-bold">-</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Commandes</h2>
            <p className="text-3xl font-bold">-</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Utilisateurs</h2>
            <p className="text-3xl font-bold">-</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}


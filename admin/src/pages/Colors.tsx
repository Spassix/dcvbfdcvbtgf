import Layout from "../components/Layout";

export default function Colors() {
  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold mb-6">Couleurs du thème</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Interface de configuration des couleurs à implémenter.</p>
        </div>
      </div>
    </Layout>
  );
}


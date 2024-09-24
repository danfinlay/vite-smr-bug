import Layout from "./Layout";
import HomePage from "@/components/HomePage";

import { addToCompartment, getRemoteModuleRecord } from './lib/sesities';
import './lib/lockdown.js';
console.dir({ addToCompartment, getRemoteModuleRecord });

function App() {
  return (
    <Layout>
      <HomePage />
    </Layout>
  );
}

export default App;

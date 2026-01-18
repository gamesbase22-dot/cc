import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
  const [status, setStatus] = useState("Carregando...");

  useEffect(() => {
    async function testarSupabase() {
      const { data, error } = await supabase
        .from("teste")
        .select("*")
        .limit(1);

      if (error) {
        console.error(error);
        setStatus("Erro ao conectar");
      } else {
        setStatus("Supabase conectado ✅");
      }
    }

    testarSupabase();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>{status}</h1>
    </div>
  );
}

import { useEffect, useState } from "react";
import { getPopular, searchMovies, posterUrl } from "../lib/tmdb";
import { Link } from "react-router-dom";

export default function Home() {
  const [q,setQ]=useState("");
  const [results,setResults]=useState<any[]>([]);

  useEffect(()=>{ (async()=>{
    if(q.length>1){ const d=await searchMovies(q); setResults(d.results||[]); }
    else { const d=await getPopular(); setResults(d.results||[]); }
  })(); },[q]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-3">Film Vault</h1>
      <input className="w-full border p-2 rounded mb-4" placeholder="Buscar películas…"
             value={q} onChange={e=>setQ(e.target.value)} />
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {results.map(m=>(
          <Link key={m.id} to={`#`} className="block">
            <img src={posterUrl(m.poster_path)} className="w-full rounded" />
            <div className="text-sm mt-1 line-clamp-2">{m.title}</div>
            <div className="text-xs text-gray-500">{(m.release_date||"").slice(0,4)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

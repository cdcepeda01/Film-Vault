// src/pages/Login.tsx
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { loginGoogle } = useAuth();
  const nav = useNavigate();

  const handleGoogle = async () => {
    try {
      await loginGoogle();
      nav("/explore");
    } catch (e) {
      alert("No se pudo iniciar sesión con Google.");
      console.error(e);
    }
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center px-4 bg-gradient-to-b from-black via-[#13000b] to-[#3b0000]">
      <div className="max-w-sm w-full bg-black/85 border border-red-800/60 rounded-2xl p-6 shadow-2xl text-white">
        <h1 className="text-2xl font-bold text-center mb-6 tracking-[0.2em] text-red-600">
          FILMVAULT
        </h1>

        <button
          onClick={handleGoogle}
          className="w-full bg-white text-black font-medium py-2.5 rounded-md flex items-center justify-center gap-2 hover:bg-gray-100 transition"
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.953,3.047l5.657-5.657C33.104,6.053,28.761,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,23.326,43.862,21.681,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,16.018,18.961,13,24,13c3.059,0,5.842,1.154,7.953,3.047 l5.657-5.657C33.104,6.053,28.761,4,24,4C16.318,4,9.745,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c4.697,0,8.964-1.794,12.207-4.727l-5.64-5.355C28.548,35.994,26.37,37,24,37 c-5.202,0-9.613-3.315-11.271-7.946l-6.544,5.04C9.59,39.556,16.259,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.793,2.237-2.231,4.166-4.096,5.589 c0.001-0.001,0.002-0.001,0.003-0.002l5.64,5.355C36.566,39.001,44,34,44,24C44,23.326,43.862,21.681,43.611,20.083z"
            />
          </svg>
          Entrar con Google
        </button>

        <p className="text-xs text-center mt-4 text-gray-400">
          Solo se permite autenticación con Google.
        </p>
      </div>
    </div>
  );
}

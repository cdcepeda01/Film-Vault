import { useNavigate } from "react-router-dom";

export default function FvJoinButton() {
  const nav = useNavigate();
  return (
    <button
      className="fv-hero__cta"
      onClick={() => nav("/signup")}
    >
      Únete a Film Vault
    </button>
  );
}
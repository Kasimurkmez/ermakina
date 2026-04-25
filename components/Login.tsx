import React, { useState } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';
import { UserIcon, ServerIcon } from './Icons';
import ermLogo from "../assets/ermlogo.png";
import fabrikaBg from "../assets/fabrika-bg.png";

const ADMIN_PASSWORD = "ksm20081605";

interface LoginProps {
  onLoginSuccess: (role: "admin" | "guest") => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"guest" | "admin">("guest");
  const [password, setPassword] = useState("");

  const handleLogin = async (role: "admin" | "guest") => {
    setError(null);
    setLoading(true);
    try {
      if (role === "admin" && password !== ADMIN_PASSWORD) {
        throw new Error("YETKİSİZ ERİŞİM KODU");
      }
      await signInAnonymously(auth);
      sessionStorage.setItem("userRole", role);
      onLoginSuccess(role);
    } catch (err: any) {
      setError(err.message || "BAĞLANTI HATASI");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative bg-[#070b10] overflow-hidden">
      {/* ARKA PLAN AYARLARI: Karartma Artırıldı */}
      <div className="absolute inset-0 z-0 scale-105">
        <img
          src={fabrikaBg}
          className="w-full h-full object-cover opacity-20 blur-[1px]" // Opacity %35'ten %20'ye çekildi
          alt="Er Makina Tesisleri"
        />
        {/* Karartma Katmanı: Siyah yoğunluğu artırıldı */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/70" />
      </div>

      <div className="relative z-10 w-full max-w-[460px] animate-fade-in">
        {/* ANA GİRİŞ PANELİ: Backdrop blur artırılarak cam efekti güçlendirildi */}
        <div className="bg-[#111827]/95 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_32px_80px_-15px_rgba(0,0,0,0.8)] p-10">
          {/* KURUMSAL LOGO */}
          <div className="flex flex-col items-center mb-12">
            <div className="bg-white rounded-[1.5rem] p-5 mb-6 shadow-[0_0_30px_rgba(255,255,255,0.15)] border border-white/20 transition-transform duration-500 hover:scale-105">
              <img
                src={ermLogo}
                alt="Er Makina"
                className="h-14 md:h-16 w-auto object-contain" // Logo yüksekliği h-9'dan h-16'ya çıkarıldı
              />
            </div>

            <div className="flex flex-col items-center gap-1">
              <h1 className="text-white text-2xl font-black tracking-[0.4em] uppercase leading-none">
                ER MAKİNA
              </h1>
              <p className="text-[#51b3a1] text-[10px] font-bold tracking-[0.6em] uppercase opacity-80">
                FİKSTÜR TAKİP
              </p>
            </div>
          </div>

          {/* SEKMELER */}
          <div className="flex bg-black/40 p-1.5 rounded-2xl mb-10 border border-white/5 shadow-inner">
            <button
              onClick={() => {
                setActiveTab("guest");
                setError(null);
              }}
              className={`flex-1 py-3.5 text-xs font-black tracking-widest rounded-xl transition-all duration-500 uppercase ${
                activeTab === "guest"
                  ? "bg-[#2d3a4b] text-white shadow-lg border border-white/5"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Misafir Girişi
            </button>
            <button
              onClick={() => {
                setActiveTab("admin");
                setError(null);
              }}
              className={`flex-1 py-3.5 text-xs font-black tracking-widest rounded-xl transition-all duration-500 uppercase ${
                activeTab === "admin"
                  ? "bg-[#51b3a1] text-white shadow-[0_0_25px_rgba(81,179,161,0.4)]"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Admin Girişi
            </button>
          </div>

          {/* FORM ALANI */}
          <div className="space-y-8 text-center min-h-[190px] flex flex-col justify-center">
            <p className="text-gray-400 text-[11px] font-bold tracking-widest uppercase opacity-70">
              {activeTab === "guest"
                ? "Sınırlı Erişim Yetkisi"
                : "Tam Yetkili Yönetici Erişimi"}
            </p>

            {activeTab === "admin" && (
              <div className="relative group animate-fade-in">
                <input
                  type="password"
                  placeholder="YÖNETİCİ ŞİFRESİ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-gray-700 focus:border-[#51b3a1]/50 outline-none transition-all text-xs font-black tracking-[0.4em] text-center shadow-inner"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin("admin")}
                />
              </div>
            )}

            <button
              onClick={() => handleLogin(activeTab)}
              disabled={loading}
              className="w-full py-5 bg-[#51b3a1] hover:bg-[#45a191] text-white font-black text-xs tracking-[0.2em] rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl shadow-[#51b3a1]/20 uppercase"
            >
              {activeTab === "admin" ? (
                <ServerIcon className="w-4 h-4" />
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
              {loading
                ? "DOĞRULANIYOR..."
                : activeTab === "admin"
                ? "Yönetici Girişi Yap"
                : "Misafir Olarak Devam Et"}
            </button>
          </div>

          {/* HATA BİLDİRİMİ */}
          {error && (
            <div className="mt-8 text-red-500 text-[9px] font-black tracking-[0.3em] text-center animate-pulse uppercase">
              {error}
            </div>
          )}
        </div>

        {/* ALT KURUMSAL BİLGİ */}
        <div className="mt-12 flex flex-col items-center gap-3 opacity-30">
          <div className="h-[1px] w-12 bg-[#51b3a1]/50"></div>
          <p className="text-white text-[9px] font-black tracking-[0.5em] uppercase">
            ER MAKİNA SANAYİ A.Ş.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
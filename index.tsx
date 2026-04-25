import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// --- ACIL DURUM KODU: ESKI SÜRÜMLERİ TEMIZLE ---
// Bu kod tarayıcıdaki eski önbellek bekçilerini (Service Worker) bulur ve yok eder.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(function() {
        console.log('Eski Service Worker başarıyla silindi.');
      });
    }
    
    // Eğer daha önce temizlik yapmadıysak, sayfayı zorla yenile ve temizle
    // Bu sayede kullanıcılar F5 yapmasa bile yeni sürümü görür.
    if (!sessionStorage.getItem('force_refresh_done')) {
        console.log('Yeni sürüm icin sayfa yenileniyor...');
        sessionStorage.setItem('force_refresh_done', 'true');
        window.location.reload();
    }
  });
}
// -----------------------------------------------
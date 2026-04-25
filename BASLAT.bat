@echo off
color 0B
title ER MAKINA - OTOMATIK YEDEKLEME VE BASLATMA

echo ========================================================
echo [1/3] VERILER YEREL SUNUCUYA YEDEKLENIYOR...
echo ========================================================
:: Önce yedekleme scriptini çalıştırıyoruz
node yedekle.cjs
timeout /t 2 >nul

echo.
echo ========================================================
echo [2/3] ESKI OTURUMLAR TEMIZLENIYOR...
echo ========================================================
:: Çalışan eski node süreçlerini kapatır
taskkill /F /IM node.exe >nul 2>&1
timeout /t 1 >nul

echo.
echo ========================================================
echo [3/3] SISTEM YAYINA ALINIYOR...
echo Lutfen bu pencereyi KAPATMAYIN (Simge durumuna kucultebilirsiniz).
echo ========================================================
:: Sistemi yayına alan asıl komut
npx serve -s dist -l 8080
pause
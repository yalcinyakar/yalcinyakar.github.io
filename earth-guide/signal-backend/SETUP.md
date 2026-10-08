# Signal Wall kurulumu

Site: https://yalcinyakar.github.io/earth-guide/#transmission

## Bir kez yapılacak Google kurulumu
1. Hazırlanan **Earth Guide — Signal Wall Inbox** Google tablosunu aç (veya boş bir Google Sheet oluştur). Paylaşımını **Kısıtlı** bırak; tabloyu internete yayımlama.
2. Uzantılar → Apps Script ekranını aç.
3. Code.gs dosyasına bu klasördeki Code.gs içeriğini yapıştır, kaydet.
4. initializeInbox fonksiyonunu hesabında çalıştır ve yalnızca bu script için gereken Google iznini ver. Signals tablosu ve approved sütunu hazırlanır.
5. Dağıt → Yeni dağıtım → Web uygulaması: çalıştıran **Ben**, erişim **Herkes** (Google hesabı istemeyen seçenek). Kurumsal hesabın bu seçeneği engelliyorsa kişisel hesabını kullan. /dev test adresi herkese açık değildir.
6. /exec ile biten dağıtım adresini kopyala. guide.js içindeki SIGNAL_ENDPOINT değerine bağlanması için bu adresi paylaşabilirsin; e-posta veya şifre paylaşman gerekmez.
7. İlk gönderimi ve siteye dönüş makbuzunu kontrol et. Signals tablosunda yeni satır görünmeli; approved işaretlenmedikçe siteye çıkmamalı.
8. Test mesajını onaylayıp sitede Refresh signals ile görünmesini doğrula. Gönderim testinden sonra test satırını silebilirsin.

## Yönetim
- Gelen bütün mesajlar özel Signals tablosuna düşer.
- F sütunundaki approved kutusunu işaretlemek mesajı herkese açık yapar. İşareti kaldırmak sonraki yenilemede gizler.
- Son 100 onaylı mesaj listelenir; tabloda eskiler kalır.
- Site mesajları HTML olarak işlemez; metin olarak gösterir.
- Script sadece onaylı mesajları herkese açık sunar. Bekleyen mesajları, requestId'leri veya tablo kimliğini API yanıtına koymaz.
- E-posta, IP adresi veya giriş bilgisi istemez. Google'ın kendi servis kayıtları/koşulları ayrıca geçerlidir.
- Basit honeypot, toplam 200 mesaj/gün limiti ve insan onayı kullanılır. Bunlar güçlü otomatik spam filtrelemesinin yerini tutmaz.
- Backend kodu değişince Apps Script dağıtımını yeni sürüme güncelle.
- Sahip bağlantısı yapılana kadar site gönderimi kapalı tutar. Yerel testler Google dağıtımını ve gerçek tarayıcı makbuzunu doğrulamaz.

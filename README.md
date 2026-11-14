# Okyanus Teması (ocean-theme)

Claude Code masaüstü uygulaması için sakin, canlı bir sualtı teması. Sohbetin arkasına animasyonlu bir okyanus sahnesi çizer: yukarıdan süzülen ışık huzmeleri, kenarlarda yüzen sevimli deniz canlıları ve dipte kumsal.

*A calm, animated underwater backdrop mod for the Claude Code desktop app: light rays, original cute sea creatures along the edges, and a sandy seabed. Dark and light scenes, with motion you can reduce or turn off.*

## Neler var

- **İki sahne:** koyu (derin okyanus laciverti) ve açık (turkuaz-kum)
- **Renkler:** mercan turuncusu-pembesi vurgu, deniz yeşili / turkuaz ikincil renk
- **Canlılar** (hepsi orijinal SVG çizimler):
  - yunus sürüsü, ara sıra kavis çizerek zıplıyor
  - yüzgeçlerini çırparak süzülen kaplumbağalar
  - salınan, kuyruğunu kıvıran deniz atları
  - nabız gibi kasılıp açılan, parlayan denizanaları
  - küçük balık sürüleri, yükselen kabarcıklar
  - kumda dönen deniz yıldızları ve sallanan deniz yosunları
- Canlılar farklı zamanlarda ve farklı hızlarda geçer; kenarlarda ve arka planda kalır, sohbet metni buzlu camın arkasında okunaklı kalır.
- Yalnızca CSS ve SVG animasyonu kullanır.

## Kurulum

Terminal oturumunda:

```
/plugin install okyanus-tema --marketplace elifabanoz/ocean-theme
```

Komut satırından:

```
claude plugin install okyanus-tema --marketplace elifabanoz/ocean-theme
```

Masaüstü uygulamasında `/plugin` çalışmıyorsa: mesaj kutusunun yanındaki **+** düğmesine tıklayın, **Plugins**'i seçin, **Add marketplace** ile `elifabanoz/ocean-theme` ekleyin, ardından **Add plugin**.

Arka planın çizilmesi için Claude Code masaüstü uygulamasının güncel bir sürümü ve **Code** sekmesinde yerel bir oturum gerekir.

## Kullanım

| Komut | Ne yapar |
| --- | --- |
| `/okyanus` | Düğmeli ayar panelini açar |
| `/okyanus koyu` | Derin lacivert sahne |
| `/okyanus acik` | Açık turkuaz-kum sahne |
| `/okyanus tam` | Animasyonlar tam |
| `/okyanus azalt` | Daha yavaş ve daha az hareket |
| `/okyanus durgun` | Animasyonları kapatır, sahne kalır |
| `/okyanus kapat` / `/okyanus ac` | Temayı kaldırır / geri getirir |
| `/okyanus tani` | Temanın çizilip çizilmediğini gösterir |

Ayarlar oturumlar arasında hatırlanır. En iyi kontrast için uygulamanın kendi görünümünü de seçtiğiniz sahneyle aynı moda (koyu/açık) alın.

## Lisans

MIT

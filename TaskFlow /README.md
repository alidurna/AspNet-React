# TaskFlow

TaskFlow, görev yönetimi için geliştirilmiş modern bir fullstack web uygulamasıdır. React frontend ve C# (.NET) backend ile geliştirilmiştir. Kullanıcılar görevlerini kolaylıkla oluşturabilir, düzenleyebilir, kategorize edebilir ve takip edebilir.

## Özellikler

- Kullanıcı hesabı oluşturma ve kimlik doğrulama
- Görev oluşturma, düzenleme ve silme
- Görevleri kategorilere ayırma
- Görevlere öncelik atama
- Bitiş tarihi belirleme
- Görevlerin tamamlanma durumunu takip etme
- Görevleri filtreleme ve sıralama
- Karanlık/Aydınlık tema desteği
- Tam responsive tasarım
- Offline çalışabilme özelliği (PWA)

## Teknolojiler

### Frontend

- React 18
- TypeScript
- Vite
- TanStack Query (React Query)
- Redux Toolkit / Context API
- React Router v6
- Tailwind CSS
- Shadcn UI
- Framer Motion (Animasyonlar)
- React Hook Form + Zod (Form Validasyonu)

### Backend

- ASP.NET Core 8
- C# 12
- Entity Framework Core
- SQL Server
- Identity Framework (Kimlik Doğrulama)
- SignalR (Gerçek zamanlı iletişim)
- AutoMapper
- MediatR (CQRS deseni)
- Fluent Validation

### DevOps & Araçlar

- Docker
- Jest & React Testing Library
- xUnit & NUnit (Backend testleri)
- ESLint & Prettier
- GitHub Actions (CI/CD)
- Azure DevOps / GitHub Pages
- Swagger / OpenAPI

## Kurulum

### Backend

1. Visual Studio 2022 veya Visual Studio Code ile backend projesini açın
2. SQL Server veritabanını kurun ve bağlantı dizesini `appsettings.json` dosyasında yapılandırın
3. Migration'ları uygulayın:
   ```
   dotnet ef database update
   ```
4. API'yi çalıştırın:
   ```
   dotnet run
   ```
5. API http://localhost:5000 adresinde çalışacaktır

### Frontend

1. Proje dizinine gidin:
   ```
   cd TaskFlow/ClientApp
   ```
2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```
3. Geliştirme sunucusunu başlatın:
   ```
   npm run dev
   ```
4. Tarayıcınızda şu adrese gidin: `http://localhost:5173`

## Proje Yapısı

```
TaskFlow/
├── ClientApp/                  # React frontend uygulaması
│   ├── src/
│   │   ├── assets/            # Statik dosyalar
│   │   ├── components/        # UI bileşenleri
│   │   ├── hooks/             # Özel React hooks
│   │   ├── pages/             # Sayfa bileşenleri
│   │   ├── services/          # API servisleri
│   │   ├── store/             # State yönetimi
│   │   └── App.tsx            # Ana uygulama bileşeni
│   └── package.json
├── TaskFlow.API/              # ASP.NET Core Web API
│   ├── Controllers/           # API Controller'ları
│   ├── Models/                # Veri modelleri
│   ├── Services/              # İş mantığı servisleri
│   ├── Repositories/          # Veri erişim katmanı
│   ├── Migrations/            # EF Core migrationları
│   └── Program.cs             # Uygulama başlangıç noktası
├── TaskFlow.Core/             # Çekirdek sınıflar ve arayüzler
├── TaskFlow.Data/             # Veritabanı erişim katmanı
├── TaskFlow.Tests/            # Birim ve entegrasyon testleri
└── TaskFlow.sln               # Solution dosyası
```

## Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.


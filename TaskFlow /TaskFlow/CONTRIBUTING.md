# 🤝 Katkıda Bulunma Rehberi

TaskFlow projesine katkıda bulunmak istediğiniz için teşekkürler! Bu rehber, projeye nasıl katkıda bulunabileceğinizi açıklar.

## 📋 İçindekiler

- [Başlarken](#başlarken)
- [Geliştirme Ortamı](#geliştirme-ortamı)
- [Kod Yazma Kuralları](#kod-yazma-kuralları)
- [Commit Mesajları](#commit-mesajları)
- [Pull Request Süreci](#pull-request-süreci)
- [Test Yazma](#test-yazma)
- [Dokümantasyon](#dokümantasyon)
- [İletişim](#iletişim)

## 🚀 Başlarken

### 1. Repository'yi Fork Edin
```bash
# GitHub'da TaskFlow repository'sini fork edin
# Sonra local'e clone edin
git clone https://github.com/YOUR_USERNAME/TaskFlow.git
cd TaskFlow
```

### 2. Upstream Remote'u Ekleyin
```bash
git remote add upstream https://github.com/ORIGINAL_OWNER/TaskFlow.git
```

### 3. Development Branch Oluşturun
```bash
git checkout -b feature/your-feature-name
# veya
git checkout -b fix/your-bug-fix
```

## 🛠️ Geliştirme Ortamı

### Gereksinimler

#### Backend (.NET)
- **.NET 8 SDK** (en son sürüm)
- **Visual Studio 2022** veya **VS Code**
- **PostgreSQL** (14+)
- **Redis** (opsiyonel, caching için)

#### Frontend (React)
- **Node.js** (18+)
- **npm** veya **yarn**
- **Modern browser** (Chrome, Firefox, Safari, Edge)

### Kurulum

#### 1. Backend Kurulumu
```bash
cd TaskFlow.API
dotnet restore
dotnet ef database update
dotnet run
```

#### 2. Frontend Kurulumu
```bash
cd TaskFlow.Frontend
npm install
npm run dev
```

#### 3. Test Kurulumu
```bash
# Backend tests
cd TaskFlow.API
dotnet test

# Frontend tests
cd TaskFlow.Frontend
npm run test
```

## 📝 Kod Yazma Kuralları

### 1. **C# (Backend) Kuralları**

#### Naming Conventions
```csharp
// ✅ Doğru
public class UserService : IUserService
public async Task<UserDto> GetUserByIdAsync(int id)
private readonly ILogger<UserService> _logger;

// ❌ Yanlış
public class userService : IuserService
public async Task<UserDto> getUserById(int id)
private readonly ILogger<UserService> logger;
```

#### Code Style
```csharp
// ✅ Doğru - Comprehensive documentation
/// <summary>
/// Kullanıcıyı ID'ye göre getirir
/// </summary>
/// <param name="id">Kullanıcı ID'si</param>
/// <returns>Kullanıcı bilgileri</returns>
public async Task<UserDto> GetUserByIdAsync(int id)
{
    // Implementation
}

// ✅ Doğru - Error handling
try
{
    var user = await _context.Users.FindAsync(id);
    if (user == null)
        throw new NotFoundException($"User with ID {id} not found");
    
    return _mapper.Map<UserDto>(user);
}
catch (Exception ex)
{
    _logger.LogError(ex, "Error getting user with ID: {UserId}", id);
    throw;
}
```

### 2. **TypeScript/React (Frontend) Kuralları**

#### Naming Conventions
```typescript
// ✅ Doğru
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
}

const UserProfileComponent: React.FC<UserProfileProps> = ({ user }) => {
  // Implementation
};

// ❌ Yanlış
interface userProfile {
  id: string;
  first_name: string;
  last_name: string;
}

const userProfileComponent = ({ user }) => {
  // Implementation
};
```

#### Component Structure
```typescript
// ✅ Doğru - Comprehensive documentation
/**
 * UserProfile Component
 * 
 * Kullanıcı profil bilgilerini gösterir ve düzenleme imkanı sağlar.
 * 
 * @param user - Kullanıcı bilgileri
 * @param onUpdate - Profil güncelleme callback'i
 * @returns JSX Element
 */
export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdate }) => {
  // State management
  const [isEditing, setIsEditing] = useState(false);
  
  // Event handlers
  const handleSave = useCallback(async (data: UpdateProfileData) => {
    try {
      await onUpdate(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
    }
  }, [onUpdate]);

  // Render
  return (
    <div className="user-profile">
      {/* Component content */}
    </div>
  );
};
```

### 3. **Genel Kurallar**

#### Dosya Organizasyonu
```
TaskFlow.API/
├── Controllers/          # API controllers
├── Services/            # Business logic
├── Models/              # Entity models
├── DTOs/                # Data transfer objects
├── Interfaces/          # Service interfaces
├── Extensions/          # Extension methods
└── Middleware/          # Custom middleware

TaskFlow.Frontend/
├── components/          # React components
├── pages/              # Page components
├── hooks/              # Custom hooks
├── services/           # API services
├── types/              # TypeScript types
├── utils/              # Utility functions
└── contexts/           # React contexts
```

#### Import Sıralaması
```typescript
// 1. React imports
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// 3. Internal imports
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import type { User } from '../../types/auth.types';
```

## 💬 Commit Mesajları

### Conventional Commits Standardı

```bash
# Format
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Tipleri

```bash
# ✅ Yeni özellik
feat: add biyometrik giriş desteği

# ✅ Bug düzeltmesi
fix: resolve password validation issue

# ✅ Dokümantasyon
docs: update API documentation

# ✅ Stil değişiklikleri
style: improve button hover effects

# ✅ Refactoring
refactor: optimize user service performance

# ✅ Test
test: add unit tests for auth service

# ✅ Build/deployment
chore: update dependencies
```

### Örnekler

```bash
# ✅ İyi commit mesajları
feat(auth): implement WebAuthn biometric login
fix(ui): resolve mobile responsive issues
docs(api): add authentication endpoint documentation
refactor(services): optimize database queries
test(frontend): add component unit tests

# ❌ Kötü commit mesajları
fix bug
update
changes
wip
```

## 🔄 Pull Request Süreci

### 1. **Branch Oluşturma**
```bash
# Ana branch'ten güncel kodu alın
git checkout main
git pull upstream main

# Feature branch oluşturun
git checkout -b feature/your-feature-name
```

### 2. **Geliştirme**
- Kodunuzu yazın
- Testleri çalıştırın
- Linting kontrolü yapın
- Dokümantasyonu güncelleyin

### 3. **Commit ve Push**
```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 4. **Pull Request Oluşturma**
- GitHub'da PR oluşturun
- Template'i doldurun
- Reviewers ekleyin
- Labels ekleyin

### 5. **PR Template**
```markdown
## 📋 Açıklama
Bu PR ne yapıyor?

## 🎯 Değişiklik Türü
- [ ] Bug fix
- [ ] Yeni özellik
- [ ] Breaking change
- [ ] Dokümantasyon güncellemesi

## 🧪 Testler
- [ ] Unit tests eklendi/güncellendi
- [ ] Integration tests eklendi/güncellendi
- [ ] Manual testing yapıldı

## 📸 Screenshots (UI değişiklikleri için)
[Varsa ekran görüntüleri]

## ✅ Checklist
- [ ] Kod review standartlarına uygun
- [ ] Testler geçiyor
- [ ] Linting hataları yok
- [ ] Dokümantasyon güncellendi
- [ ] Breaking changes varsa migration guide eklendi
```

## 🧪 Test Yazma

### Backend Tests
```csharp
[TestClass]
public class UserServiceTests
{
    [TestMethod]
    public async Task GetUserByIdAsync_ValidId_ReturnsUser()
    {
        // Arrange
        var userId = 1;
        var expectedUser = new User { Id = userId, Email = "test@example.com" };
        
        // Act
        var result = await _userService.GetUserByIdAsync(userId);
        
        // Assert
        Assert.IsNotNull(result);
        Assert.AreEqual(expectedUser.Email, result.Email);
    }
}
```

### Frontend Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from '../UserProfile';

describe('UserProfile', () => {
  it('should display user information correctly', () => {
    const user = { firstName: 'John', lastName: 'Doe' };
    
    render(<UserProfile user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## 📚 Dokümantasyon

### Kod Dokümantasyonu
```csharp
/// <summary>
/// Kullanıcı kimlik doğrulama servisi
/// JWT token yönetimi ve kullanıcı giriş işlemlerini yönetir
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Kullanıcı giriş işlemi
    /// </summary>
    /// <param name="loginDto">Giriş bilgileri</param>
    /// <returns>Kimlik doğrulama sonucu</returns>
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
}
```

### API Dokümantasyonu
```csharp
/// <summary>
/// Kullanıcı giriş endpoint'i
/// </summary>
/// <param name="loginDto">Giriş bilgileri</param>
/// <returns>Kimlik doğrulama sonucu</returns>
/// <response code="200">Başarılı giriş</response>
/// <response code="400">Geçersiz bilgiler</response>
/// <response code="401">Kimlik doğrulama başarısız</response>
[HttpPost("login")]
[ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), 200)]
[ProducesResponseType(typeof(ApiResponse<object>), 400)]
[ProducesResponseType(typeof(ApiResponse<object>), 401)]
public async Task<ActionResult<ApiResponse<AuthResponseDto>>> Login([FromBody] LoginDto loginDto)
```

## 🐛 Bug Raporlama

### Bug Report Template
```markdown
## 🐛 Bug Açıklaması
[Kısa ve net açıklama]

## 🔄 Yeniden Üretme Adımları
1. [Adım 1]
2. [Adım 2]
3. [Adım 3]

## 📱 Beklenen Davranış
[Ne olması gerekiyordu]

## ❌ Gerçekleşen Davranış
[Ne oldu]

## 📸 Screenshots
[Varsa ekran görüntüleri]

## 🔧 Ortam Bilgileri
- **OS**: [Windows/Mac/Linux]
- **Browser**: [Chrome/Firefox/Safari/Edge]
- **Version**: [Versiyon numarası]

## 📋 Ek Bilgiler
[Varsa ek bilgiler]
```

## 💡 Özellik İstekleri

### Feature Request Template
```markdown
## 💡 Özellik İsteği
[Özelliğin açıklaması]

## 🎯 Problem
[Bu özellik hangi problemi çözüyor?]

## 💭 Önerilen Çözüm
[Nasıl implement edilebilir?]

## 🔄 Alternatifler
[Varsa alternatif çözümler]

## 📋 Ek Bilgiler
[Varsa ek bilgiler]
```

## 🤝 İletişim

### Geliştirici Ekibi
- **Proje Yöneticisi**: [İsim] - [Email]
- **Backend Lead**: [İsim] - [Email]
- **Frontend Lead**: [İsim] - [Email]

### İletişim Kanalları
- **GitHub Issues**: Bug raporları ve özellik istekleri
- **GitHub Discussions**: Genel tartışmalar
- **Email**: [Proje email adresi]

### Topluluk Kuralları
- Saygılı olun
- Yapıcı geri bildirim verin
- Yardımsever olun
- Profesyonel davranın

## 📄 Lisans

Bu proje [MIT License](LICENSE) altında lisanslanmıştır. Katkıda bulunarak, kodunuzun da aynı lisans altında yayınlanacağını kabul etmiş olursunuz.

---

**Son Güncelleme**: 2024-12-19  
**Versiyon**: 1.0.0  
**Durum**: ✅ Aktif 
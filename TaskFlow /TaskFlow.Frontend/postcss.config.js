/**
 * PostCSS Konfigürasyon Dosyası - TaskFlow Frontend
 *
 * PostCSS, CSS'i JavaScript plugin'leri ile transform etmek için kullanılan bir tool'dur.
 * Bu dosya, CSS işleme pipeline'ında hangi plugin'lerin kullanılacağını belirtir.
 *
 * Tailwind CSS v3 için güncellenmiş konfigürasyon
 *
 * Kullanılan Plugin'ler:
 * - Tailwind CSS: Utility-first CSS framework
 * - Autoprefixer: Vendor prefix'leri otomatik ekler
 *
 * Plugin Sırası Önemli:
 * 1. Önce Tailwind CSS çalışır (utility class'ları generate eder)
 * 2. Sonra Autoprefixer çalışır (browser compatibility için prefix'ler ekler)
 *
 * Autoprefixer Faydaları:
 * - -webkit-, -moz-, -ms- prefix'lerini otomatik ekler
 * - Browserslist konfigürasyonuna göre çalışır
 * - Modern CSS özelliklerini eski tarayıcılarda destekler
 *
 * Örnek Dönüşüm:
 * Input:  display: flex;
 * Output: display: -webkit-box;
 *         display: -ms-flexbox;
 *         display: flex;
 */
export default {
  plugins: {
    // ===== TAILWIND CSS v3 =====
    // Stable Tailwind CSS v3 plugin'i
    tailwindcss: {},

    // ===== AUTOPREFIXER =====
    // Vendor prefix'leri otomatik olarak ekler
    // Browser support için gerekli prefix'leri package.json > browserslist'e göre belirler
    // Örnek: transform -> -webkit-transform, -ms-transform, transform
    autoprefixer: {},

    // ===== FUTURE PLUGINS =====
    // İhtiyaç durumunda eklenebilecek plugin'ler:

    // CSS Nano - Production'da CSS'i minify eder
    // ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),

    // PostCSS Import - @import direktiflerini işler
    // 'postcss-import': {},

    // PostCSS Nested - Sass-like nested syntax desteği
    // 'postcss-nested': {},

    // PostCSS Custom Properties - CSS custom properties (variables) desteği
    // 'postcss-custom-properties': {},

    // PostCSS Preset Env - Modern CSS özellikleri için polyfill
    // 'postcss-preset-env': {
    //   stage: 1,
    //   features: {
    //     'custom-properties': false // Tailwind ile çakışmasın
    //   }
    // },
  },
};

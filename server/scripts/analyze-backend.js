const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Анализ Node.js сервера для диплома...\n');

// Создать папку отчетов
if (!fs.existsSync('reports')) {
  fs.mkdirSync('reports');
}

const runCommand = (command, description) => {
  try {
    console.log(`⏳ ${description}...`);
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} - готово`);
    return result;
  } catch (error) {
    console.log(`⚠️  ${description} - найдены проблемы`);
    return error.stdout || '';
  }
};

// 1. ESLint анализ бэкенда
runCommand('npm run lint:json', 'ESLint анализ сервера');
runCommand('npm run lint:html', 'ESLint HTML отчет');

// 2. Безопасность
runCommand(
  'npm audit --json > reports/security-audit.json',
  'Аудит безопасности',
);

// 3. Анализ зависимостей
runCommand(
  'npm run dependency-check > reports/dependencies.txt 2>&1',
  'Анализ зависимостей',
);

// 4. Анализ архитектуры
const analyzeArchitecture = () => {
  const analysis = {
    timestamp: new Date().toISOString(),
    projectType: 'Node.js Express API Server',
    structure: {},
    metrics: {},
    recommendations: [],
  };

  // Анализ структуры проекта
  const analyzeDirectory = (dir, level = 0) => {
    if (!fs.existsSync(dir) || level > 3) {
      return {};
    }

    const items = fs.readdirSync(dir);
    const structure = {};

    items.forEach((item) => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !item.startsWith('.') &&
        item !== 'node_modules'
      ) {
        structure[item] = analyzeDirectory(fullPath, level + 1);
      } else if (
        stat.isFile() &&
        (item.endsWith('.js') || item.endsWith('.mjs') || item.endsWith('.ts'))
      ) {
        const content = fs.readFileSync(fullPath, 'utf8');
        structure[item] = {
          lines: content.split('\n').length,
          size: stat.size,
          endpoints: (
            content.match(/\.(get|post|put|delete|patch)\s*\(/g) || []
          ).length,
          middleware: (content.match(/\(req,\s*res,\s*next\)/g) || []).length,
          asyncFunctions: (content.match(/async\s+function|async\s+\(/g) || [])
            .length,
        };
      }
    });

    return structure;
  };

  analysis.structure = analyzeDirectory('.');

  // Подсчет метрик
  const calculateMetrics = (
    struct,
    metrics = { files: 0, totalLines: 0, endpoints: 0, middleware: 0 },
  ) => {
    Object.values(struct).forEach((item) => {
      if (typeof item === 'object' && item.lines) {
        metrics.files++;
        metrics.totalLines += item.lines;
        metrics.endpoints += item.endpoints || 0;
        metrics.middleware += item.middleware || 0;
      } else if (typeof item === 'object') {
        calculateMetrics(item, metrics);
      }
    });
    return metrics;
  };

  analysis.metrics = calculateMetrics(analysis.structure);

  // Анализ ESLint результатов
  try {
    const eslintData = JSON.parse(
      fs.readFileSync('reports/backend-eslint.json', 'utf8'),
    );
    analysis.metrics.eslint = {
      totalFiles: eslintData.length,
      totalErrors: eslintData.reduce((sum, file) => sum + file.errorCount, 0),
      totalWarnings: eslintData.reduce(
        (sum, file) => sum + file.warningCount,
        0,
      ),
      filesWithIssues: eslintData.filter(
        (f) => f.errorCount > 0 || f.warningCount > 0,
      ).length,
    };

    // Анализ правил
    const ruleBreakdown = {};
    eslintData.forEach((file) => {
      file.messages.forEach((msg) => {
        ruleBreakdown[msg.ruleId] = (ruleBreakdown[msg.ruleId] || 0) + 1;
      });
    });
    analysis.ruleBreakdown = ruleBreakdown;
  } catch (e) {
    console.log('⚠️  ESLint отчет не найден');
  }

  // Рекомендации
  if (analysis.metrics.totalLines > 5000) {
    analysis.recommendations.push('Рассмотрите разделение на микросервисы');
  }
  if (analysis.metrics.endpoints > 50) {
    analysis.recommendations.push('Группируйте эндпоинты по модулям');
  }
  if (analysis.metrics.eslint?.totalErrors > 20) {
    analysis.recommendations.push(
      'Приоритет: исправление критических ошибок ESLint',
    );
  }

  return analysis;
};

const backendAnalysis = analyzeArchitecture();
fs.writeFileSync(
  'reports/backend-analysis.json',
  JSON.stringify(backendAnalysis, null, 2),
);

// 5. Создание HTML отчета
const createBackendReport = () => {
  const data = backendAnalysis;

  const htmlReport = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Анализ Node.js сервера</title>
    <style>
        body { font-family: Arial; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
        .metric-card { background: #f8f9fa; padding: 20px; margin: 10px; border-radius: 8px; display: inline-block; min-width: 200px; }
        .metric-title { font-weight: bold; color: #333; margin-bottom: 10px; }
        .metric-value { font-size: 24px; color: #007bff; font-weight: bold; }
        .good { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .recommendation { background: #e3f2fd; padding: 15px; margin: 10px 0; border-left: 4px solid #2196f3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Анализ Node.js API Сервера</h1>
        <p>Дата анализа: ${new Date(data.timestamp).toLocaleString('ru-RU')}</p>
        
        <h2>📊 Архитектурные метрики</h2>
        <div class="metric-card">
            <div class="metric-title">Файлов кода</div>
            <div class="metric-value">${data.metrics.files}</div>
        </div>
        <div class="metric-card">
            <div class="metric-title">Строк кода</div>
            <div class="metric-value">${data.metrics.totalLines}</div>
        </div>
        <div class="metric-card">
            <div class="metric-title">API эндпоинтов</div>
            <div class="metric-value">${data.metrics.endpoints}</div>
        </div>
        <div class="metric-card">
            <div class="metric-title">Middleware функций</div>
            <div class="metric-value">${data.metrics.middleware}</div>
        </div>

        ${
          data.metrics.eslint
            ? `
        <h2>🔍 Качество кода</h2>
        <div class="metric-card">
            <div class="metric-title">ESLint ошибки</div>
            <div class="metric-value ${data.metrics.eslint.totalErrors === 0 ? 'good' : 'error'}">${data.metrics.eslint.totalErrors}</div>
        </div>
        <div class="metric-card">
            <div class="metric-title">ESLint предупреждения</div>
            <div class="metric-value ${data.metrics.eslint.totalWarnings < 10 ? 'good' : 'warning'}">${data.metrics.eslint.totalWarnings}</div>
        </div>
        <div class="metric-card">
            <div class="metric-title">Файлов с проблемами</div>
            <div class="metric-value">${data.metrics.eslint.filesWithIssues}/${data.metrics.eslint.totalFiles}</div>
        </div>
        `
            : ''
        }

        ${
          data.ruleBreakdown
            ? `
        <h2>📋 Топ нарушенных правил</h2>
        <table>
            <tr><th>Правило</th><th>Количество</th><th>Описание</th></tr>
            ${Object.entries(data.ruleBreakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([rule, count]) => {
                const descriptions = {
                  complexity: 'Высокая сложность функций',
                  'max-lines-per-function': 'Слишком длинные функции',
                  'no-console': 'Использование console.log',
                  'security/detect-object-injection':
                    'Потенциальная уязвимость',
                  'consistent-return': 'Непоследовательный return',
                };
                return `<tr><td>${rule}</td><td>${count}</td><td>${descriptions[rule] || 'Нарушение стандартов кода'}</td></tr>`;
              })
              .join('')}
        </table>
        `
            : ''
        }

        <h2>💡 Рекомендации</h2>
        ${data.recommendations.map((rec) => `<div class="recommendation">${rec}</div>`).join('')}

        <h2>🔗 Детальные отчеты</h2>
        <ul>
            <li><a href="./backend-eslint.html">ESLint детальный отчет</a></li>
            <li><a href="./security-audit.json">Аудит безопасности</a></li>
            <li><a href="./dependencies.txt">Анализ зависимостей</a></li>
        </ul>
    </div>
</body>
</html>`;

  fs.writeFileSync('reports/backend-report.html', htmlReport);
};

createBackendReport();

console.log('\n📊 МЕТРИКИ NODE.JS СЕРВЕРА:');
console.log(`📁 Файлов кода: ${backendAnalysis.metrics.files}`);
console.log(`📄 Строк кода: ${backendAnalysis.metrics.totalLines}`);
console.log(`🌐 API эндпоинтов: ${backendAnalysis.metrics.endpoints}`);
console.log(`⚙️  Middleware: ${backendAnalysis.metrics.middleware}`);

if (backendAnalysis.metrics.eslint) {
  console.log(
    `❌ ESLint ошибки: ${backendAnalysis.metrics.eslint.totalErrors}`,
  );
  console.log(
    `⚠️  ESLint предупреждения: ${backendAnalysis.metrics.eslint.totalWarnings}`,
  );
  console.log(
    `🔥 Файлов с проблемами: ${backendAnalysis.metrics.eslint.filesWithIssues}`,
  );
}

console.log('\n🎉 Анализ Node.js сервера завершен!');
console.log('📁 Отчеты сохранены в папку reports/');
console.log('🌐 Откройте reports/backend-report.html');

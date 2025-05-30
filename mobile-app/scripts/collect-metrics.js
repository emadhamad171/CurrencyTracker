const fs = require('fs');
const { execSync } = require('child_process');

console.log('📊 Сбор метрик качества кода для диплома...\n');

// Создать папку отчетов
if (!fs.existsSync('reports')) {
  fs.mkdirSync('reports');
}

// Функция безопасного выполнения команд
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

// 1. ESLint анализ
runCommand('npm run lint:json', 'ESLint JSON отчет');
runCommand('npm run lint:html', 'ESLint HTML отчет');

// 2. TypeScript проверка
runCommand('npm run type-check > reports/typescript.txt 2>&1', 'TypeScript проверка');

// 3. Prettier проверка
runCommand('npm run format:check > reports/prettier.txt 2>&1', 'Prettier проверка');

// 4. Анализ метрик
const analyzeMetrics = () => {
  try {
    const eslintData = JSON.parse(fs.readFileSync('reports/eslint-report.json', 'utf8'));

    const metrics = {
      timestamp: new Date().toISOString(),
      summary: {
        totalFiles: eslintData.length,
        totalErrors: eslintData.reduce((sum, file) => sum + file.errorCount, 0),
        totalWarnings: eslintData.reduce((sum, file) => sum + file.warningCount, 0),
        filesWithIssues: eslintData.filter(f => f.errorCount > 0 || f.warningCount > 0).length,
      },
      fileDetails: eslintData.map(file => ({
        file: file.filePath.replace(process.cwd(), ''),
        errors: file.errorCount,
        warnings: file.warningCount,
        lines: file.source ? file.source.split('\n').length : 0,
      })),
      ruleBreakdown: {},
    };

    // Подсчет ошибок по правилам
    eslintData.forEach(file => {
      file.messages.forEach(msg => {
        if (!metrics.ruleBreakdown[msg.ruleId]) {
          metrics.ruleBreakdown[msg.ruleId] = 0;
        }
        metrics.ruleBreakdown[msg.ruleId]++;
      });
    });

    // Сохранить метрики
    fs.writeFileSync('reports/metrics.json', JSON.stringify(metrics, null, 2));

    // Создать простой HTML отчет
    const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <title>Метрики качества кода</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        .metric { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .good { border-left: 5px solid #28a745; }
        .warning { border-left: 5px solid #ffc107; }
        .error { border-left: 5px solid #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>📊 Отчет качества кода</h1>
    <p>Дата: ${new Date().toLocaleString('ru-RU')}</p>
    
    <div class="metric ${metrics.summary.totalErrors === 0 ? 'good' : 'error'}">
        <h3>Ошибки ESLint: ${metrics.summary.totalErrors}</h3>
        <p>Критические проблемы в коде</p>
    </div>
    
    <div class="metric ${metrics.summary.totalWarnings < 5 ? 'good' : 'warning'}">
        <h3>Предупреждения ESLint: ${metrics.summary.totalWarnings}</h3>
        <p>Потенциальные проблемы</p>
    </div>
    
    <div class="metric good">
        <h3>Проанализировано файлов: ${metrics.summary.totalFiles}</h3>
        <p>Файлов с проблемами: ${metrics.summary.filesWithIssues}</p>
    </div>

    <h2>📁 Проблемные файлы</h2>
    <table>
        <tr><th>Файл</th><th>Ошибки</th><th>Предупреждения</th></tr>
        ${metrics.fileDetails
          .filter(f => f.errors > 0 || f.warnings > 0)
          .map(f => `<tr><td>${f.file}</td><td>${f.errors}</td><td>${f.warnings}</td></tr>`)
          .join('')}
    </table>

    <h2>📋 Топ нарушенных правил</h2>
    <table>
        <tr><th>Правило</th><th>Количество</th></tr>
        ${Object.entries(metrics.ruleBreakdown)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([rule, count]) => `<tr><td>${rule}</td><td>${count}</td></tr>`)
          .join('')}
    </table>
</body>
</html>`;

    fs.writeFileSync('reports/metrics.html', htmlReport);

    console.log('\n📈 ИТОГОВЫЕ МЕТРИКИ:');
    console.log(`📁 Всего файлов: ${metrics.summary.totalFiles}`);
    console.log(`❌ Ошибок: ${metrics.summary.totalErrors}`);
    console.log(`⚠️  Предупреждений: ${metrics.summary.totalWarnings}`);
    console.log(`🔥 Файлов с проблемами: ${metrics.summary.filesWithIssues}`);
    console.log(
      `✅ Процент качественного кода: ${Math.round(((metrics.summary.totalFiles - metrics.summary.filesWithIssues) / metrics.summary.totalFiles) * 100)}%`
    );
  } catch (error) {
    console.log('⚠️  Не удалось проанализировать ESLint отчет');
  }
};

analyzeMetrics();

console.log('\n🎉 Сбор метрик завершен!');
console.log('📁 Файлы сохранены в папку reports/');
console.log('🌐 Откройте reports/metrics.html для просмотра');

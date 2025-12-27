const { defineConfig } = require("cypress");

module.exports = defineConfig({
 // Todo se guarda fuera del proyecto (en el disco D:)
  // Creamos una subcarpeta 'temp' para que el plugin tenga de donde copiar
  videosFolder: 'D:/Videos/Pruebas Calidad/videos',
  screenshotsFolder: 'D:/Videos/Pruebas Calidad/screenshots',
  downloadsFolder: 'D:/Videos/Pruebas Calidad/downloads',

  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    // El reporte final (HTML) quedará en la raíz de tu carpeta de Calidad
    reportDir: 'D:/Videos/Pruebas Calidad',
    autoOpen: true,
    charts: true,
    embeddedScreenshots: true,
    inlineAssets: false, 
    saveAllAttempts: false,

    // 4. Forzamos que se mantenga simple
    overwrite: true,
    html: true,
    json: false // No necesitamos los JSON una vez hecho el reporte
  },
  
  e2e: {
    baseUrl: 'http://localhost:5173',
    video: true, // Habilita la grabación de videos
    screenshotOnRunFailure: true, // También toma fotos si algo falla
    setupNodeEvents(on, config) {
    require('cypress-mochawesome-reporter/plugin')(on);
    },
    browsers: [
      {
        name: 'chromee',
        family: 'chromium',
        channel: 'stable',
        displayName: 'Chrome',
        version: '120.0.5993.117',
        majorVersion: 120,
        path: 'C:\\Users\\Duvan\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe',
      },
    ],
  },
});
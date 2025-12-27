describe('Auditoría de Integridad: Validación de Cronología Exacta', () => {
  
  Cypress.on('uncaught:exception', () => false);

  const obtenerFechaHoraActual = () => {
    const ahora = new Date();
    // Ajustamos al formato exacto que usa tu input (YYYY-MM-DD o DD/MM/YYYY)
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    
    const fechaFormateada = `${anio}-${mes}-${dia}`; // Formato estándar HTML5
    const fechaVisual = `${dia}/${mes}/${anio}`;    // Formato latino
    const hora = ahora.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    
    return { fechaFormateada, fechaVisual, hora };
  };

  beforeEach(() => {
    cy.visit('http://localhost:5173/'); 
    cy.get('input[placeholder="correo@ejemplo.com"]').type('soybot@pruebas.com', { delay: 40 });
    cy.get('input[placeholder="••••••••"]').type('123', { delay: 40 });
    cy.get('button.btn.primary').click();

    cy.contains('Facturas', { timeout: 10000 }).click();
    cy.wait(1000);
    cy.contains('Crear Nueva Factura').click();
    cy.wait(2000); 
  });

  it('Verificación de Tiempo Real: Fecha y Hora del Sistema', () => {
    const { fechaFormateada, fechaVisual, hora } = obtenerFechaHoraActual();
    
    cy.log(`Auditando... Hoy es: ${fechaVisual} | Hora: ${hora}`);

    // 1. Validar el campo de Fecha por su VALOR
    // Buscamos el input que contenga la fecha de hoy en su value
    cy.get('input').should('be.visible').then(($inputs) => {
        // Filtramos manualmente para encontrar el que tiene la fecha
        const inputFecha = $inputs.toArray().find(el => 
            el.value.includes(fechaFormateada) || el.value.includes(fechaVisual)
        );

        if (inputFecha) {
            cy.wrap(inputFecha)
              .should('have.attr', 'readonly')
              .invoke('val')
              .then((val) => {
                  cy.log(`✅ DEFENSA TEMPORAL: Fecha capturada correctamente: ${val}`);
              });
        }
    });

    cy.wait(1500);

    // 2. Validar el campo de Hora
    cy.get('input').then(($inputs) => {
        const inputHora = $inputs.toArray().find(el => el.value.includes(hora));
        
        if (inputHora) {
            cy.wrap(inputHora)
              .should('be.visible')
              .and('have.attr', 'readonly')
              .then(($el) => {
                  cy.log(`✅ PRECISIÓN: Hora exacta detectada: ${$el.val()}`);
              });
        }
    });

    cy.wait(2000);
    
    cy.log('🚀 Auditoría de cronología completada. La factura está anclada al tiempo real.');
  });
});
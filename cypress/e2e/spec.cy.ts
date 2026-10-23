describe('Flujo completo: Login -> Formularios -> Registro -> Exito', () => {
  beforeEach(() => {
    cy.intercept('POST', '/api/users/login', {
      statusCode: 200,
      body: {
        accessToken: 'token-simulado-123',
        refreshToken: 'refresh-simulado-456',
      },
    }).as('loginRequest');

    cy.intercept('POST', '/api/users', {
      statusCode: 201,
      body: { id: 1, message: 'Usuario registrado correctamente' },
    }).as('registroRequest');

    cy.visit('http://localhost:4200/bienvenido');
  });

  it('debe completar el flujo completo: login, formularios y registro exitoso', () => {
    // ---- Paso 1: Login ----
    cy.get('#correo').type('hola@ejemplo.com');
    cy.get('#contrasena').type('12345678');
    cy.contains('Acceder').click();

    cy.wait('@loginRequest');
    cy.url().should('include', '/principal');

    // ---- Paso 2: Navegar a registro ----
    cy.visit('http://localhost:4200/registro');

    cy.contains('Personal').click();
    cy.url().should('include', '/personal');

    // ---- Paso 3: Formulario Personal ----
    cy.get('#nombre').type('Fulanito');
    cy.get('#primerApellido').type('Perez');
    cy.get('#segundoApellido').type('Gomez');
    cy.get('#fechaNacimiento').type('2000-01-01');
    cy.get('#genero').type('Masculino');
    cy.get('#nacionalidad').type('Mexicano');

    cy.get('button[type="submit"]').should('not.be.disabled');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/cuenta');

    // ---- Paso 4: Formulario Cuenta ----
    cy.get('#telefono').type('5555555555');
    cy.get('#email').type('hola@ejemplo.com');
    cy.get('#nombreUsuario').type('fulanito');
    cy.get('#usuario').type('fulanito');
    cy.get('#contrasena').type('12345678');
    cy.get('#ocupacion').type('Estudiante');
    cy.get('#rol').type('Estudiante');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/direccion');

    // ---- Paso 5: Formulario Direccion ----
    cy.get('#codigoPostal').type('00000');
    cy.get('#estado').type('Estado de ejemplo');
    cy.get('#ciudad').type('Ciudad de ejemplo');
    cy.get('#colonia').type('Colonia ejemplo');
    cy.get('#calle').type('Calle siempre viva');
    cy.get('#numeroExterior').type('123');
    cy.get('#numeroInterior').type('4');
    cy.get('#referencia').type('Casa de ejemplo');
    cy.get('button[type="submit"]').click();

    cy.url().should('include', '/fotografia');

    // ---- Paso 6: Fotografia y continuar ----
    cy.contains('Continuar').click();
    cy.url().should('include', '/registro');

    // ---- Paso 7: Verificar boton habilitado y Registrar ----
    cy.get('.registrar').should('be.enabled');

    cy.window().then((win) => {
      cy.stub(win, 'alert').as('alertaExito');
    });

    cy.get('.registrar').click();
    cy.wait('@registroRequest');

    cy.get('@alertaExito').should('have.been.calledWith', 'Registro exitoso');
  });
});

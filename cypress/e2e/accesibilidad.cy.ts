describe('Pruebas de accesibilidad: Controles accesibles', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/bienvenido');
    cy.injectAxe();
  });

  it('cada input debe tener un label asociado mediante el atributo for/id', () => {
    cy.get('label[for="correo"]').should('exist');
    cy.get('#correo').should('exist');

    cy.get('label[for="contrasena"]').should('exist');
    cy.get('#contrasena').should('exist');
  });

  it('todas las imagenes deben tener el atributo alt', () => {
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt').and('not.be.empty');
    });
  });

  it('debe poder navegar al campo de correo usando el teclado (Tab)', () => {
    cy.get('body').tab();
    cy.focused().should('have.id', 'correo');
  });

  it('el boton de acceder debe ser un elemento button accesible por teclado', () => {
    cy.contains('Acceder').should('have.prop', 'tagName', 'BUTTON');
  });
});

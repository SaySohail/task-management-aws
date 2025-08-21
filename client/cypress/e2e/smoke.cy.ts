describe("Smoke", () => {
  it("loads homepage", () => {
    cy.visit("/");
    cy.contains(/task/i);     // adjust to a visible headline in your UI
  });
});

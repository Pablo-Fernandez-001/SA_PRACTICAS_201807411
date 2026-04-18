describe("Helpdesk UI - Project flow screenshots", () => {
  const appUrl = "http://localhost:3000";
  const usersBase = "http://localhost:3101/api";
  const ticketsBase = "http://localhost:3102/api";

  function screenshot(name) {
    cy.screenshot(name, {
      capture: "viewport",
      overwrite: true,
    });
  }

  beforeEach(() => {
    cy.visit(appUrl, {
      onBeforeLoad(win) {
        win.localStorage.clear();
        win.sessionStorage.clear();
      },
    });
  });

  it("captures the real frontend workflow", () => {
    const requesterName = "UI Tester";
    const requesterEmail = "ui.tester@local.dev";
    const requesterPassword = "UiTest123!";
    const ticketTitle = `UI ticket ${Date.now()}`;
    let requesterId;
    let agentId;
    let adminId;
    let ticketId;

    cy.contains("Helpdesk Management System").should("be.visible");
    screenshot("01-login-page");

    cy.contains("Entrar como Administrador").click();
    cy.contains("Helpdesk Event-Ready Control Panel", { timeout: 15000 }).should("be.visible");
    screenshot("02-admin-dashboard");

    cy.contains("h2", "Crear Usuario").parents("article").within(() => {
      cy.get('input[placeholder="Nombre"]').type(requesterName);
      cy.get('input[placeholder="Correo"]').type(requesterEmail);
      cy.get('input[placeholder="Contraseña (mínimo 6 caracteres)"]').type(requesterPassword);
      cy.get("select").select("requester");
      cy.contains("Guardar usuario").click();
    });

    cy.contains("h2", "Usuarios").scrollIntoView();
    cy.contains(requesterName, { timeout: 15000 }).should("be.visible");
    cy.contains(requesterEmail).should("be.visible");
    screenshot("03-user-created");

    cy.request("GET", `${usersBase}/users`).then((usersResponse) => {
      expect(usersResponse.status).to.eq(200);
      const users = usersResponse.body;
      const newRequester = users.find((user) => user.email === requesterEmail);
      const agent = users.find((user) => user.role === "agent");
      const admin = users.find((user) => user.role === "admin");

      expect(newRequester, "created requester").to.exist;
      expect(agent, "seed agent").to.exist;
      expect(admin, "seed admin").to.exist;

      requesterId = newRequester.id;
      agentId = agent.id;
      adminId = admin.id;
    });

    cy.contains("h2", "Crear Ticket").parents("article").within(() => {
      cy.get("select").first().select(String(requesterId));
      cy.get('input[placeholder="Titulo"]').type(ticketTitle);
      cy.get('textarea[placeholder="Descripcion"]').type(
        "El portal interno responde lento y algunas peticiones expiran."
      );
      cy.get(".row select").first().select("HIGH");
      cy.get('input[placeholder="Categoria"]').type("Performance");
      cy.contains("Guardar ticket").click();
    });

    cy.contains("h2", "Tickets").scrollIntoView();
    cy.contains(ticketTitle, { timeout: 15000 }).should("be.visible");
    screenshot("04-ticket-created");

    cy.request("GET", `${ticketsBase}/tickets`).then((ticketsResponse) => {
      expect(ticketsResponse.status).to.eq(200);
      const ticket = ticketsResponse.body.find((item) => item.title === ticketTitle);
      expect(ticket, "created ticket").to.exist;
      ticketId = ticket.id;
    });

    cy.contains("h2", "Asignar Ticket").parents("article").within(() => {
      cy.get("select").first().select(String(ticketId));
      cy.get("select").eq(1).select(String(agentId));
      cy.get("select").eq(2).select(String(adminId));
      cy.get('input[placeholder="Motivo"]').type("Asignacion por prioridad alta");
      cy.contains("Crear asignacion").click();
    });

    cy.contains("h2", "Asignaciones").scrollIntoView();
    cy.contains("Asignacion #", { timeout: 15000 }).should("be.visible");
    cy.contains("ASSIGNED").should("be.visible");
    screenshot("05-assignment-created");

    cy.contains("h2", "Tickets").scrollIntoView();
    cy.contains("h2", "Tickets").parents("article").within(() => {
      cy.contains("li", ticketTitle).within(() => {
        cy.contains("Historial").click();
      });
    });

    cy.contains("Historial de Ticket", { timeout: 10000 }).scrollIntoView();
    cy.contains("Historial de Ticket", { timeout: 10000 }).should("be.visible");
    cy.contains("OPEN").should("be.visible");
    screenshot("06-ticket-history");
  });
});
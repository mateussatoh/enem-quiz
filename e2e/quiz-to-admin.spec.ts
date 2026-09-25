import { expect, test } from "@playwright/test";

test("a student completes the quiz and the team sees the lead", async ({ page }, testInfo) => {
  const email = `e2e.${testInfo.project.name}.${Date.now()}@exemplo.com`;

  await page.goto("/");
  await page.getByRole("link", { name: "Começar diagnóstico" }).click();

  // Best answer everywhere except question 2, which we change after going back.
  for (let i = 0; i < 2; i++) {
    await expect(page.getByText(`Pergunta ${i + 1} de 10`).first()).toBeVisible();
    await page.getByRole("radio").first().click();
  }
  await expect(page.getByText("Pergunta 3 de 10").first()).toBeVisible();
  await page.getByRole("button", { name: "Voltar" }).click();
  await expect(page.getByRole("radio", { checked: true })).toHaveText(/Menos de 2 horas/);
  await page.getByRole("radio").last().click();

  for (let i = 2; i < 10; i++) {
    await expect(page.getByText(`Pergunta ${i + 1} de 10`).first()).toBeVisible();
    await page.getByRole("radio").last().click();
  }

  await expect(page.getByRole("heading", { name: "Seu diagnóstico está pronto" })).toBeVisible();
  await page.getByRole("button", { name: "Ver meu resultado" }).click();
  await expect(page.getByText("E-mail inválido")).toBeVisible();

  await page.getByLabel("Nome").fill("Teste E2E");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Telefone (WhatsApp)").pressSequentially("11987654321");
  await page.getByRole("button", { name: "Ver meu resultado" }).click();

  // Q1 first option (2 pts) + nine best answers (10 pts each) = 92.
  await expect(page).toHaveURL(/\/resultado\//);
  await expect(page.getByRole("img", { name: "Pontuação 92 de 100" })).toBeVisible();
  await expect(page.getByText("Reta final").first()).toBeVisible();
  await expect(page.getByText("15 horas ou mais")).toBeVisible();

  await page.goto("/admin/leads");
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel("E-mail").fill("admin@assaad.dev");
  await page.getByLabel("Senha").fill("Assaad@2026");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("heading", { name: "Visão geral" })).toBeVisible();

  await page.goto("/admin/leads");
  await page.getByLabel("Buscar por nome ou e-mail").fill(email);
  await expect(page.getByText("1 lead encontrado")).toBeVisible();
  // Desktop renders a table, mobile a card list: click whichever is visible.
  await page.getByText(email).locator("visible=true").click();
  await expect(page.getByRole("dialog")).toContainText("Respostas (10)");
  await expect(page.getByRole("dialog")).toContainText("92");
});

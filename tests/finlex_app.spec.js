const { test, expect, describe, beforeEach } = require('@playwright/test')

describe("Finlex main page", () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001')
  })

  test('front page can be opened', async ({ page }) => {
    const locator = await page.getByText("Lainsäädäntö:")
    await expect(locator).toBeVisible()
    await expect(page.getByPlaceholder("Vuosi tai numero/vuosi")).toBeVisible()
    await expect(page.getByRole("button", {name: "Hae"})).toBeVisible()
    await expect(page.getByRole("combobox")).toBeVisible()
  })

  test('language can be changed to swedish', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Ruotsi")

    const locator = await page.getByText("Lagstiftning")
    await expect(locator).toBeVisible()
    await expect(page.getByPlaceholder("År eller nummer/år")).toBeVisible()
    await expect(page.getByRole("button", {name: "Sök"})).toBeVisible()
    await expect(page.getByRole("combobox")).toBeVisible()
  })

  test('searchbar can be used to search (fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("laki")
    await page.getByRole("button", {name: "Hae"}).click()
    await expect(page.getByText("/").first()).toBeVisible()
  })

  test('searchbar shows error message (fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("")
    await page.getByRole("button", {name: "Hae"}).click()
    await expect(page.getByText("Haulla ei löytynyt hakutuloksia")).toBeVisible()
  })

  test('searchbar can be used to search (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Ruotsi")

    await page.getByRole("textbox").fill("lag")
    await page.getByRole("button", {name: "Sök"}).click()
    await expect(page.getByText("/").first()).toBeVisible()
  })

  test('searchbar shows error message (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Ruotsi")
    await page.getByRole("textbox").fill("")
    await page.getByRole("button", {name: "Sök"}).click()
    await expect(page.getByText("Inga sökresultat")).toBeVisible()
  })

  test('searchresult can be opened', async ({ page }) => {
    await page.getByRole("textbox").fill("luonnonsuojelulaki")
    await page.getByRole("button", {name: "Hae"}).click()
    await page.getByText("Luonnonsuojelulaki").click()
    await expect(page.getByText("Metadata")).toBeVisible()
  })

  test('single law page can be opened (fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("9/2023")
    await page.getByRole("button", {name: "Hae"}).click()
    const locator = await page.getByText("9/2023 – Luonnonsuojelulaki")
    await expect(locator).toBeVisible()
    await expect(page.getByText("Metadata")).toBeVisible()
    await expect(page.getByRole('link', { name: 'Takaisin', exact: true})).toBeVisible()
  })

  test('single law page can be opened (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Ruotsi")
    await page.getByRole("textbox").fill("9/2023")
    await page.getByRole("button", {name: "Sök"}).click()
    const locator = await page.getByText("9/2023 – Naturvårdslag")
    await expect(locator).toBeVisible()
    await expect(page.getByText("Metadata")).toBeVisible()
    await expect(page.getByRole('link', { name: 'Tillbaka', exact: true})).toBeVisible()
  })

})

test('back button brings back to main page', async ({ page }) => {
    await page.goto('http://localhost:3001/lainsaadanto/2023/9')
    const locator1 = await page.getByText("9/2023 – Luonnonsuojelulaki")
    await expect(locator1).toBeVisible()
    await page.getByRole('link', { name: 'Takaisin', exact: true}).click()
    const locator = await page.getByText("Lainsäädäntö:")
    await expect(locator).toBeVisible()
    await expect(page.getByPlaceholder("Vuosi tai numero/vuosi")).toBeVisible()
    await expect(page.getByRole("button", {name: "Hae"})).toBeVisible()
    await expect(page.getByRole("combobox")).toBeVisible()
  })
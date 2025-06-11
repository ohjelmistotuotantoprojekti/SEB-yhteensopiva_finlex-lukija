import playwright from '@playwright/test'


playwright.describe("Main page", () => {
  playwright.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001')
  })


  playwright.test('front page can be opened', async ({ page }) => {
    const locator = await page.getByText("Lainsäädäntö:")
    await playwright.expect(locator).toBeVisible()
    await playwright.expect(page.getByPlaceholder("Vuosi tai numero/vuosi")).toBeVisible()
    await playwright.expect(page.getByRole("button", {name: "Hae"})).toBeVisible()
    await playwright.expect(page.getByRole("combobox")).toBeVisible()
  })
/*
  playwright.test('language can be changed to swedish', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Ruotsi")

    const locator = await page.getByText("Lagstiftning")
    await playwright.expect(locator).toBeVisible()
    await playwright.expect(page.getByPlaceholder("År eller nummer/år")).toBeVisible()
    await playwright.expect(page.getByRole("button", {name: "Sök"})).toBeVisible()
    await playwright.expect(page.getByRole("combobox")).toBeVisible()
  })

  playwright.test('searchbar can be used to search (fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("laki")
    await page.getByRole("button", {name: "Hae"}).click()
    await playwright.expect(page.getByText("/").first()).toBeVisible()
  })

  playwright.test('searchbar shows error message (fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("")
    await page.getByRole("button", {name: "Hae"}).click()
    await playwright.expect(page.getByText("Haulla ei löytynyt hakutuloksia")).toBeVisible()
  })

  playwright.test('searchbar can be used to search (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Ruotsi")

    await page.getByRole("textbox").fill("lag")
    await page.getByRole("button", {name: "Sök"}).click()
    await playwright.expect(page.getByText("/").first()).toBeVisible()
  })

  playwright.test('searchbar shows error message (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Ruotsi")
    await page.getByRole("textbox").fill("")
    await page.getByRole("button", {name: "Sök"}).click()
    await playwright.expect(page.getByText("Inga sökresultat")).toBeVisible()
  })

  playwright.test('searchresult can be opened', async ({ page }) => {
    await page.getByRole("textbox").fill("luonnonsuojelulaki")
    await page.getByRole("button", {name: "Hae"}).click()
    await page.getByText("Luonnonsuojelulaki").click()
    await playwright.expect(page.getByText("Metadata")).toBeVisible()
  })

  playwright.test('single law page can be opened (fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("9/2023")
    await page.getByRole("button", {name: "Hae"}).click()
    const locator = await page.getByText("9/2023 – Luonnonsuojelulaki")
    await playwright.expect(locator).toBeVisible()
    await playwright.expect(page.getByText("Metadata")).toBeVisible()
    await playwright.expect(page.getByRole('link', { name: 'Takaisin', exact: true})).toBeVisible()
  })

  playwright.test('single law page can be opened (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Ruotsi")
    await page.getByRole("textbox").fill("9/2023")
    await page.getByRole("button", {name: "Sök"}).click()
    const locator = await page.getByText("9/2023 – Naturvårdslag")
    await playwright.expect(locator).toBeVisible()
    await playwright.expect(page.getByText("Metadata")).toBeVisible()
    await playwright.expect(page.getByRole('link', { name: 'Tillbaka', exact: true})).toBeVisible()
  })
*/
})

/*
playwright.describe("Single law page", () => {
  playwright.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/lainsaadanto/2023/9')
  })

  playwright.afterEach(async ({ page }) => {
    await closePool();
    await container.stop();
  })

playwright.test('back button brings back to main page', async ({ page }) => {
    const locator1 = await page.getByText("9/2023 – Luonnonsuojelulaki")
    await playwright.expect(locator1).toBeVisible()
    await page.getByRole('link', { name: 'Takaisin', exact: true}).click()
    const locator = await page.getByText("Lainsäädäntö:")
    await playwright.expect(locator).toBeVisible()
    await playwright.expect(page.getByPlaceholder("Vuosi tai numero/vuosi")).toBeVisible()
    await playwright.expect(page.getByRole("button", {name: "Hae"})).toBeVisible()
    await playwright.expect(page.getByRole("combobox")).toBeVisible()
  })

playwright.test('language can be changed to swedish', async ({ page }) => {
    pass
  })

playwright.test('language stays after back button is pressed', async ({ page }) => {
    pass
  })

})

playwright.describe("Case law page", () => {
  playwright.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/oikeuskaytanto')
  })

  playwright.afterEach(async ({ page }) => {
    await closePool();
    await container.stop();
  })

playwright.test('page can be opened', async ({ page }) => {
    pass
  })

playwright.test('language can be changed to swedish', async ({ page }) => {
    pass
  })

playwright.test('searchbar gives error (fin)', async ({ page }) => {
    pass
  })

playwright.test('searchbar gives error (swe)', async ({ page }) => {
    pass
  })

playwright.test('searchbar can be used to search (fin)', async ({ page }) => {
    pass
  })

playwright.test('searchbar can be used to search (swe)', async ({ page }) => {
    pass
  })

playwright.test('single case can be searched (fin)', async ({ page }) => {
    pass
  })

playwright.test('single case can be searched (swe)', async ({ page }) => {
    pass
  })

playwright.test('single case law can be opened', async ({ page }) => {
    pass
  })



})

playwright.describe("Single case law page", () => {
  playwright.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001/oikeuskaytanto/2005/13/kho')
  })

  playwright.afterEach(async ({ page }) => {
    await closePool();
    await container.stop();
  })

playwright.test('back button brings back to case law page', async ({ page }) => {
    pass
  })

playwright.test('language can be changed to swedish', async ({ page }) => {
    pass
  })

playwright.test('language stays after back button is pressed', async ({ page }) => {
    pass
  })

})
*/
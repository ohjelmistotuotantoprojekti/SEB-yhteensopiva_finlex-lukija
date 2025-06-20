import playwright from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'

playwright.describe("Main page", () => {
  playwright.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })


  playwright.test('front page can be opened', async ({ page }) => {
    const locator = await page.getByText("Lainsäädäntö")
    await playwright.expect(locator).toBeVisible()
    await playwright.expect(page.getByPlaceholder("Vuosi tai numero/vuosi")).toBeVisible()
    await playwright.expect(page.getByRole("button", {name: "Hae"})).toBeVisible()
    await playwright.expect(page.getByRole("combobox")).toBeVisible()
  })

  playwright.test('language can be changed to swedish', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    const locator = await page.getByText("Lagstiftning")
    await playwright.expect(locator).toBeVisible()
    await playwright.expect(page.getByPlaceholder("År eller nummer/år")).toBeVisible()
    await playwright.expect(page.getByRole("button", {name: "Sök"})).toBeVisible()
    await playwright.expect(page.getByRole("combobox")).toBeVisible()
  })

  playwright.test('searchbar can be used to search (fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("luonnonsuojelulaki")
    await page.getByRole("button", {name: "Hae"}).click()
    await page.getByText("9/2023 - Luonnonsuojelulaki").click()
    await playwright.expect(page.getByText("Metadata")).toBeVisible()
  })

  playwright.test('searchbar shows error message (empty, fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("")
    await page.getByRole("button", {name: "Hae"}).click()
    await playwright.expect(page.getByText("Virheellinen haku")).toBeVisible()
  })

  playwright.test('searchbar shows error message (not found, fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("77777777777777777")
    await page.getByRole("button", {name: "Hae"}).click()
    playwright.expect.configure({ timeout: 100000 })
    await playwright.expect(page.getByText("Haulla ei löytynyt hakutuloksia")).toBeVisible()
  })

  playwright.test('searchbar can be used to search (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await page.getByRole("textbox").fill("naturvårdslag")
    await page.getByRole("button", {name: "Sök"}).click()
    await page.getByText("Naturvårdslag").click()
    await playwright.expect(page.getByText("Metadata")).toBeVisible()
  })

  playwright.test('searchbar shows error message (empty, swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await page.getByRole("textbox").fill("")
    await page.getByRole("button", {name: "Sök"}).click()
    await playwright.expect(page.getByText("Ogiltig sökning")).toBeVisible()
  })

  playwright.test('searchbar shows error message (not found, swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await page.getByRole("textbox").fill("77777777777777777")
    await page.getByRole("button", {name: "Sök"}).click()
    await playwright.expect(page.getByText("Inga sökresultat")).toBeVisible()
  })

  playwright.test('single law page can be opened (fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("9/2023")
    await page.getByRole("button", {name: "Hae"}).click()
    const locator = await page.getByText("9/2023 – Luonnonsuojelulaki")
    await playwright.expect(locator).toBeVisible()
    await playwright.expect(page.getByText("Metadata")).toBeVisible()
  })

  playwright.test('single law page can be opened (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await page.getByRole("textbox").fill("9/2023")
    await page.getByRole("button", {name: "Sök"}).click()
    const locator = await page.getByText("9/2023 – Naturvårdslag")
    await playwright.expect(locator).toBeVisible()
    await playwright.expect(page.getByText("Metadata")).toBeVisible()
  })

})


playwright.describe("Single law page", () => {
  playwright.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/lainsaadanto/2023/9`)
  })

  playwright.test('language can be changed to swedish', async () => {
    ///await page.getByRole("combobox").selectOption("Svenska")
    ///Kielen vaihto ei vielä mahdollista
  })

  playwright.test('language stays after back button is pressed', async () => {
    ///Kielen vaihto ei vielä mahdollista
  })

})

playwright.describe("Case law page", () => {
  playwright.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/oikeuskaytanto`)
  })

  playwright.test('page can be opened', async ({ page }) => {
    const locator = await page.getByText("Oikeuskäytäntö")
    await playwright.expect(locator).toBeVisible()
    await playwright.expect(page.getByPlaceholder("Vuosi tai oikeusaste:vuosi:numero")).toBeVisible()
    await playwright.expect(page.getByRole("button", {name: "Hae"})).toBeVisible()
    await playwright.expect(page.getByRole("combobox")).toBeVisible()
  })

  playwright.test('language can be changed to swedish', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    const locator = await page.getByText("Rättspraxis")
    await playwright.expect(locator).toBeVisible()
    await playwright.expect(page.getByPlaceholder("År eller domstol:år:nummer")).toBeVisible()
    await playwright.expect(page.getByRole("button", {name: "Sök"})).toBeVisible()
    await playwright.expect(page.getByRole("combobox")).toBeVisible()
  })

  playwright.test('searchbar gives error (empty, fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("")
    await page.getByRole("button", {name: "Hae"}).click()
    await playwright.expect(page.getByText("Virheellinen haku")).toBeVisible()
  })

  playwright.test('searchbar gives error (not found, fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("7777777777")
    await page.getByRole("button", {name: "Hae"}).click()
    await playwright.expect(page.getByText("Haulla ei löytynyt hakutuloksia")).toBeVisible()
  })

  playwright.test('searchbar gives error (empty, swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await page.getByRole("textbox").fill("")
    await page.getByRole("button", {name: "Sök"}).click()
    await playwright.expect(page.getByText("Ogiltig sökning")).toBeVisible()
  })

  playwright.test('searchbar gives error (not found, swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await page.getByRole("textbox").fill("7777777777777")
    await page.getByRole("button", {name: "Sök"}).click()
    await playwright.expect(page.getByText("Inga sökresultat")).toBeVisible()
  })


  playwright.test('searchbar can be used to search (fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("viikonloppu")
    await page.getByRole("button", {name: "Hae"}).click()
    await page.getByText(":").first().click()
  })

  playwright.test('searchbar can be used to search (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await page.getByRole("textbox").fill("europeiska")
    await page.getByRole("button", {name: "Sök"}).click()
    await page.getByText(":").first().click()
  })

  playwright.test('single case can be searched (fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("kho:2005:13")
    await page.getByRole("button", {name: "Hae"}).click()
    const locator1 = await page.getByText("Asian aikaisempi käsittely")
    await playwright.expect(locator1).toBeVisible()
  })

  playwright.test('single case can be searched (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await page.getByRole("textbox").fill("kho:2005:13")
    await page.getByRole("button", {name: "Sök"}).click()
    const locator1 = await page.getByText("med stöd av 33")
    await playwright.expect(locator1).toBeVisible()
  })

})

playwright.describe("Single case law page", () => {
  playwright.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/oikeuskaytanto/2005/13/kho`)
  })

  playwright.test('language can be changed to swedish', async () => {
    ///await page.getByRole("combobox").selectOption("Svenska")
    ///Kielen vaihto ei vielä mahdollista
  })

  playwright.test('language stays after back button is pressed', async () => {
    ///Kielen vaihto ei vielä mahdollista
  })

})

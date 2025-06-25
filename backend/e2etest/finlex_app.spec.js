import playwright from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'

playwright.describe("Main page", () => {
  playwright.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
  })


  playwright.test('front page can be opened', async ({ page }) => {
    await playwright.expect(page.getByRole("link", {name: "Lainsäädäntö"})).toBeVisible()
    await playwright.expect(page.getByRole("link", {name: "Oikeuskäytäntö"})).toBeVisible()
    await playwright.expect(page.getByPlaceholder("Vuosi tai numero/vuosi")).toBeVisible()
    await playwright.expect(page.getByRole("button", {name: "Hae"})).toBeVisible()
    await playwright.expect(page.getByRole("link", {name: "Asiasanahaku"})).toBeVisible()
    await playwright.expect(page.getByRole("combobox")).toBeVisible()
  })

  playwright.test('language can be changed to swedish', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await playwright.expect(page.getByRole("link", {name: "Rättspraxis"})).toBeVisible()
    await playwright.expect(page.getByRole("link", {name: "Lagstiftning"})).toBeVisible()
    await playwright.expect(page.getByPlaceholder("År eller nummer/år")).toBeVisible()
    await playwright.expect(page.getByRole("button", {name: "Sök"})).toBeVisible()
    await playwright.expect(page.getByRole("link", {name: "Sök med ämnesord"})).toBeVisible()
    await playwright.expect(page.getByRole("combobox")).toBeVisible()
  })

  playwright.test('searchbar can be used to search (fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("luonnonsuojelulaki")
    await page.getByRole("button", {name: "Hae"}).click()
    await page.getByRole('link', { name: '/2023 - Luonnonsuojelulaki' }).click()
    await playwright.expect(page.getByRole("heading", {name: "Metadata"})).toBeVisible()
  })

  playwright.test('searchbar shows error message (empty, fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("")
    await page.getByRole("button", {name: "Hae"}).click()
    await playwright.expect(page.getByText("Virheellinen haku")).toBeVisible()
  })

  playwright.test('searchbar shows error message (not found, fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("77777777777777777")
    await page.getByRole("button", {name: "Hae"}).click()
    await playwright.expect(page.getByText("Haulla ei löytynyt hakutuloksia")).toBeVisible()
  })

  playwright.test('searchbar can be used to search (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await page.getByRole("textbox").fill("naturvårdslag")
    await page.getByRole("button", {name: "Sök"}).click()
    await page.getByRole('link', { name: '/2023 - Naturvårdslag' }).click()
    await playwright.expect(page.getByRole("heading", {name: "Metadata"})).toBeVisible()
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
    await playwright.expect(page.getByRole("heading", {name: "9/2023 – Luonnonsuojelulaki"})).toBeVisible()
    await playwright.expect(page.getByRole("heading", {name: "Metadata"})).toBeVisible()
  })

  playwright.test('single law page can be opened (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await page.getByRole("textbox").fill("9/2023")
    await page.getByRole("button", {name: "Sök"}).click()
    await playwright.expect(page.getByRole("heading", {name: "9/2023 – Naturvårdslag"})).toBeVisible()
    await playwright.expect(page.getByRole("heading", {name: "Metadata"})).toBeVisible()
  })

  playwright.test('keyword view can be opened', async ({ page }) => {
    await page.getByRole("link", {name: "Asiasanahaku"}).click()
    await playwright.expect(page.getByRole("heading", {name: "Asiasanat"})).toBeVisible()
  })

})


playwright.describe("Single law page", () => {
  playwright.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/lainsaadanto/2023/9`)
  })

  playwright.test('page can be opened', async ({ page }) => {
    await playwright.expect(page.getByRole("link", {name: "Lainsäädäntö"})).toBeVisible()
    await playwright.expect(page.getByRole("link", {name: "Oikeuskäytäntö"})).toBeVisible()
    await playwright.expect(page.getByRole("combobox")).toBeVisible()
    await playwright.expect(page.getByRole("heading", {name: "9/2023 – Luonnonsuojelulaki"})).toBeVisible()
  })

  playwright.test('language can be changed to swedish', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await playwright.expect(page.getByRole("link", {name: "Rättspraxis"})).toBeVisible()
    await playwright.expect(page.getByRole("link", {name: "Lagstiftning"})).toBeVisible()
    await playwright.expect(page.getByRole("heading", {name: "9/2023 – Naturvårdslag"})).toBeVisible()
  })

})


playwright.describe("Keyword page", () => {
  playwright.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/lainsaadanto/asiasanat`)
  })

  playwright.test('page can be opened', async ({ page }) => {
    await playwright.expect(page.getByRole("link", {name: "Lainsäädäntö"})).toBeVisible()
    await playwright.expect(page.getByRole("link", {name: "Oikeuskäytäntö"})).toBeVisible()
    await playwright.expect(page.getByRole("combobox")).toBeVisible()
    await playwright.expect(page.getByRole("heading", {name: "Asiasanat"})).toBeVisible()
  })

  playwright.test('language can be changed to swedish', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await playwright.expect(page.getByRole("heading", {name: "Ämnesord"})).toBeVisible()
    await playwright.expect(page.getByRole("link", {name: "Rättspraxis"})).toBeVisible()
    await playwright.expect(page.getByRole("link", {name: "Lagstiftning"})).toBeVisible()
  })

  playwright.test('keywords laws are visible and can be clicked', async ({ page }) => {
    await page.getByRole("link", {name: "Luonnonsuojelu"}).click()
    await playwright.expect(page.getByRole("heading", {name: "Asiasanat - "})).toBeVisible()
    await page.getByRole('link', { name: '/2023 - Luonnonsuojelulaki' }).click()
    await playwright.expect(page.getByRole("heading", {name: "9/2023 – Luonnonsuojelulaki"})).toBeVisible()
    await playwright.expect(page.getByRole("heading", {name: "Metadata"})).toBeVisible()
  })

  playwright.test('keywords laws are visible and can be clicked (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await page.getByRole("link", {name: "Naturvård"}).click()
    await playwright.expect(page.getByRole("heading", {name: "Ämnesord - "})).toBeVisible()
    await page.getByRole('link', { name: '/2023 - Naturvårdslag' }).click()
    await playwright.expect(page.getByRole("heading", {name: "9/2023 – Naturvårdslag"})).toBeVisible()
    await playwright.expect(page.getByRole("heading", {name: "Metadata"})).toBeVisible()
  })
})


playwright.describe("Case law page", () => {
  playwright.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/oikeuskaytanto`)
  })

  playwright.test('page can be opened', async ({ page }) => {
    await playwright.expect(page.getByRole("link", {name: "Lainsäädäntö"})).toBeVisible()
    await playwright.expect(page.getByRole("link", {name: "Oikeuskäytäntö"})).toBeVisible()
    await playwright.expect(page.getByPlaceholder("Vuosi tai oikeusaste:vuosi:numero")).toBeVisible()
    await playwright.expect(page.getByRole("button", {name: "Hae"})).toBeVisible()
    await playwright.expect(page.getByRole("combobox")).toBeVisible()
  })

  playwright.test('language can be changed to swedish', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await playwright.expect(page.getByRole("link", {name: "Rättspraxis"})).toBeVisible()
    await playwright.expect(page.getByRole("link", {name: "Lagstiftning"})).toBeVisible()
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
    await page.getByRole("textbox").fill("2023")
    await page.getByRole("button", {name: "Hae"}).click()
    await page.getByRole("link", {name: ":"}).click()
    await playwright.expect(page.getByRole("heading", {name: "2023"})).toBeVisible()
  })

  playwright.test('searchbar can be used to search (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await page.getByRole("textbox").fill("2023")
    await page.getByRole("button", {name: "Sök"}).click()
    await page.getByRole("link", {name: ":"}).click()
    await playwright.expect(page.getByRole("heading", {name: "2023"})).toBeVisible()
  })

  playwright.test('single case can be searched (fin)', async ({ page }) => {
    await page.getByRole("textbox").fill("kko:2023:5")
    await page.getByRole("button", {name: "Hae"}).click()
    await playwright.expect(page.getByRole("heading", {name: "KKO 5/2023"})).toBeVisible()
  })

  playwright.test('single case can be searched (swe)', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await page.getByRole("textbox").fill("kko:2023:5")
    await page.getByRole("button", {name: "Sök"}).click()
    await playwright.expect(page.getByRole("heading", {name: "KKO 5/2023"})).toBeVisible()
  })
})


playwright.describe("Single case law page", () => {
  playwright.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/oikeuskaytanto/2023/5/kko`)
  })

  playwright.test('page can be opened', async ({ page }) => {
    await playwright.expect(page.getByRole("link", {name: "Lainsäädäntö"})).toBeVisible()
    await playwright.expect(page.getByRole("link", {name: "Oikeuskäytäntö"})).toBeVisible()
    await playwright.expect(page.getByRole("combobox")).toBeVisible()
    await playwright.expect(page.getByRole("heading", {name: "KKO 5/2023"})).toBeVisible()
  })

  playwright.test('language can be changed to swedish', async ({ page }) => {
    await page.getByRole("combobox").selectOption("Svenska")
    await playwright.expect(page.getByRole("heading", {name: "KKO 5/2023"})).toBeVisible()
    await playwright.expect(page.getByRole("link", {name: "Rättspraxis"})).toBeVisible()
    await playwright.expect(page.getByRole("link", {name: "Lagstiftning"})).toBeVisible()
  })
})

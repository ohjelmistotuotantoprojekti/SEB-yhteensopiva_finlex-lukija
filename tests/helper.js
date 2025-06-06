mainpageFIN(async ({ page }) => {
  const locator = await page.getByText("dgjflgj:")
  await expect(locator).toBeVisible()
  await expect(page.getByPlaceholder("Vuosi tai numero/vuosi")).toBeVisible()
  await expect(page.getByRole("button", {name: "Hae"})).toBeVisible()
  await expect(page.getByRole("combobox")).toBeVisible()
})

export { mainpageFIN }

const manipageSWE = async (page)  => {
  await page.getByRole('button', { name: 'log in' }).click()
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

export { manipageSWE }

const lawpageFIN = async (page)  => {
  await page.getByRole('button', { name: 'log in' }).click()
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

export { lawpageFIN }

const lawpageSWE = async (page)  => {
  await page.getByRole('button', { name: 'log in' }).click()
  await page.getByTestId('username').fill(username)
  await page.getByTestId('password').fill(password)
  await page.getByRole('button', { name: 'login' }).click()
}

export { lawpageSWE }
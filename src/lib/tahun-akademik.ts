export function getTahunAkademikOptions(): string[] {
  const currentYear = new Date().getFullYear();
  const options: string[] = [];

  for (let i = 4; i >= 0; i--) {
    const startYear = currentYear - i;
    const endYear = startYear + 1;
    options.push(`${startYear}/${endYear} Ganjil`);
    options.push(`${startYear}/${endYear} Genap`);
  }

  return options;
}

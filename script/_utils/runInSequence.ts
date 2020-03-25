const SUCCESS = 0

export default async function runInSequence(
  ...mains: Array<() => Promise<number>>
): Promise<number> {
  for (const main of mains) {
    const status = await main()

    if (status !== SUCCESS) {
      return status
    }
  }

  return SUCCESS
}

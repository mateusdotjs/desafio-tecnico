export default async function () {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await (globalThis as any).__PG__?.stop();
}

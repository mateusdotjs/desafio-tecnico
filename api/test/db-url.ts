export function dbUrl(base: string, dbName: string) {
  const u = new URL(base);
  u.pathname = `/${dbName}`;
  return u.toString();
}

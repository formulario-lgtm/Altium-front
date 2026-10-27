/** Preview only: the API assigns the final unique suffix when creating the user. */
export function usernamePreview(firstName: string, lastName: string): string {
  const clean = (value: string) =>
    value
      .normalize('NFD')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
  return (clean(firstName).slice(0, 1) + clean(lastName)).slice(0, 80) || 'usuario';
}

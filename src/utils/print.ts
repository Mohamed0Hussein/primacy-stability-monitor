// Prints only one #printable-<target> section at a time. Needed because a
// page/modal can contain more than one printable block (e.g. the product
// modal's "Last Submitted Results" and "Stability Reports" sections) — without
// this, printing either one would print both, since CSS alone can't tell
// which button was clicked.
export function printSection(target: string) {
  const className = `print-target-${target}`
  document.body.classList.add(className)
  window.print()
  document.body.classList.remove(className)
}

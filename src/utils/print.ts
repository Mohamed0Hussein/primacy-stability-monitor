// Prints only the element with the given id, hiding everything else on the
// page/modal. Needed because a page/modal can contain more than one
// printable block (e.g. two conditions' reports, or a modal's "Last
// Submitted Results" alongside a report) — CSS alone can't tell which one's
// print button was clicked, so we mark the target right before printing.
export function printSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.classList.add('print-active')
  window.print()
  el.classList.remove('print-active')
}

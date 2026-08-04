export function isFormElementTarget(target) {
  const tagName = target?.tagName?.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target?.isContentEditable
  );
}

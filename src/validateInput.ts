export function validateInput(firstIdPart:string, secondIdPart:string) {
  const idPattern = /^\d{4}$/;

  if (!idPattern.test(firstIdPart) || !idPattern.test(secondIdPart)) {
    alert("IDの各部分には4桁の数字を入力してください。");
    return false;
  }

  return true;
}

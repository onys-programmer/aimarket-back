// 임시 비밀번호 생성 함수
const generateTempPassword = () => {
  // 임시 비밀번호 생성 로직을 구현해야 합니다.
  // 예시로 랜덤한 8자리 문자열을 생성하도록 하겠습니다.
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let temporaryPassword = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    temporaryPassword += characters.charAt(randomIndex);
  }
  return temporaryPassword;
};

module.exports = generateTempPassword;

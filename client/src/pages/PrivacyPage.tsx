export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">개인정보취급방침</h1>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">제1조 (개인정보의 수집 및 이용 목적)</h2>
          <p>콜드카우(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>회원 가입 및 관리: 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리</li>
            <li>서비스 제공: AI 기반 이미지 분석 및 생성 서비스 제공</li>
            <li>결제 처리: 크레딧 구매 및 결제 관련 처리</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제2조 (수집하는 개인정보의 항목)</h2>
          <p>회사는 다음의 개인정보 항목을 수집합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>필수항목: 이메일 주소, 비밀번호, 닉네임</li>
            <li>선택항목: 프로필 이미지</li>
            <li>자동 수집 항목: 접속 IP, 접속 일시, 서비스 이용 기록</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제3조 (개인정보의 보유 및 이용기간)</h2>
          <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보 수집 시에 동의 받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>회원 정보: 회원 탈퇴 시까지</li>
            <li>결제 기록: 5년 (전자상거래법)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제4조 (개인정보의 제3자 제공)</h2>
          <p>회사는 정보주체의 개인정보를 제1조에서 명시한 범위 내에서만 처리하며, 정보주체의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제5조 (정보주체의 권리·의무 및 행사방법)</h2>
          <p>정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>개인정보 열람 요구</li>
            <li>오류 등이 있을 경우 정정 요구</li>
            <li>삭제 요구</li>
            <li>처리정지 요구</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제6조 (개인정보 보호책임자)</h2>
          <ul className="list-none space-y-1">
            <li>성명: 이찬우</li>
            <li>연락처: 010-6558-0068</li>
          </ul>
        </section>

        <p className="text-xs text-muted-foreground/70 pt-4">
          시행일자: 2024년 1월 1일
        </p>
      </div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">이용약관</h1>

      <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-muted-foreground">
        <section>
          <h2 className="text-lg font-semibold text-foreground">제1조 (목적)</h2>
          <p>이 약관은 콜드카우(이하 "회사")가 운영하는 AI PORT 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제2조 (정의)</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>"서비스"란 회사가 제공하는 AI 기반 이미지 분석, 생성 및 관련 서비스를 말합니다.</li>
            <li>"회원"이란 회사와 서비스 이용계약을 체결하고 회원 아이디를 부여받은 자를 말합니다.</li>
            <li>"크레딧"이란 서비스 이용을 위해 필요한 가상 화폐를 말합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제3조 (서비스의 제공)</h2>
          <p>회사는 다음과 같은 서비스를 제공합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>AI 기반 이미지 분석 서비스 (얼굴 분석, 관상, 손금 등)</li>
            <li>AI 기반 이미지 생성 서비스 (프로필 생성, 캐리커처 등)</li>
            <li>AI 기반 운세 및 심리 분석 서비스</li>
            <li>기타 회사가 정하는 서비스</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제4조 (회원가입)</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.</li>
            <li>회사는 회원가입 신청에 대하여 승낙함을 원칙으로 합니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제5조 (크레딧 및 결제)</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>서비스 이용을 위해서는 크레딧이 필요하며, 크레딧은 유료로 구매할 수 있습니다.</li>
            <li>크레딧은 1회 최대 10만원까지 충전할 수 있습니다.</li>
            <li>결제는 토스페이먼츠를 통해 안전하게 처리됩니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제6조 (충전된 포인트에 대한 환불 정책)</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>충전된 포인트의 이용기간과 환불가능기간은 결제시점으로부터 1년 이내로 제한됩니다.</li>
            <li>다음의 경우 환불이 가능합니다:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>구매일로부터 7일 이내, 사용하지 않은 크레딧</li>
                <li>회사의 귀책사유로 결제 오류가 발생한 경우</li>
                <li>회사의 귀책사유로 서비스가 중단되는 경우</li>
              </ul>
            </li>
            <li>환불 요청은 고객센터(010-6558-0068)를 통해 접수해 주세요.</li>
            <li>환불 시 결제 수수료를 제외한 금액이 환불됩니다.</li>
            <li>이미 사용한 크레딧은 환불 대상에서 제외됩니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제7조 (회원의 의무)</h2>
          <p>회원은 다음 행위를 하여서는 안됩니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>타인의 정보 도용</li>
            <li>회사가 게시한 정보의 변경</li>
            <li>서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제, 배포하는 행위</li>
            <li>저작권 등 제3자의 권리를 침해하는 행위</li>
            <li>기타 관계 법령에 위배되는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제8조 (면책조항)</h2>
          <ol className="list-decimal pl-5 space-y-1">
            <li>회사는 AI가 생성한 결과물의 정확성, 신뢰성을 보장하지 않습니다.</li>
            <li>서비스에서 제공하는 운세, 심리분석 등의 결과는 오락 목적으로만 제공되며, 의료, 법률, 금융 등의 전문적인 조언을 대체하지 않습니다.</li>
            <li>회원이 서비스 이용 중 발생한 손해에 대해 회사는 고의 또는 중과실이 없는 한 책임을 지지 않습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">제9조 (분쟁해결)</h2>
          <p>본 약관에서 정하지 아니한 사항과 이 약관의 해석에 관하여는 관계법령 또는 상관례에 따릅니다.</p>
        </section>

        <p className="text-xs text-muted-foreground/70 pt-4">
          시행일자: 2024년 1월 1일
        </p>
      </div>
    </div>
  );
}

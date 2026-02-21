import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "개인정보 처리방침 - 사탕",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-[#EDE9FE]">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center gap-3 mb-10">
          <Link href="/login">
            <Image
              src="/images/logo.png"
              alt="Satang"
              width={36}
              height={24}
              className="h-6 w-auto"
            />
          </Link>
          <h1 className="text-2xl font-bold text-text-primary">
            개인정보 처리방침
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8 text-sm text-text-secondary leading-relaxed">
          <p className="text-text-muted">시행일: 2025년 6월 1일</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              1. 개인정보의 수집 항목 및 방법
            </h2>
            <p>
              사탕(이하 &quot;서비스&quot;)은 Google OAuth를 통한 로그인 시 다음
              정보를 수집합니다.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>이메일 주소</li>
              <li>프로필 이름</li>
              <li>프로필 사진 URL</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              2. 개인정보의 수집 및 이용 목적
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>서비스 계정 생성 및 사용자 식별</li>
              <li>서비스 제공 및 운영</li>
              <li>고객 문의 대응</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              3. 개인정보의 보유 및 이용 기간
            </h2>
            <p>
              회원 탈퇴 시 수집된 개인정보는{" "}
              <strong className="text-text-primary">즉시 파기</strong>합니다.
              다만, 관계 법령에 의해 보존이 필요한 경우 해당 법령에서 정한 기간
              동안 보관합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              4. 개인정보의 제3자 제공
            </h2>
            <p>
              서비스는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지
              않습니다. 다만, 다음의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의하거나 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              5. 개인정보의 파기 절차 및 방법
            </h2>
            <p>
              이용자의 개인정보는 수집 목적이 달성되거나 회원 탈퇴 시 즉시
              파기합니다. 전자적 파일 형태의 정보는 복구 불가능한 방법으로
              영구 삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나
              소각합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              6. 이용자의 권리와 행사 방법
            </h2>
            <p>
              이용자는 언제든지 자신의 개인정보에 대해 열람, 수정, 삭제,
              처리정지를 요구할 수 있습니다. 서비스 내 설정 페이지에서 직접
              처리하거나, 아래 연락처로 요청하실 수 있습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              7. 개인정보의 안전성 확보 조치
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>모든 데이터 전송 시 SSL/TLS 암호화 적용</li>
              <li>비밀번호 등 인증 정보의 암호화 저장</li>
              <li>접근 권한 최소화 및 관리</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              8. 준거법
            </h2>
            <p>
              본 개인정보 처리방침은 대한민국 「개인정보 보호법」 및 관련 법령을
              준수하며, 대한민국 법률에 따라 해석됩니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              9. 개인정보 보호책임자
            </h2>
            <p>
              개인정보 처리에 관한 문의는 아래 연락처로 접수해 주세요.
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>이메일: revfactory@gmail.com</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              10. 개인정보 처리방침의 변경
            </h2>
            <p>
              본 방침이 변경되는 경우, 변경 사항은 서비스 내 공지를 통해
              안내합니다.
            </p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            ← 로그인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

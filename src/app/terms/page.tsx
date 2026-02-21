import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "서비스 이용약관 - 사탕",
};

export default function TermsPage() {
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
            서비스 이용약관
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 space-y-8 text-sm text-text-secondary leading-relaxed">
          <p className="text-text-muted">시행일: 2025년 6월 1일</p>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              제1조 (목적)
            </h2>
            <p>
              본 약관은 사탕(이하 &quot;서비스&quot;)의 이용과 관련하여
              서비스 제공자와 이용자 간의 권리, 의무 및 책임 사항을 규정함을
              목적으로 합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              제2조 (정의)
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                &quot;서비스&quot;란 사탕이 제공하는 AI 기반 지식 노트북
                서비스를 의미합니다.
              </li>
              <li>
                &quot;이용자&quot;란 본 약관에 동의하고 서비스를 이용하는 자를
                의미합니다.
              </li>
              <li>
                &quot;콘텐츠&quot;란 이용자가 서비스에 업로드하거나 서비스를
                통해 생성한 텍스트, 이미지, 파일 등 모든 자료를 의미합니다.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              제3조 (약관의 효력 및 변경)
            </h2>
            <ul className="list-decimal pl-5 space-y-1">
              <li>
                본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게
                공지함으로써 효력을 발생합니다.
              </li>
              <li>
                서비스는 합리적인 사유가 있는 경우 약관을 변경할 수 있으며,
                변경 시 적용일자 및 변경사유를 명시하여 공지합니다.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              제4조 (서비스의 제공)
            </h2>
            <p>서비스는 다음의 기능을 제공합니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>소스 자료 업로드 및 관리</li>
              <li>AI 기반 채팅 및 질의응답</li>
              <li>인포그래픽, 슬라이드, 마인드맵 등 자동 생성</li>
              <li>노트북 공유 기능</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              제5조 (이용자의 의무)
            </h2>
            <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>타인의 개인정보를 도용하는 행위</li>
              <li>서비스의 운영을 방해하는 행위</li>
              <li>법령 또는 공서양속에 위배되는 콘텐츠를 업로드하는 행위</li>
              <li>서비스를 이용하여 제3자의 권리를 침해하는 행위</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              제6조 (콘텐츠의 권리)
            </h2>
            <ul className="list-decimal pl-5 space-y-1">
              <li>
                이용자가 업로드한 콘텐츠의 저작권은 해당 이용자에게 귀속됩니다.
              </li>
              <li>
                서비스는 이용자의 콘텐츠를 서비스 제공 목적으로만 사용하며,
                해당 목적 외 용도로 이용하지 않습니다.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              제7조 (서비스의 성격 및 종료)
            </h2>
            <ul className="list-decimal pl-5 space-y-1">
              <li>
                본 서비스는 Claude Code를 활용하여 빠른 서비스 구축을 위해
                시범 운영하는 서비스입니다.
              </li>
              <li>
                서비스는 사전 고지 없이 언제든지 종료될 수 있으며, 서비스
                종료 시 이용자의 데이터는 즉시 파기됩니다.
              </li>
              <li>
                시스템 점검, 장비 교체 및 고장, 통신 장애 등 불가피한 사유가
                있는 경우 서비스 제공을 일시적으로 중단할 수 있습니다.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              제8조 (면책 조항)
            </h2>
            <ul className="list-decimal pl-5 space-y-1">
              <li>
                서비스는 AI가 생성한 콘텐츠의 정확성, 완전성을 보장하지
                않습니다.
              </li>
              <li>
                이용자가 서비스를 통해 생성하거나 공유한 콘텐츠에 대한 책임은
                이용자 본인에게 있습니다.
              </li>
              <li>
                천재지변 또는 이에 준하는 불가항력으로 인해 서비스를 제공할 수
                없는 경우 서비스는 책임을 지지 않습니다.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              제9조 (회원 탈퇴 및 자격 상실)
            </h2>
            <ul className="list-decimal pl-5 space-y-1">
              <li>
                이용자는 언제든지 서비스 내 설정을 통해 탈퇴를 요청할 수
                있습니다.
              </li>
              <li>
                탈퇴 시 이용자의 개인정보 및 콘텐츠는 즉시 삭제됩니다. 단,
                관계 법령에 따라 보존이 필요한 정보는 해당 기간 동안
                보관됩니다.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-text-primary">
              제10조 (준거법 및 관할)
            </h2>
            <p>
              본 약관의 해석 및 서비스 이용에 관한 분쟁은 대한민국 법률을
              적용하며, 분쟁 발생 시 민사소송법에 따른 관할 법원에서
              해결합니다.
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

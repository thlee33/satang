/**
 * 소스 텍스트를 동적으로 할당하여 최대한 내용 손실 없이 결합합니다.
 *
 * 전체 한도(MAX_TOTAL_CHARS)를 소스 수에 따라 균등 분배하여,
 * 소스가 적을수록 더 많은 텍스트를 활용할 수 있습니다.
 *
 * 예시:
 *  - 소스 1개 → 최대 100,000자 사용
 *  - 소스 5개 → 각 20,000자
 *  - 소스 20개 → 각 5,000자
 */

const MAX_TOTAL_CHARS = 100_000;

interface Source {
  title: string;
  extracted_text: string | null;
}

export function buildSourceTexts(
  sources: Source[],
  maxTotal: number = MAX_TOTAL_CHARS
): string {
  const perSource = Math.floor(maxTotal / sources.length);

  return sources
    .map((s) => `[${s.title}]\n${(s.extracted_text || "").slice(0, perSource)}`)
    .join("\n\n");
}

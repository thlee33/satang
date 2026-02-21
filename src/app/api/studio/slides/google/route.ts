import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const SLIDES_API = "https://slides.googleapis.com/v1/presentations";
const API_KEY = process.env.GOOGLE_SLIDE_API_KEY;

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { imageUrls, title, providerToken } = await request.json();

    if (!providerToken) {
      return NextResponse.json(
        { error: "Google 인증 토큰이 필요합니다. 다시 로그인해주세요." },
        { status: 401 }
      );
    }

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "이미지 URL이 필요합니다." },
        { status: 400 }
      );
    }

    // 1. 빈 프레젠테이션 생성
    const createRes = await fetch(`${SLIDES_API}?key=${API_KEY}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${providerToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: title || "Slides" }),
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      console.error("[GoogleSlides] 프레젠테이션 생성 실패:", JSON.stringify(err, null, 2));
      const googleMsg = err?.error?.message || "";
      const status = err?.error?.status || "";

      // API 미활성화
      if (status === "PERMISSION_DENIED" || googleMsg.includes("not been used") || googleMsg.includes("disabled")) {
        return NextResponse.json(
          { error: "Google Slides API가 활성화되지 않았습니다. Google Cloud Console에서 Google Slides API를 사용 설정해주세요.", detail: googleMsg },
          { status: 403 }
        );
      }
      // 스코프 부족 (토큰 권한 없음)
      if (googleMsg.includes("insufficient") || googleMsg.includes("scope") || status === "UNAUTHENTICATED") {
        return NextResponse.json(
          { error: "Google Slides 권한이 없습니다. 로그아웃 후 다시 로그인해주세요.", detail: googleMsg },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: `프레젠테이션 생성 실패: ${googleMsg || createRes.statusText}`, detail: googleMsg },
        { status: createRes.status }
      );
    }

    const presentation = await createRes.json();
    const presentationId = presentation.presentationId;

    // 첫 자동 생성 슬라이드 ID
    const firstSlideId = presentation.slides?.[0]?.objectId;

    // 2. batchUpdate: 추가 슬라이드 생성 + 이미지 삽입
    const requests: unknown[] = [];

    // 슬라이드 ID 목록 (첫 번째는 이미 있음)
    const slideIds: string[] = [firstSlideId];

    // 추가 슬라이드 생성 (2번째부터)
    for (let i = 1; i < (imageUrls as string[]).length; i++) {
      const newSlideId = `slide_${i}`;
      slideIds.push(newSlideId);
      requests.push({
        createSlide: {
          objectId: newSlideId,
          insertionIndex: i,
          slideLayoutReference: { predefinedLayout: "BLANK" },
        },
      });
    }

    // 각 슬라이드에 이미지 삽입 (16:9, 전체 화면)
    (imageUrls as string[]).forEach((url: string, i: number) => {
      requests.push({
        createImage: {
          url,
          elementProperties: {
            pageObjectId: slideIds[i],
            size: {
              width: { magnitude: 9144000, unit: "EMU" },   // 10 inches
              height: { magnitude: 5143500, unit: "EMU" },   // 5.625 inches (16:9)
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 0,
              translateY: 0,
              unit: "EMU",
            },
          },
        },
      });
    });

    const batchRes = await fetch(
      `${SLIDES_API}/${presentationId}:batchUpdate?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${providerToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requests }),
      }
    );

    if (!batchRes.ok) {
      const err = await batchRes.json();
      console.error("[GoogleSlides] batchUpdate 실패:", err);
      return NextResponse.json(
        { error: "슬라이드 구성에 실패했습니다." },
        { status: batchRes.status }
      );
    }

    const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;

    return NextResponse.json({ url: presentationUrl });
  } catch (error) {
    console.error("[GoogleSlides] 에러:", error);
    return NextResponse.json(
      { error: "Google Slides 내보내기에 실패했습니다." },
      { status: 500 }
    );
  }
}

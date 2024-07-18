import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "https://fewlio-lluna.github.io/Vaddict_Graph/", // 許可するオリジン
  "Access-Control-Allow-Methods": "GET", // 許可するメソッド
  "Access-Control-Allow-Headers": "Content-Type", // 許可するリクエストヘッダー
};

export const GET = async (req: NextRequest) => {
  const playerId = req.nextUrl.searchParams.get("player_id");

  const request = await fetch(
    `https://vaddict.b35.jp/history.php?player_id=${playerId}&item1=pl_played_count&item2=pl_volforce&order=asc`
  );

  const text = await request.text();

  // console.log(text);

  return NextResponse.json({ text: text }, { status: 200, headers: corsHeaders });
};

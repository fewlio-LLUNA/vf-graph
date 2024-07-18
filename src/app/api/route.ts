import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const playerId = req.nextUrl.searchParams.get('player_id')

    const request = await fetch(`https://vaddict.b35.jp/history.php?player_id=${playerId}&item1=pl_played_count&item2=pl_volforce&order=asc`)

    const text = await request.text()

    // console.log(text);
    
    return NextResponse.json({text: text}, {status: 200})
}
"use client";
import { Chart, ChartOptions, registerables } from "chart.js";
import "./page.module.css";
import { useEffect, useState } from "react";
import { validateInput } from "@/validateInput";
import { load } from "cheerio";
import { Line } from "react-chartjs-2";
import dayjs from "dayjs";

Chart.register(...registerables);

interface PlayData {
  playedDate: string;
  playedCount: number;
  volforce: number;
}

const getData = (key: string) => {
  if (typeof window !== 'undefined') {
    const item = localStorage.getItem(key)
    return item ? item : ""
  }
  return ""
}

export default function Home() {
  const [firstIdPart, setFirstIdPart] = useState(
    getData("firstIdPart")
  );
  const [secondIdPart, setSecondIdPart] = useState(
    getData('secondIdPart')
  );
  const [playerData, setPlayerData] = useState<PlayData[] | null>(null);
  const [xAxis, setXAxis] = useState("playedDate");
  const [error, setError] = useState<string | null>(null);
  const [yAxisMin, setYAxisMin] = useState(0);
  const [yAxisMax, setYAxisMax] = useState(20);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    localStorage.setItem("firstIdPart", firstIdPart);
    localStorage.setItem("secondIdPart", secondIdPart);
  }, [firstIdPart, secondIdPart]);

  const handleFetchData = async () => {
    if (!validateInput(firstIdPart, secondIdPart)) {
      return;
    }

    // SV-4527-0407
    const playerId = `SV-${firstIdPart}-${secondIdPart}`;
    const url = `/api?player_id=${playerId}`;

    console.log(`Fetching data from: ${url}`);

    try {
      const response = await fetch(url);
      const {text} = await response.json();
      const $ = load(text);

      console.log("Fetched HTML:", $.html());

      const rows = $("table.history tr");
      const data: PlayData[] = [];

      rows.each((index, row) => {
        if (index === 0) return;

        const columns = $(row).find("td");
        const playedDateRaw = $(columns[0]).text();
        const playedDate = playedDateRaw.slice(0, 10); // YYYY/MM/DD のみ抽出
        const playedCount = $(columns[1]).text();
        const volforce = $(columns[2]).text();

        console.log("Row data:", { playedDate, playedCount, volforce });
        data.push({
          playedDate,
          playedCount: parseInt(playedCount, 10),
          volforce: parseFloat(volforce),
        });
      });

      const playerName = $('td.item:contains("Player Name")').next().text();
      console.log("Player name:", playerName);

      setPlayerData(data);
      setPlayerName(playerName);
      setError(null);
    } catch (error) {
      console.error("Fetch error:", error);
      setError("データの取得に失敗しました。");
    }
  };

  const data = {
    labels: playerData
      ? playerData.map((item) =>
          xAxis === "playedCount" ? item.playedCount : item.playedDate
        )
      : [],
    datasets: [
      {
        label: "VOLFORCE",
        data: playerData ? playerData.map((item) => item.volforce) : [],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: false,
      },
    ],
  };

  const options:ChartOptions<'line'> = {
    scales: {
      x: {
        type: "category",
        title: {
          display: true,
          text: xAxis === "playedCount" ? "プレー回数" : "データ更新日",
        },
        ticks: {
          autoSkip: false,
          font: {
            size: 8,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "VOLFORCE",
        },
        min: yAxisMin,
        max: yAxisMax,
      },
    },
  };

  return (
    <div className="App">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/title.png" alt="Vaddict-GRAPH" className="titleLogo" />
      {/* <h1>Vaddict-GRAPH</h1> */}
      {playerName && <h2>- {playerName} さんのVF推移 -</h2>}
      <div className="playerID">
        <label>
          PlayerID: SV-
          <input
            type="text"
            value={firstIdPart}
            onChange={(e) => setFirstIdPart(e.target.value)}
            maxLength={4}
          />
          -
          <input
            type="text"
            value={secondIdPart}
            onChange={(e) => setSecondIdPart(e.target.value)}
            maxLength={4}
          />
        </label>
      </div>
      <div className="vfMaxMin">
        <label>
          VF最小値:
          <select
            value={yAxisMin}
            onChange={(e) => setYAxisMin(Number(e.target.value))}
          >
            {Array.from({ length: 24 }, (_, i) => i).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <br />
        <label>
          VF最大値:
          <select
            value={yAxisMax}
            onChange={(e) => setYAxisMax(Number(e.target.value))}
          >
            {Array.from({ length: 24 }, (_, i) => i).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button className="execute" onClick={handleFetchData}>
        グラフ出力
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {playerData && (
        <div>
          <div>
            <button className="option" onClick={() => setXAxis("playedDate")}>
              データ更新日
            </button>
            <button className="option" onClick={() => setXAxis("playedCount")}>
              プレー回数
            </button>
          </div>
          <div style={{ width: "1000px", height: "500px" }}>
            <Line data={data} options={options} />
          </div>
        </div>
      )}
      <div className="guide">
        
      </div>
      <div className="credit">
        このWEBアプリは
        <a href="https://vaddict.b35.jp/">Vaddict</a>
        様のご協力によって公開しております。
      </div>
    </div>
  );
}

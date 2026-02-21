export type DayForecast = {
  date: string;
  dayLabel: string;
  min?: string;
  max?: string;
  rain?: string;
  rainChance?: string;
  summary?: string;
};

function extractTagValue(block: string, tag: "element" | "text", type: string): string | undefined {
  const regex = new RegExp(`<${tag}[^>]*type=\"${type}\"[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  return block.match(regex)?.[1]?.trim();
}

export function parseSydneyForecastFromBomXml(xml: string): DayForecast[] {
  const sydneyBlockMatch = xml.match(/<area[^>]*description="Sydney"[^>]*type="location"[\s\S]*?<\/area>/);
  if (!sydneyBlockMatch) return [];

  const sydneyBlock = sydneyBlockMatch[0];
  const periodMatches = [...sydneyBlock.matchAll(/<forecast-period\b[\s\S]*?<\/forecast-period>/g)];

  return periodMatches.slice(0, 7).map((m) => {
    const block = m[0];
    const startLocal = block.match(/start-time-local="([^"]+)"/)?.[1] ?? "";
    const dt = startLocal ? new Date(startLocal) : new Date();

    return {
      date: startLocal,
      dayLabel: dt.toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" }),
      min: extractTagValue(block, "element", "air_temperature_minimum"),
      max: extractTagValue(block, "element", "air_temperature_maximum"),
      rain: extractTagValue(block, "element", "precipitation_range"),
      rainChance: extractTagValue(block, "text", "probability_of_precipitation"),
      summary: extractTagValue(block, "text", "precis"),
    };
  });
}

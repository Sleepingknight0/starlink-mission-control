import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(rootDir, "assets", "data");

const sources = [
  {
    key: "starlink_availability",
    url: "https://starlink.com/public-files/availability.json",
    file: "availability.json",
    accept: "application/json",
    validate(buffer) {
      const data = JSON.parse(buffer.toString("utf8"));
      if (!data.admin0 || Object.keys(data.admin0).length < 100) {
        throw new Error("availability.json is missing the expected admin0 data");
      }
    },
  },
  {
    key: "starlink_availability_cells",
    url: "https://starlink.com/public-files/availability-cells.pb",
    file: "availability-cells.pb",
    accept: "application/x-protobuf, application/octet-stream;q=0.9, */*;q=0.8",
    validate(buffer) {
      if (buffer.length < 100 || buffer.toString("utf8", 0, 100).trimStart().startsWith("<")) {
        throw new Error("availability-cells.pb does not look like protobuf data");
      }
    },
  },
  {
    key: "natural_earth_admin0_50m",
    url: "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson",
    file: "ne_50m_admin_0_countries.geojson",
    accept: "application/geo+json, application/json;q=0.9, text/plain;q=0.8",
    validate(buffer) {
      const data = JSON.parse(buffer.toString("utf8"));
      if (data.type !== "FeatureCollection" || data.features?.length < 100) {
        throw new Error("Natural Earth response is not the expected country FeatureCollection");
      }
    },
  },
];

async function download(source) {
  const headers = {
    Accept: source.accept,
    "Cache-Control": "no-cache",
    "User-Agent": "StarlinkMapSnapshot/1.0 (+local development)",
  };

  if (source.url.startsWith("https://starlink.com/")) {
    headers.Origin = "https://starlink.com";
    headers.Referer = "https://starlink.com/map/";
  }

  const response = await fetch(source.url, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`${source.url} returned HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  source.validate(buffer);
  return { ...source, buffer };
}

await mkdir(outputDir, { recursive: true });

const downloads = await Promise.all(sources.map(download));
await Promise.all(
  downloads.map(({ file, buffer }) => writeFile(path.join(outputDir, file), buffer)),
);

const metadata = {
  fetched_at: new Date().toISOString(),
  sources: Object.fromEntries(
    downloads.map(({ key, url, file, buffer }) => [
      key,
      { url, file, bytes: buffer.length },
    ]),
  ),
};

await writeFile(
  path.join(outputDir, "starlink-map-metadata.json"),
  `${JSON.stringify(metadata, null, 2)}\n`,
);

for (const { file, buffer } of downloads) {
  console.log(`${file}: ${buffer.length.toLocaleString("en-US")} bytes`);
}
console.log(`starlink-map-metadata.json: ${metadata.fetched_at}`);

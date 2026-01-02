import path from "node:path";
import fs from "node:fs/promises";
import sharp from "sharp";
import { Upload } from "@aws-sdk/lib-storage";
import { type PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import assert from "node:assert";

assert(process.env.AWS_ACCESS_KEY_ID, "AWS_ACCESS_KEY_ID is required");
assert(process.env.AWS_SECRET_ACCESS_KEY, "AWS_SECRET_ACCESS_KEY is required");
assert(process.env.AWS_REGION, "AWS_REGION is required");
assert(process.env.AWS_ENDPOINT, "AWS_ENDPOINT is required");
assert(process.env.AWS_BUCKET, "AWS_BUCKET is required");
assert(process.env.CDN_BASE_URL, "CDN_BASE_URL is required");
assert(process.env.API_BASE_URL, "API_BASE_URL is required");
assert(process.env.API_AUTH_TOKEN, "API_AUTH_TOKEN is required");

const SKIP_PROJECT = false;
const SKIP_IMAGES = true;

const PREFIX = "fan_made_content";
const PROJECT_DIR = path.join(process.cwd(), "projects");

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
  endpoint: process.env.AWS_ENDPOINT,
  region: process.env.AWS_REGION,
});

await rehostProject(
  JSON.parse(
    await fs.readFile(
      path.join(PROJECT_DIR, `${process.argv[2]}.json`),
      "utf-8",
    ),
  ),
);

async function rehostProject(project: Project) {
  await Promise.all([
    rehostBanner(project),
    rehostCardImages(project),
    rehostIcons(project, "packs"),
    rehostIcons(project, "encounter_sets"),
  ]);

  const s3Path = makeS3Path(project.meta.code, "project.json");

  if (!SKIP_PROJECT) {
    project.meta.url = makeCdnUrl(s3Path);

    await upload(
      { s3Path, sourceUrl: "project.json" },
      JSON.stringify(project),
    );

    const res = await fetch(
      `${process.env.API_BASE_URL}/v1/admin/fan_made_project`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.API_AUTH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bucket_path: s3Path,
          meta: project.meta,
        }),
      },
    );

    assert(res.ok, `${res.status} - ${await res.text()}`);
  }
}

async function rehostBanner(project: Project) {
  const meta = project.meta;
  const projectCode = meta.code;

  if (meta.banner_url) {
    const ext = extname(meta.banner_url);
    if (ext) {
      const { s3Path } = await rehostFile(
        {
          sourceUrl: meta.banner_url,
          s3Path: makeS3Path(projectCode, `banner${ext}`),
        },
        true,
      );
      project.meta.banner_url = makeCdnUrl(s3Path);
    } else {
      console.warn(`No file extension: ${projectCode} / ${meta.banner_url}`);
    }
  }
}

async function rehostCardImages(project: Project) {
  const projectCode = project.meta.code;

  const imageKeys = [
    { key: "image_url", suffix: "" },
    { key: "back_image_url", suffix: "_back" },
    { key: "thumbnail_url", suffix: "_thumb" },
    { key: "back_thumbnail_url", suffix: "_back_thumb" },
  ];

  for (const [index, card] of project.data.cards.entries()) {
    const code = card.code;

    const images = imageKeys.reduce(
      (acc, { key, suffix }) => {
        const sourceUrl = card[key];
        if (!sourceUrl) return acc;

        const ext = extname(sourceUrl) || ".png";

        if (!ext) {
          console.warn(`No file extension: ${code} / ${sourceUrl}`);
          return acc;
        }

        acc.push({
          sourceUrl,
          s3Path: makeS3Path(projectCode, `${code}${suffix}${ext}`),
          key,
        });

        return acc;
      },
      [] as (UploadParams & { key: string })[],
    );

    for (const image of images) {
      try {
        const { s3Path, key } = await rehostFile(image, true);
        assert(key, `Key is required for ${image.sourceUrl}`);
        project.data.cards[index][key] = makeCdnUrl(s3Path);
      } catch (err) {
        console.error(
          `Failed to rehost image for card ${code}: ${image.sourceUrl}`,
          err,
        );
      }
    }
  }
}

async function rehostIcons(project: Project, key: "encounter_sets" | "packs") {
  const projectCode = project.meta.code;

  await Promise.all(
    project.data[key].map(async (set, index) => {
      const code = set.code;
      const sourceUrl = set.icon_url;

      if (sourceUrl) {
        const ext = extname(sourceUrl);
        const s3Path = makeS3Path(projectCode, `pack_${code}${ext}`);
        await rehostFile({ sourceUrl, s3Path }, false);
        project.data[key][index].icon_url = makeCdnUrl(s3Path);
      }
    }),
  );
}

async function rehostFile(params: UploadParams, compress = false) {
  const { sourceUrl } = params;
  // when skip images is true, we don't fetch the image.
  const response = skipImages(params.s3Path)
    ? new Response(Buffer.from([]))
    : await fetch(sourceUrl);

  assert(response.ok, `${sourceUrl} returned bad status: ${response.status}`);
  assert(response.body, `${sourceUrl} returned empty body.`);
  const s3Path = await upload(
    params,
    Buffer.from(await response.arrayBuffer()),
    compress,
  );
  return { ...params, s3Path };
}

async function upload(
  params: UploadParams,
  body: Buffer | string,
  compress = false,
) {
  const { s3Path: _s3Path, sourceUrl: _sourceUrl } = params;
  const sourceUrl = cleanPath(_sourceUrl);

  let s3Path = cleanPath(_s3Path);
  let uploadBuffer: PutObjectCommandInput["Body"];
  let contentType = inferContentType(sourceUrl);

  if (compress && typeof body !== "string" && contentType === "image/png") {
    if (!skipImages(s3Path)) {
      const buffer = await sharp(body).jpeg({ quality: 90 }).toBuffer();
      uploadBuffer = buffer;
    }
    contentType = "image/jpeg";
    s3Path = s3Path.replace(/\.png$/, ".jpg");
  } else {
    uploadBuffer = body;
  }

  if (!skipImages(s3Path) || contentType === "application/json") {
    console.info(`${s3Path} (${contentType})`);

    const upload = new Upload({
      client: s3Client,
      params: {
        Body: uploadBuffer,
        Bucket: process.env.AWS_BUCKET,
        ContentType: contentType,
        Key: s3Path,
      },
      leavePartsOnError: false,
    });

    await upload.done();
  }

  return s3Path;
}

function extname(p: string) {
  const ext = path.extname(cleanPath(p));
  return ext;
}

function inferContentType(url: string) {
  const ext = extname(url);
  if (ext === ".json") return "application/json";

  const type = ext.slice(1);
  return `image/${type || "png"}`;
}

function makeS3Path(code: string, filePath: string) {
  return `${PREFIX}/${code}/${filePath}`;
}

function makeCdnUrl(filePath: string) {
  return `${process.env.CDN_BASE_URL}/${filePath}`;
}

function cleanPath(path: string) {
  if (path.includes("?")) {
    return path.split("?")[0];
  }

  return path;
}

function skipImages(s3Path: string) {
  return SKIP_IMAGES && !s3Path.includes("banner");
}

type Project = {
  meta: {
    code: string;
    banner_url?: string;
    url?: string;
  };
  data: {
    cards: Array<{
      code: string;
      image_url?: string;
      back_image_url?: string;
      thumbnail_url?: string;
      back_thumbnail_url?: string;
    }>;
    encounter_sets: Array<{
      code: string;
      icon_url?: string;
    }>;
    packs: Array<{
      code: string;
      icon_url?: string;
    }>;
  };
};

type UploadParams = {
  sourceUrl: string;
  s3Path: string;
  key?: string;
};

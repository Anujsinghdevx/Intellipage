import { Liveblocks } from "@liveblocks/node";
import { logger } from "@/lib/logger";

const key = process.env.LIVEBLOCKS_SECRET_KEY;

if (!key) {
  logger.error("Missing LIVEBLOCKS_SECRET_KEY environment variable");
  throw new Error("Missing LIVEBLOCKS_SECRET_KEY environment variable");
}

const liveblocks = new Liveblocks({
  secret: key,
});

logger.info("Liveblocks client initialized");

export default liveblocks;

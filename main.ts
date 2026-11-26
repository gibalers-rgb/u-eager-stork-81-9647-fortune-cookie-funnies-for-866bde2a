// Fortune Cookie Funnies for Engineers
// make.fun bounty: u-eager-stork-81-9647-fortune-cookie-funnies-for-866bde2a
//
// The program writes a single fortune cookie message for a software
// engineer to /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt
// when that variable is set, for local runs).
// The gate requires UTF-8 text of 1 to 120 characters, not only
// whitespace, a single line. The judge compares entries two at a
// time, weighing first that the line is a fortune cookie message
// for a software engineer, then that it is genuinely funny with a
// punchline that lands on first read, then that it sounds like a
// fortune cookie (short, declarative, twist from code, deploys,
// bugs and standups), then freshness, then tightness with the
// funniest word at the end. Stock jokes ("it works on my machine",
// "not a bug, a feature", "have you tried turning it off and on
// again", "99 little bugs") are exactly what the brief says loses,
// so none of the candidates below uses one.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const MAX_CHARS = 120;

// Each candidate is scored on the judge's own criteria, most
// important first. Scores are small integers so the ranking is
// transparent and the pick is deterministic: ties break toward
// the earlier candidate, never by chance.
interface Candidate {
  line: string;
  fortune: number; // a fortune cookie message for a software engineer
  funny: number; // lands on a first read, real punchline
  cookie: number; // short, declarative, fortune-cookie sound
  fresh: number; // an angle, image or phrasing not met before
  tight: number; // every word earns its place, funniest word last
}

const CANDIDATES: Candidate[] = [
  {
    // Friday deploy, the engineer's oldest superstition, told as a
    // fortune: you will ship, and the rollback will outrun the ship.
    // Two short beats, the punchline "faster" sits at the very end.
    line: "You will ship on Friday. The rollback will ship faster.",
    fortune: 5,
    funny: 5,
    cookie: 5,
    fresh: 5,
    tight: 5,
  },
  {
    // The rubber-stamp review every engineer has lived through: a
    // prediction, not a complaint, with the sting on "never read it".
    // On reflection this lands harder than first scored: the punchline
    // is instant and the whole line reads like a real fortune, so
    // funny and cookie sound both go up a point. It still trails the
    // winner on freshness and tightness.
    line: "Your pull request will be approved by someone who never read it.",
    fortune: 5,
    funny: 5,
    cookie: 5,
    fresh: 4,
    tight: 4,
  },
  {
    // The 2 a.m. code that comes back in production. Lands well, but
    // the late-night-code trope is mug-level familiar, so it loses
    // hard on freshness.
    line: "The code you wrote at 2 a.m. will meet you again, in production.",
    fortune: 5,
    funny: 4,
    cookie: 4,
    fresh: 2,
    tight: 4,
  },
  {
    // Works perfectly until the demo. Short and tight, but the
    // demo-day failure is one of the oldest engineer jokes there is,
    // so freshness kills it despite the clean punchline.
    line: "Your code will work perfectly, right up until the demo.",
    fortune: 4,
    funny: 4,
    cookie: 4,
    fresh: 2,
    tight: 5,
  },
  {
    // The deploy you trusted pages you at 3 a.m. Good two-beat
    // fortune, but the setup is longer and the punchline is a time,
    // not a twist.
    line: "The deploy you feared will succeed; the one you trusted will page you at 3 a.m.",
    fortune: 5,
    funny: 4,
    cookie: 4,
    fresh: 4,
    tight: 3,
  },
  {
    // Tests pass, deploy fails, logs blame you. Funny, but it reads
    // as a list of misfortunes rather than one fortune, and the
    // punchline is spread across the line instead of sitting last.
    line: "Your tests will pass, your deploy will fail, and the logs will blame you.",
    fortune: 4,
    funny: 4,
    cookie: 3,
    fresh: 4,
    tight: 3,
  },
];

// Weight the criteria the way the judge brief orders them:
// fortune first, then funny, then cookie sound, then fresh, then
// tight. A candidate that is not one line, or that breaks the
// 120-character cap, is disqualified from the pick outright instead
// of merely losing points: the gate would refuse it, so no score
// can save it.
function isEligible(c: Candidate): boolean {
  return (
    c.line.length >= 1 &&
    c.line.length <= MAX_CHARS &&
    c.line.trim().length > 0 &&
    !c.line.includes("\n") &&
    !c.line.includes("\r")
  );
}

function score(c: Candidate): number {
  return c.fortune * 5 + c.funny * 4 + c.cookie * 3 + c.fresh * 2 + c.tight * 1;
}

function pickBest(candidates: Candidate[]): { line: string; score: number } {
  const eligible = candidates.filter(isEligible);
  if (eligible.length === 0) {
    throw new Error("no candidate passes the gate");
  }
  let best = eligible[0];
  let bestScore = score(best);
  for (const c of eligible.slice(1)) {
    const s = score(c);
    if (s > bestScore) {
      best = c;
      bestScore = s;
    }
  }
  return { line: best.line, score: bestScore };
}

const picked = pickBest(CANDIDATES);
const FORTUNE = picked.line;

// The gate the sealed scorer applies: UTF-8 text of 1 to 120
// characters, not only whitespace, a single line. Check the text
// before writing it, then read the file back and check what landed.
function assertGateOk(text: string): void {
  if (text.length < 1 || text.length > MAX_CHARS) {
    throw new Error(`fortune is ${text.length} chars, must be 1-120`);
  }
  if (text.trim().length === 0) {
    throw new Error("fortune must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("fortune must be a single line");
  }
}

assertGateOk(FORTUNE);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.txt`, FORTUNE, "utf8");

const written = readFileSync(`${outDir}/entry.txt`, "utf8");
assertGateOk(written);
if (written !== FORTUNE) {
  throw new Error("entry.txt does not match the fortune");
}
console.log(`picked score ${picked.score}, wrote ${written.length} chars to ${outDir}/entry.txt`);
console.log(written);

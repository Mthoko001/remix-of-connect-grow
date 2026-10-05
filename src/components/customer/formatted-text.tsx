/** Renders free text as paragraphs, bullet lists and headings instead of one block. */
export function FormattedText({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let para: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push(
        <p key={blocks.length} className="text-sm leading-relaxed text-muted-foreground">
          {para.join(" ")}
        </p>,
      );
      para = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push(
        <ul key={blocks.length} className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {list.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    const bullet = /^([-*•]|\d+[.)])\s+(.*)$/.exec(line);
    const heading = /^#{1,6}\s+(.*)$/.exec(line) ?? (/^(.{2,60}):$/.exec(line));
    if (bullet) {
      flushPara();
      list.push(bullet[2] ?? "");
    } else if (heading) {
      flushPara();
      flushList();
      blocks.push(
        <h3 key={blocks.length} className="pt-2 text-sm font-bold text-foreground">
          {heading[1]}
        </h3>,
      );
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return <div className="space-y-3">{blocks}</div>;
}

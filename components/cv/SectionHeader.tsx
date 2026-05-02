type Props = {
  number: string;
  title: string;
  meta?: string;
};

export function SectionHeader({ number, title, meta }: Props) {
  return (
    <header className="section-header" data-reveal>
      <span className="kicker">{number}</span>
      <h2>{title}</h2>
      {meta ? <span className="meta">{meta}</span> : null}
    </header>
  );
}

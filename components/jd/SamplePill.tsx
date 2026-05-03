"use client";

type Props = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

export function SamplePill({ active, onClick, children }: Props) {
  return (
    <button type="button" className="jd-pill" aria-pressed={active} onClick={onClick}>
      <span aria-hidden="true" style={{ fontSize: "0.6rem", opacity: 0.6 }}>
        ◇
      </span>
      {children}
    </button>
  );
}

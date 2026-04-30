interface CommentBodyProps {
  body: string;
  className?: string;
}

const MENTION_PATTERN = /^@(\S+)(\s)([\s\S]*)$/;

export default function CommentBody({ body, className }: CommentBodyProps) {
  const match = body.match(MENTION_PATTERN);

  if (!match) {
    return <p className={className}>{body}</p>;
  }

  const [, name, space, rest] = match;

  return (
    <p className={className}>
      <span className="text-amber-100 font-medium">@{name}</span>
      {space}
      {rest}
    </p>
  );
}

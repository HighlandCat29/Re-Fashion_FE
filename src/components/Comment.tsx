type CommentProps = {
  name: string;
  text: string;
  time: string;
};

export const Comment = ({ name, text, time }: CommentProps) => (
  <div className="border p-3 rounded-lg bg-gray-50">
    <p className="font-semibold">{name}</p>
    <p className="text-gray-700">{text}</p>
    <p className="text-xs text-gray-400 mt-1">Like · Reply · {time}</p>
  </div>
);

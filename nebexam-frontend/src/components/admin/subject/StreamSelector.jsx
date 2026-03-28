const STREAMS = ['science', 'management'];

export default function StreamSelector({ value, onChange }) {
  const toggle = (stream) => {
    if (value.includes(stream)) {
      onChange(value.filter((s) => s !== stream));
    } else {
      onChange([...value, stream]);
    }
  };

  return (
    <div className="flex gap-3">
      {STREAMS.map((stream) => (
        <button
          key={stream}
          type="button"
          onClick={() => toggle(stream)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all capitalize ${
            value.includes(stream)
              ? 'bg-[#1CA3FD] text-white border-[#1CA3FD] shadow-sm shadow-[#1CA3FD]/20'
              : 'bg-white text-slate-600 border-slate-300 hover:border-[#1CA3FD] hover:text-[#1CA3FD]'
          }`}
        >
          {stream}
        </button>
      ))}
    </div>
  );
}

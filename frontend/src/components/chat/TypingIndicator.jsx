const TypingIndicator = () => (
  <div className="flex items-start gap-3 message-enter">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30 flex items-center justify-center shrink-0">
      <span className="text-xs font-mono font-bold text-accent-cyan">A</span>
    </div>
    <div className="bg-dark-700 border border-dark-600 rounded-2xl rounded-tl-sm px-4 py-3">
      <div className="flex items-center gap-1.5 h-5">
        <div className="w-2 h-2 rounded-full bg-accent-cyan typing-dot" />
        <div className="w-2 h-2 rounded-full bg-accent-cyan typing-dot" />
        <div className="w-2 h-2 rounded-full bg-accent-cyan typing-dot" />
      </div>
    </div>
  </div>
);

export default TypingIndicator;

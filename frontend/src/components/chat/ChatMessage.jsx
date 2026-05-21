import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-2 right-2 p-1.5 rounded text-gray-500 hover:text-white hover:bg-dark-600 transition-all"
      title="Copy code"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-accent-green" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
};

const CodeBlock = ({ children, className }) => {
  const language = /language-(\w+)/.exec(className || '')?.[1] || 'text';
  const code = String(children).replace(/\n$/, '');

  return (
    <div className="relative my-3 rounded-lg overflow-hidden border border-dark-600">
      <div className="flex items-center justify-between px-4 py-1.5 bg-dark-700 border-b border-dark-600">
        <span className="text-xs font-mono text-gray-500">{language}</span>
        <CopyButton text={code} />
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          background: 'rgb(15, 22, 41)',
          fontSize: '0.75rem',
          padding: '1rem',
        }}
        showLineNumbers={code.split('\n').length > 5}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 message-enter">
        <div className="max-w-[75%] space-y-1">
          <div className="bg-gradient-to-br from-accent-cyan/20 to-accent-cyan/10 border border-accent-cyan/30 rounded-2xl rounded-tr-sm px-4 py-3">
            <p className="text-sm text-white leading-relaxed">{message.content}</p>
          </div>
          <p className="text-xs text-gray-600 font-mono text-right pr-1">{time}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan/30 to-accent-purple/30 border border-dark-600 flex items-center justify-center shrink-0 mt-1">
          <span className="text-xs font-mono font-bold text-white">Y</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 message-enter">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 border border-accent-cyan/30 flex items-center justify-center shrink-0 mt-1 glow-cyan">
        <span className="text-xs font-mono font-bold text-accent-cyan">A</span>
      </div>
      <div className="max-w-[80%] space-y-1">
        <div className="text-xs font-mono text-accent-cyan/60 mb-1">Alex · Senior Engineer</div>
        <div className="bg-dark-700 border border-dark-600 rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="prose-chat">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  // Fenced markdown code blocks receive a language-* class; inline code does not.
                  if (/language-(\w+)/.test(className || '')) {
                    return <CodeBlock className={className}>{children}</CodeBlock>;
                  }
                  return (
                    <code className="bg-dark-800 text-accent-cyan px-1.5 py-0.5 rounded font-mono text-xs" {...props}>
                      {children}
                    </code>
                  );
                },
                pre({ children }) {
                  return <>{children}</>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        <p className="text-xs text-gray-600 font-mono pl-1">{time}</p>
      </div>
    </div>
  );
};

export default ChatMessage;

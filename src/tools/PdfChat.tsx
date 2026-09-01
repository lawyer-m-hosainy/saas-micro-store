import React, { useState, useRef } from 'react';
import { Upload, FileText, Send, Bot, User, FileUp } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
}

export function PdfChatDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'مرحباً! قم برفع ملف PDF وسأقوم بقراءته وتلخيصه أو الإجابة على أي سؤال يخصه.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsUploading(true);
      
      // محاكاة رفع الملف وتحليله
      setTimeout(() => {
        setIsUploading(false);
        setIsReady(true);
        setMessages(prev => [
          ...prev,
          { id: Date.now().toString(), sender: 'bot', text: `تم تحليل ملف "${selectedFile.name}" بنجاح! يحتوي الملف على حوالي 15 صفحة. يمكنك الآن سؤالي عن أي شيء داخله.` }
        ]);
      }, 2000);
    }
  };

  const sendMessage = () => {
    if (!input.trim() || !isReady) return;
    
    const newMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    setIsTyping(true);
    
    // التمرير لأسفل
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    // محاكاة رد الذكاء الاصطناعي
    setTimeout(() => {
      let reply = 'بناءً على محتوى الملف، يبدو أن هذا الجزء يتحدث عن تفاصيل العقد والشروط العامة.';
      if (input.includes('تلخيص') || input.includes('ملخص')) {
        reply = 'بناءً على الملف، هذا تلخيص سريع: الملف عبارة عن وثيقة قانونية توضح شروط التعاقد والالتزامات بين الطرفين، وتتكون من 3 أقسام رئيسية.';
      } else if (input.includes('تاريخ') || input.includes('سعر')) {
        reply = 'تم ذكر هذه المعلومة في الصفحة رقم 4 من المستند.';
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: reply }]);
      setIsTyping(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, 1500);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-indigo-900">أداة المحادثة مع الـ PDF (محاكي ذكي)</h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* رفع الملف */}
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 h-fit">
          <h4 className="font-bold text-gray-700 mb-4">المستند الحالي</h4>
          
          {!isReady ? (
            <div className="border-2 border-dashed border-indigo-200 bg-indigo-50 rounded-lg p-6 text-center transition-colors">
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange}
                className="hidden" 
                id="pdf-chat-upload"
              />
              <label htmlFor="pdf-chat-upload" className="cursor-pointer flex flex-col items-center">
                <FileUp className="text-indigo-500 mb-3" size={40} />
                <span className="text-sm font-bold text-indigo-700 mb-1">
                  {isUploading ? 'جاري التحليل...' : 'اضغط لرفع ملف PDF'}
                </span>
                <span className="text-xs text-indigo-400">الحد الأقصى: 10 ميجابايت</span>
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <FileText className="text-green-600" size={30} />
              <div className="overflow-hidden flex-grow">
                <p className="font-bold text-green-800 text-sm truncate">{file?.name}</p>
                <p className="text-xs text-green-600">جاهز للمحادثة</p>
              </div>
            </div>
          )}
        </div>

        {/* المحادثة */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col h-[500px]">
          
          {/* الرسائل */}
          <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-50/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-indigo-600'}`}>
                    {msg.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  
                  <div className={`p-3 rounded-2xl text-sm ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600 text-white rounded-tl-none' 
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                  
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-white border border-gray-200 text-indigo-600">
                    <Bot size={16} />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-gray-200 rounded-tr-none flex gap-1">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* صندوق الإدخال */}
          <div className="p-4 border-t border-gray-100 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
                placeholder={isReady ? "اسألني عن محتوى الملف..." : "يرجى رفع ملف أولاً للبدء"}
                disabled={!isReady || isTyping}
                className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:border-indigo-500 disabled:bg-gray-100"
              />
              <button 
                onClick={sendMessage}
                disabled={!isReady || !input.trim() || isTyping}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

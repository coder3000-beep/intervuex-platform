import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Mic, Square } from 'lucide-react';

const AnswerRecorder = ({ questionType, onSubmit, isSubmitting }) => {
  const [answer, setAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = true; // Keep listening
      recognitionRef.current.interimResults = true; // Show interim results
      recognitionRef.current.lang = 'en-US';

      // Handle results
      recognitionRef.current.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        // Update answer with final transcript
        if (finalTranscript) {
          setAnswer(prev => prev + finalTranscript);
        }
      };

      // Handle errors
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          console.log('No speech detected, continuing to listen...');
        } else if (event.error === 'not-allowed') {
          alert('Microphone access denied. Please allow microphone access.');
          setIsListening(false);
        } else {
          console.error('Speech recognition error:', event.error);
        }
      };

      // Handle end
      recognitionRef.current.onend = () => {
        if (isListening) {
          // Restart if still supposed to be listening
          try {
            recognitionRef.current.start();
          } catch (error) {
            console.error('Error restarting recognition:', error);
          }
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening]);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting recognition:', error);
      alert('Could not start speech recognition. Please try again.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim()) {
      // Stop listening before submitting
      if (isListening) {
        stopListening();
      }
      onSubmit(answer);
      setAnswer('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Your Answer</h3>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here or click the microphone to speak..."
          className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          required
          disabled={isSubmitting}
        />

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              {answer.length} characters
            </p>
            
            {/* Real-time Voice Recognition Button */}
            {!isListening ? (
              <button
                type="button"
                onClick={startListening}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                title="Click to start speaking - text will appear as you talk"
              >
                <Mic className="w-5 h-5" />
                Start Speaking
              </button>
            ) : (
              <button
                type="button"
                onClick={stopListening}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 animate-pulse"
                title="Click to stop listening"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
                <Mic className="w-5 h-5" />
                Listening...
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !answer.trim()}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Submit Answer
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>💡 Real-Time Voice Input:</strong> Click "Start Speaking" and your words will appear as you talk! 
          You can edit the text anytime. Click "Listening..." to stop.
        </p>
        {isListening && (
          <div className="mt-2 flex items-center gap-2 text-green-700">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-semibold">Microphone is active - speak now!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnswerRecorder;

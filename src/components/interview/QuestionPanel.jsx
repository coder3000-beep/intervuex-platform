import { HelpCircle, Code, MessageSquare, Briefcase } from 'lucide-react';

const QuestionPanel = ({ question, questionNumber }) => {
  const getQuestionIcon = (type) => {
    switch(type) {
      case 'coding':
        return <Code className="w-6 h-6 text-blue-600" />;
      case 'technical':
        return <HelpCircle className="w-6 h-6 text-purple-600" />;
      case 'scenario':
        return <Briefcase className="w-6 h-6 text-green-600" />;
      default:
        return <MessageSquare className="w-6 h-6 text-orange-600" />;
    }
  };

  const getQuestionTypeLabel = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          {getQuestionIcon(question.type)}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">
              Question {questionNumber}
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-semibold rounded-full">
              {getQuestionTypeLabel(question.type)}
            </span>
            {question.difficulty && (
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {question.question}
          </h2>

          {question.context && (
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <p className="text-gray-700">{question.context}</p>
            </div>
          )}

          {question.hints && question.hints.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Hints:</p>
              <ul className="list-disc list-inside space-y-1">
                {question.hints.map((hint, index) => (
                  <li key={index} className="text-sm text-gray-600">{hint}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPanel;
